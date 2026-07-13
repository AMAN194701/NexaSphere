import crypto from 'crypto';
import { studentUsersRepository } from '../repositories/studentUsersRepository.js';
import { eventsRepository } from '../repositories/eventsRepository.js';
import { sendEmail } from '../services/emailService.js';
import { renderCertificatePdf } from '../services/certificates/certificatePdfGenerator.js';
import { uploadCertificatePdfToS3 } from '../services/certificates/s3Storage.js';

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
  return res.json({
    certificates: [],
  });
}

export async function downloadCertificatePdf(req, res) {
  // TODO: stream from S3
  return res
    .status(501)
    .json({ error: 'PDF download not implemented yet (S3 + storage layer TODO).' });
}

export async function getOpenBadge(req, res) {
  // TODO: return OpenBadges compliant JSON from stored badge assertion.
  const { id } = req.params;
  return res.json({
    id,
    openBadges: {
      '@context': 'https://w3.org/2018/credentials/v1',
      type: 'OpenBadgeCredential',
      badge: { name: 'Demo Badge' },
      // assertion evidence TODO
    },
  });
}

export async function getCertificateVerificationShare(req, res) {
  // TODO: generate proper share URLs containing certificate verify route.
  const { id } = req.params;
  const verifyUrl = `${process.env.PUBLIC_APP_URL || ''}/certificates/verify/${id}`;

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
  // Expected input: { eventId, attendeeIds: [...] , expirationDays? }
  const body = req.body || {};
  const eventId = body.eventId;
  const attendeeIds = Array.isArray(body.attendeeIds) ? body.attendeeIds : [];

  if (!eventId || attendeeIds.length === 0) {
    return res.status(400).json({ error: 'eventId and attendeeIds[] are required' });
  }

  const event = await eventsRepository.getById(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

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
}
