import crypto from 'crypto';

/**
 * Generates a cryptographically secure random signing secret for a webhook endpoint.
 */
export function generateSigningSecret(): string {
  return 'whsec_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Computes the HMAC SHA-256 signature of a given string payload using the secret.
 */
export function calculateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
