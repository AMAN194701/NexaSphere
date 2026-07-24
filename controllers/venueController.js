import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { seatLockService } from '../services/seatLockService.js';
import { prisma } from '../config/db.js'; // Adjust path to your Prisma client export

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      const status = e.status || 500;
      sendError(req, res, e?.message || 'Internal server error', status);
    });
}

/**
 * @desc    Create a new venue layout template (Admin)
 * @route   POST /api/admin/venues
 */
export const createVenueLayout = wrapAsync(async (req, res) => {
  const { name, gridData } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return sendError(req, res, 'Venue name is required', 400, 'VALIDATION_ERROR');
  }

  if (!gridData || typeof gridData !== 'object') {
    return sendError(req, res, 'Valid gridData JSON object is required', 400, 'VALIDATION_ERROR');
  }

  // Basic grid shape validation
  if (!gridData.rows || !gridData.cols || !Array.isArray(gridData.matrix)) {
    return sendError(
      req,
      res,
      'gridData must include rows, cols, and a matrix array',
      400,
      'INVALID_GRID_STRUCTURE'
    );
  }

  const venue = await prisma.venueLayout.create({
    data: {
      name: name.trim(),
      gridData,
    },
  });

  return sendSuccess(res, { venue }, 201);
});

/**
 * @desc    List all venue layout templates (Admin)
 * @route   GET /api/admin/venues
 */
export const listVenueLayouts = wrapAsync(async (req, res) => {
  const venues = await prisma.venueLayout.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      gridData: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { events: true },
      },
    },
  });

  return sendSuccess(res, { venues });
});

/**
 * @desc    Get a single venue layout by ID (Admin)
 * @route   GET /api/admin/venues/:id
 */
export const getVenueLayoutById = wrapAsync(async (req, res) => {
  const { id } = req.params;

  const venue = await prisma.venueLayout.findUnique({
    where: { id },
  });

  if (!venue) {
    return sendError(req, res, 'Venue layout not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, { venue });
});

/**
 * @desc    Update a venue layout template (Admin)
 * @route   PUT /api/admin/venues/:id
 */
export const updateVenueLayout = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { name, gridData } = req.body;

  const existing = await prisma.venueLayout.findUnique({ where: { id } });
  if (!existing) {
    return sendError(req, res, 'Venue layout not found', 404, 'NOT_FOUND');
  }

  const updatedVenue = await prisma.venueLayout.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(gridData && { gridData }),
    },
  });

  return sendSuccess(res, { venue: updatedVenue });
});

/**
 * @desc    Delete a venue layout template (Admin)
 * @route   DELETE /api/admin/venues/:id
 */
export const deleteVenueLayout = wrapAsync(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.venueLayout.findUnique({ where: { id } });
  if (!existing) {
    return sendError(req, res, 'Venue layout not found', 404, 'NOT_FOUND');
  }

  await prisma.venueLayout.delete({ where: { id } });

  return sendSuccess(res, { message: 'Venue layout deleted successfully' });
});

/**
 * @desc    Get event seating layout & live seat availability matrix (Public/Attendee)
 * @route   GET /api/content/events/:eventId/seats
 */
export const getEventSeatMatrix = wrapAsync(async (req, res) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      venueLayout: true,
      registrations: {
        where: {
          seatCode: { not: null },
          status: { not: 'CANCELLED' },
        },
        select: { seatCode: true },
      },
    },
  });

  if (!event) {
    return sendError(req, res, 'Event not found', 404, 'NOT_FOUND');
  }

  if (!event.venueLayout) {
    return sendSuccess(res, {
      hasSeatingLayout: false,
      message: 'This event does not have an assigned seating layout.',
    });
  }

  // Extract confirmed seat codes from DB
  const bookedSeats = new Set(
    event.registrations.map((r) => r.seatCode).filter(Boolean)
  );

  // Fetch temporary active Redis locks (5-minute checkout holds)
  const lockedSeats = await seatLockService.getLockedSeatsForEvent(eventId);

  return sendSuccess(res, {
    hasSeatingLayout: true,
    eventId: event.id,
    venueName: event.venueLayout.name,
    gridData: event.venueLayout.gridData,
    availability: {
      bookedSeats: Array.from(bookedSeats),
      lockedSeats,
    },
  });
});