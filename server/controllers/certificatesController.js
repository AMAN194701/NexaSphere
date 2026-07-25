import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { studentUsersRepository } from '../repositories/studentUsersRepository.js';
import { eventsRepository } from '../repositories/eventsRepository.js';
import { sendEmail } from '../services/emailService.js';
import { renderCertificatePdf } from '../services/certificates/certificatePdfGenerator.js';
import { uploadCertificatePdfToS3 } from '../services/certificates/s3Storage.js';
import { PrismaClient } from '@prisma/client';
import { generateQrCodeImageBuffer, buildVerificationUrl } from '../services/certificates/qrGenerator.js';
import { renderCertificatePdf } from '../services/certificates/certificatePdfGenerator.js';
import { uploadCertificatePdfToS3, uploadQrCodeToS3, downloadCertificatePdfFromS3 } from '../services/certificates/s3Storage.js';
import { buildBadgeAssertion } from '../services/certificates/openBadgesGenerator.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Helpers ---
function buildCertificateCode({ userId, eventId }) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${eventId}:${Date.now()}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();
}

function buildVerifyUrl(code) {
  const baseUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || '';
  return baseUrl ? `${baseUrl.replace(/\/$/, '')}/certificates/verify/${code}` : '';
}

// --- Controllers ---
export async function verifyCertificate(req, res) {
  const { code } = req.params;

  // TODO: lookup certificate by code.
  // Placeholder response shape per acceptance criteria.
  return sendSuccess(res, {
  return res.json({
    ok: true,
    certificate: {
      code,
      attendeeName: 'Demo Attendee',
      eventName: 'Demo Workshop',
      date: new Date().toISOString().slice(0, 10),
      completionCriteria: 'Completed workshop requirements',
      status: 'PENDING',
      verified: false,
      verifiedAt: null,
      expiresAt: null,
    },
  });
}

export async function getMyCertificates(req, res) {
  // TODO: use req.studentUser / DB
  return sendSuccess(res, {
  return res.json({
    certificates: [],
  });
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
  return res
    .status(501)
    .json({ error: 'PDF download not implemented yet (S3 + storage layer TODO).' });
}

export async function getOpenBadge(req, res) {
  const { id } = req.params;
  return sendSuccess(res, {
  return res.json({
    id,
    openBadges: {
      '@context': 'https://w3.org/2018/credentials/v1',
      type: 'OpenBadgeCredential',
      badge: { name: 'Demo Badge' },
      // assertion evidence TODO
    },
  });

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
  const { id } = req.params;
  const verifyUrl = `${process.env.PUBLIC_APP_URL || 'https://nexasphere.com'}/verify/cert/${id}`;

  return sendSuccess(res, {
  return res.json({
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
    return res.status(400).json({ error: 'eventId and attendeeIds[] are required' });
  }

  const event = await eventsRepository.getById(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  return sendSuccess(res, { issued });
  return res.json({ ok: true, issued });
  const issued = [];
  const skipped = [];

  for (const userId of attendeeIds) {
    const attendee = await studentUsersRepository.findById(userId);
    if (!attendee?.email) {
      skipped.push({ userId, reason: 'missing attendee email' });
      continue;
    }

    const code = buildCertificateCode({ userId, eventId });
    const verifyUrl = buildVerifyUrl(code);
    const pdfBuffer = await renderCertificatePdf({
      event,
      attendee,
      code,
      issuedAt: new Date().toISOString(),
      verifyUrl,
    });

    let storage = { key: null, url: '' };
    const certificateKey = `certificates/${eventId}/${code}.pdf`;
    try {
      storage = await uploadCertificatePdfToS3({ buffer: pdfBuffer, key: certificateKey });
    } catch (err) {
      storage = { key: certificateKey, url: '' };
    }

    const emailResult = await sendEmail({
      to: attendee.email,
      subject: `Your NexaSphere certificate for ${event.name}`,
      templateName: 'attendance-confirmation',
      data: {
        name: attendee.full_name || attendee.email,
        eventName: event.name,
        certificateCode: code,
        verifyUrl: verifyUrl || storage.url || '',
      },
      attachments: [
        {
          filename: `${event.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${code}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    issued.push({
      userId,
      email: attendee.email,
      eventId,
      eventName: event.name,
      code,
      status: emailResult.success ? 'ISSUED_AND_EMAILED' : 'ISSUED',
      certificateUrl: storage.url || null,
      verifyUrl: verifyUrl || null,
    });
  }

  return res.json({ ok: true, eventId, eventName: event.name, issued, skipped });
  try {
    const issued = [];
    for (const userId of attendeeIds) {
      const code = buildCertificateCode({ userId, eventId });

      const verifyUrl = buildVerificationUrl({ code });
      const qrBuffer = await generateQrCodeImageBuffer({ url: verifyUrl });
      const pdfBuffer = await renderCertificatePdf({ variables: { code, verifyUrl } });

      const qrUpload = await uploadQrCodeToS3({ buffer: qrBuffer, key: `certificates/qr-${code}.png` });
      const pdfUpload = await uploadCertificatePdfToS3({ buffer: pdfBuffer, key: `certificates/${code}.pdf` });

  try {
    const issued = [];
    for (const userId of attendeeIds) {
      const code = buildCertificateCode({ userId, eventId });

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
