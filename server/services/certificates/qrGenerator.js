// Placeholder QR generator.

import QRCode from 'qrcode';

export function buildVerificationPayload({ code }) {
  return {
    type: 'certificate_verification',
    code,
  };
}

export function buildVerificationUrl({ baseUrl, code }) {
  return `${baseUrl || process.env.PUBLIC_APP_URL || ''}/certificates/verify/${encodeURIComponent(code)}`;
}

export async function generateQrCodeImageBuffer({ url }) {
  try {
    return await QRCode.toBuffer(url, {
      type: 'png',
      width: 256,
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}
