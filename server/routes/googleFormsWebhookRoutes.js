import { Router } from 'express';
import { handleGoogleFormsWebhook } from '../controllers/googleFormsWebhookController.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Endpoint for receiving webhook payload from Google Apps Script
router.post('/google-forms', apiRateLimiter, handleGoogleFormsWebhook);

export default router;
