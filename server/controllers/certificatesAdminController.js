// Admin controllers for #1787

import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function adminGetCertificateById(req, res) {
  const { id } = req.params;
  return sendSuccess(res, {
    id,
    certificate: {
      id,
      verified: false,
      revoked: false,
    },
  });
}

export async function adminVerifyCertificate(req, res) {
  const { id } = req.params;
  const adminId = req.user?.id || 'admin-system';

  try {
    await prisma.$transaction([
      prisma.certificate.update({
        where: { id },
        data: {
          verified: true,
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'APPROVE',
          entity: 'Certificate',
          entityId: id,
          newValues: { status: 'VERIFIED', verified: true },
        },
      }),
    ]);

    return sendSuccess(res, { id, verified: true });
  } catch (error) {
    return sendError(req, res, 'Failed to verify certificate', 500, 'VERIFICATION_ERROR');
  }
}

export async function adminRevokeCertificate(req, res) {
  const { id } = req.params;
  const adminId = req.user?.id || 'admin-system';

  try {
    await prisma.$transaction([
      prisma.certificate.update({
        where: { id },
        data: {
          verified: false,
          revoked: true,
          status: 'REJECTED',
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'REJECT',
          entity: 'Certificate',
          entityId: id,
          newValues: { status: 'REJECTED', revoked: true },
        },
      }),
    ]);

    return sendSuccess(res, { id, revoked: true });
  } catch (error) {
    return sendError(req, res, 'Failed to revoke certificate', 500, 'REVOCATION_ERROR');
  }
}
