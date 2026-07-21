// Code-first placeholder implementation for #1787.
// DB persistence + Prisma models are TODO.

import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { PrismaClient } from '@prisma/client';
import { generateQrCodeImageBuffer, buildVerificationUrl } from '../services/certificates/qrGenerator.js';
import { renderCertificatePdf } from '../services/certificates/certificatePdfGenerator.js';
import { uploadCertificatePdfToS3, uploadQrCodeToS3, downloadCertificatePdfFromS3 } from '../services/certificates/s3Storage.js';
import { buildBadgeAssertion } from '../services/certificates/openBadgesGenerator.js';

const prisma = new PrismaClient();

// --- Helpers ---
function buildCertificateCode({ userId, eventId }) {
  // NOTE: final PR should use DB uniqueness constraints.
  return crypto
    .createHash('sha256')
    .update(`${userId}:${eventId}:${Date.now()}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();
}

// --- Controllers ---
export async function verifyCertificate(req, res) {
  const { code } = req.params;

  try {
    const certificate = await prisma.certificate.findUnique({
      where: { code },
      include: { user: true },
    });

    if (!certificate) {
      return sendError(req, res, 'Certificate not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, {
      certificate: {
        code: certificate.code,
        attendeeName: certificate.attendeeName || certificate.user?.name,
        eventName: certificate.eventName,
        date: certificate.date.toISOString().slice(0, 10),
        completionCriteria: certificate.completionCriteria,
        status: certificate.status,
        verified: certificate.verified,
        verifiedAt: certificate.verifiedAt,
        expiresAt: certificate.expiresAt,
        pdfUrl: certificate.pdfUrl,
        qrUrl: certificate.qrUrl,
      },
    });
  } catch (error) {
    return sendError(req, res, 'Error verifying certificate', 500, 'VERIFICATION_ERROR');
  }
}

export async function getMyCertificates(req, res) {
  const userId = req.user?.id;
  if (!userId) return sendError(req, res, 'Unauthorized', 401, 'UNAUTHORIZED');

  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
    });
    return sendSuccess(res, { certificates });
  } catch (error) {
    return sendError(req, res, 'Failed to fetch certificates', 500);
  }
}

export async function downloadCertificatePdf(req, res) {
  // TODO: stream from S3
  return sendError(req, res, 'PDF download not implemented yet (S3 + storage layer TODO).', 501, 'NOT_IMPLEMENTED');
}

export async function getOpenBadge(req, res) {
  const { id } = req.params;

  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!certificate) return sendError(req, res, 'Certificate not found', 404, 'NOT_FOUND');

    const verifyUrl = buildVerificationUrl({ code: certificate.code });
    const assertion = buildBadgeAssertion({
      id: certificate.id,
      badgeId: 'default-badge-class',
      recipient: {
        email: certificate.user?.email || 'unknown@example.com',
        name: certificate.attendeeName || certificate.user?.name,
      },
      verificationUrl: verifyUrl,
      issuedOn: certificate.date.toISOString(),
    });

    return sendSuccess(res, {
      id,
      openBadges: assertion,
    });
  } catch (error) {
    return sendError(req, res, 'Failed to generate OpenBadge assertion', 500);
  }
}

export async function getCertificateVerificationShare(req, res) {
  // TODO: generate proper share URLs containing certificate verify route.
  const { id } = req.params;
  const verifyUrl = `${process.env.PUBLIC_APP_URL || ''}/certificates/verify/${id}`;

  return sendSuccess(res, {
    id,
    linkedin: {
      shareUrl: verifyUrl,
    },
    twitter: {
      text: 'I earned a digital badge!',
      shareUrl: verifyUrl,
    },
    embeddableHtml: `<div data-badge-id=\"${id}\"></div>`,
  });
}

// Admin issuance trigger (placeholder)
export async function issueCertificates(req, res) {
  const body = req.body || {};
  const eventId = body.eventId;
  const attendeeIds = Array.isArray(body.attendeeIds) ? body.attendeeIds : [];

  if (!eventId || attendeeIds.length === 0) {
    return sendError(req, res, 'eventId and attendeeIds[] are required', 400, 'VALIDATION_ERROR');
  }

  try {
    const issued = [];
    for (const userId of attendeeIds) {
      const code = buildCertificateCode({ userId, eventId });

      const verifyUrl = buildVerificationUrl({ code });
      const qrBuffer = await generateQrCodeImageBuffer({ url: verifyUrl });
      const pdfBuffer = await renderCertificatePdf({ variables: { code, verifyUrl } });

      const qrUpload = await uploadQrCodeToS3({ buffer: qrBuffer, key: `certificates/qr-${code}.png` });
      const pdfUpload = await uploadCertificatePdfToS3({ buffer: pdfBuffer, key: `certificates/${code}.pdf` });

      const cert = await prisma.certificate.create({
        data: {
          code,
          userId,
          eventId,
          status: 'ISSUED',
          qrUrl: qrUpload.url || qrUpload.key,
          pdfUrl: pdfUpload.url || pdfUpload.key,
        },
      });
      issued.push(cert);
    }
    return sendSuccess(res, { issued });
  } catch (error) {
    return sendError(req, res, 'Failed to issue certificates', 500);
  }
}
