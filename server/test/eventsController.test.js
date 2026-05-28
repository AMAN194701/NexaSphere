import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { listEvents, adminListEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent } from '../controllers/eventsController.js';
import { eventsService } from '../services/eventsService.js';

const app = express();
app.use(express.json());
app.get('/events', listEvents);
app.get('/admin/events', adminListEvents);
app.post('/admin/events', adminCreateEvent);
app.put('/admin/events/:id', adminUpdateEvent);
app.delete('/admin/events/:id', adminDeleteEvent);

describe('eventsController', () => {
  beforeEach(() => {
    eventsService.listEvents = jest.fn();
    eventsService.createEvent = jest.fn();
    eventsService.updateEvent = jest.fn();
    eventsService.deleteEvent = jest.fn();
    jest.clearAllMocks();
  });

  describe('listEvents', () => {
    it('returns 200 with paginated events', async () => {
      eventsService.listEvents.mockResolvedValue({ rows: [{ id: '1' }], total: 1 });
      const res = await request(app).get('/events?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.events).toEqual([{ id: '1' }]);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('adminCreateEvent', () => {
    it('returns 201 on success', async () => {
      eventsService.createEvent.mockResolvedValue({ id: '2' });
      const res = await request(app).post('/admin/events').send({ name: 'New Event' });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.event.id).toBe('2');
    });
  });

  describe('adminUpdateEvent', () => {
    it('returns 404 if not found', async () => {
      eventsService.updateEvent.mockResolvedValue(null);
      const res = await request(app).put('/admin/events/99').send({ name: 'Updated' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });

    it('returns 200 on success', async () => {
      eventsService.updateEvent.mockResolvedValue({ id: '1', name: 'Updated' });
      const res = await request(app).put('/admin/events/1').send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.event.name).toBe('Updated');
    });
  });

  describe('adminDeleteEvent', () => {
    it('returns 404 if not found', async () => {
      eventsService.deleteEvent.mockResolvedValue(false);
      const res = await request(app).delete('/admin/events/99');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });

    it('returns 200 on success', async () => {
      eventsService.deleteEvent.mockResolvedValue(true);
      const res = await request(app).delete('/admin/events/1');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});
