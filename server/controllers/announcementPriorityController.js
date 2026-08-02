import { announcementPriorityService } from "../services/announcementPriorityService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import logger from "../utils/logger.js";

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = announcementPriorityService.getAnnouncements();

    return sendSuccess(res, { announcements });
  } catch (error) {
    logger.error('Announcement controller error', { error: error.message });

    return sendError(req, res, "Failed to fetch announcements", 500, 'INTERNAL_ERROR');

export const getAnnouncements = async (req, res) => {
  try {
    const announcements =
      announcementPriorityService.getAnnouncements();

    return res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = announcementPriorityService.createAnnouncement(req.body);

    return sendSuccess(res, { announcement }, 201);
  } catch (error) {
    logger.error('Announcement controller error', { error: error.message });

    return sendError(req, res, "Failed to create announcement", 500, 'INTERNAL_ERROR');
    const announcement =
      announcementPriorityService.createAnnouncement(req.body);

    return res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

export const updatePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const announcement = announcementPriorityService.updatePriority(id, priority);

    if (!announcement) {
      return sendError(req, res, "Announcement not found", 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { announcement });
  } catch (error) {
    logger.error('Announcement controller error', { error: error.message });

    return sendError(req, res, "Failed to update priority", 500, 'INTERNAL_ERROR');
    const announcement =
      announcementPriorityService.updatePriority(
        id,
        priority
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update priority",
    });
  }
};

export const pinAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { pinned } = req.body;

    const announcement = announcementPriorityService.pinAnnouncement(id, pinned);

    if (!announcement) {
      return sendError(req, res, "Announcement not found", 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { announcement });
  } catch (error) {
    logger.error('Announcement controller error', { error: error.message });

    return sendError(req, res, "Failed to pin announcement", 500, 'INTERNAL_ERROR');
    const announcement =
      announcementPriorityService.pinAnnouncement(
        id,
        pinned
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to pin announcement",
    });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const announcement = announcementPriorityService.markAnnouncementRead(id, userId);

    if (!announcement) {
      return sendError(req, res, "Announcement not found", 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { announcement });
  } catch (error) {
    logger.error('Announcement controller error', { error: error.message });

    return sendError(req, res, "Failed to mark announcement as read", 500, 'INTERNAL_ERROR');
    const announcement =
      announcementPriorityService.markAnnouncementRead(
        id,
        userId
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark announcement as read",
    });
  }
};

export const analytics = async (req, res) => {
  try {
    const data = announcementPriorityService.getAnalytics();

    return sendSuccess(res, { analytics: data });
  } catch (error) {
    logger.error('Announcement controller error', { error: error.message });

    return sendError(req, res, "Failed to fetch analytics", 500, 'INTERNAL_ERROR');
  }
};
    const data =
      announcementPriorityService.getAnalytics();

    return res.json({
      success: true,
      analytics: data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};
