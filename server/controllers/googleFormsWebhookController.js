import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { usersRepository } from '../repositories/usersRepository.js';
import { getSettings } from '../controllers/settingsController.js';
import logger from '../utils/logger.js';

/**
 * Handles incoming webhooks from Google Forms (via Google Apps Script).
 * The payload is expected to contain form responses (e.g., full_name, email).
 */
export async function handleGoogleFormsWebhook(req, res) {
  try {
    const { token, responses } = req.body;
    
    // Validate secret token against settings
    const settings = await getSettings();
    const expectedSecret = settings.google_forms_webhook_secret;

    if (!expectedSecret) {
      logger.warn('[Google Forms Webhook] Webhook secret not configured in settings.');
      return sendError(req, res, 'Webhook is not configured on the server', 503, 'SERVICE_UNAVAILABLE');
    }

    if (token !== expectedSecret) {
      logger.warn('[Google Forms Webhook] Invalid webhook token received.');
      return sendError(req, res, 'Invalid webhook token', 401, 'UNAUTHORIZED');
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return sendSuccess(res, { message: 'No responses to process', created: 0 });
    }

    let createdCount = 0;

    for (const response of responses) {
      // Basic validation of the response fields
      const email = response.email || response.collegeEmail || response.college_email;
      const fullName = response.fullName || response.full_name || response.name;

      if (!email) {
        logger.warn('[Google Forms Webhook] Skipping response without email', response);
        continue;
      }

      // Duplicate detection
      const existingUser = await usersRepository.getUserByEmail(email);
      if (existingUser) {
        logger.info(`[Google Forms Webhook] User already exists for email: ${email}`);
        continue;
      }

      // Auto-create user record
      try {
        await usersRepository.createUser({
          username: email, // Default username is email
          display_name: fullName || email.split('@')[0],
          email: email,
          role: 'member',
        });
        createdCount++;
      } catch (userErr) {
        logger.error(`[Google Forms Webhook] Failed to create user for ${email}`, { error: userErr.message });
      }
    }

    return sendSuccess(res, { message: 'Webhook processed successfully', created: createdCount }, 201);
  } catch (error) {
    logger.error('[Google Forms Webhook] Error processing webhook', { error: error.message });
    return sendError(req, res, 'Internal server error processing webhook', 500, 'INTERNAL_ERROR');
  }
}
