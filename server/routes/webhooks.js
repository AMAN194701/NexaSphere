import { Router } from 'express';
import { webhookService, WEBHOOK_EVENTS } from '../services/webhookService.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { protectedActionRateLimiter } from '../middleware/authRateLimiter.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';
import {
  createWebhookSchema,
  updateWebhookSchema,
} from '../validators/routes/webhooksSchemas.js';
import { auth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/events', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    sendSuccess(res, { data: WEBHOOK_EVENTS });
  } catch (error) {
    logger.error('Error fetching webhook events', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});
router.get(
  '/events',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireAdmin,
  async (req, res) => {
);

router.post('/', validate(createWebhookSchema), protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const webhook = await webhookService.createWebhook(req.body, req.user);
    sendSuccess(res, { data: webhook }, 201);
    const webhook = await webhookService.createWebhook(req.body, req.adminSession);
    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    const status = error.message.includes('HTTPS') || error.message.includes('event') ? 400 : 500;
    sendError(req, res, error.message, status, status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');
  }
});

router.get('/', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const webhooks = await webhookService.listWebhooks();
    sendSuccess(res, { data: webhooks });
  } catch (error) {
    logger.error('Error fetching webhooks', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

router.get('/:webhookId', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const webhook = await webhookService.getWebhookById(req.params.webhookId);
    sendSuccess(res, { data: webhook });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    sendError(req, res, error.message, status, status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  }
});

router.put('/:webhookId', validate(updateWebhookSchema), protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const webhook = await webhookService.updateWebhook(req.params.webhookId, req.body, req.user);
    sendSuccess(res, { data: webhook });
    const webhook = await webhookService.updateWebhook(req.params.webhookId, req.body, req.adminSession);
router.get('/events', auth('admin'), async (req, res) => {
  try {
    res.json({ success: true, data: WEBHOOK_EVENTS });
  } catch (error) {
    logger.error('Error fetching webhook events', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', auth('admin'), async (req, res) => {
  try {
    const webhook = await webhookService.createWebhook(req.body, req.user);
    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    const status = error.message.includes('HTTPS') || error.message.includes('event') ? 400 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.get('/', auth('admin'), async (req, res) => {
  try {
    const webhooks = await webhookService.listWebhooks();
    res.json({ success: true, data: webhooks });
  } catch (error) {
    logger.error('Error fetching webhooks', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:webhookId', auth('admin'), async (req, res) => {
  try {
    const webhook = await webhookService.getWebhookById(req.params.webhookId);
    res.json({ success: true, data: webhook });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.put('/:webhookId', auth('admin'), async (req, res) => {
  try {
    const webhook = await webhookService.updateWebhook(req.params.webhookId, req.body, req.user);
    res.json({ success: true, data: webhook });
  } catch (error) {
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('HTTPS')
        ? 400
        : 500;
    sendError(req, res, error.message, status, status === 404 ? 'NOT_FOUND' : status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');
  }
});

router.delete('/:webhookId', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    await webhookService.deleteWebhook(req.params.webhookId);
    sendSuccess(res, { message: 'Webhook deleted successfully' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    sendError(req, res, error.message, status, status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  }
});

router.post('/:webhookId/test', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const result = await webhookService.testWebhook(req.params.webhookId);
    sendSuccess(res, { data: result });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    sendError(req, res, error.message, status, status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  }
});

router.get('/:webhookId/deliveries', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
    res.status(status).json({ success: false, error: error.message });
  }
});

router.delete('/:webhookId', auth('admin'), async (req, res) => {
  try {
    await webhookService.deleteWebhook(req.params.webhookId);
    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.post('/:webhookId/test', auth('admin'), async (req, res) => {
  try {
    const result = await webhookService.testWebhook(req.params.webhookId);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.get('/:webhookId/deliveries', auth('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const deliveries = await webhookService.getWebhookDeliveries(req.params.webhookId, {
      limit,
      offset,
    });
    sendSuccess(res, { data: deliveries });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    sendError(req, res, error.message, status, status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  }
});

router.get('/:webhookId/stats', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const stats = await webhookService.getDeliveryStats(req.params.webhookId);
    sendSuccess(res, { data: stats });
  } catch (error) {
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

router.post('/deliveries/:deliveryId/replay', protectedActionRateLimiter, adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const result = await webhookService.replayDelivery(req.params.deliveryId);
    sendSuccess(res, { data: result });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    sendError(req, res, error.message, status, status === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR');
  }
});
router.get(
  '/:webhookId',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireAdmin,
  async (req, res) => {
);
router.put(
router.delete(
router.post(
  '/:webhookId/test',
  '/:webhookId/deliveries',
  '/:webhookId/stats',
  '/deliveries/:deliveryId/replay',
    res.json({ success: true, data: deliveries });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.get('/:webhookId/stats', auth('admin'), async (req, res) => {
  try {
    const stats = await webhookService.getDeliveryStats(req.params.webhookId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/deliveries/:deliveryId/replay', auth('admin'), async (req, res) => {
  try {
    const result = await webhookService.replayDelivery(req.params.deliveryId);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

export default router;
