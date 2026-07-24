// Admin controllers for #1787

import { sendSuccess, sendError } from '../utils/responseHelper.js';

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
  // TODO: update DB verification status + audit log.
  return sendSuccess(res, { id, verified: true });
}

export async function adminRevokeCertificate(req, res) {
  const { id } = req.params;
  // TODO: update DB verification status + audit log.
  return sendSuccess(res, { id, revoked: true });
}

import * as certTemplatesRepo from '../repositories/certificateTemplatesRepository.js';

export async function adminGetTemplates(req, res) {
  try {
    const templates = await certTemplatesRepo.getTemplates();
    return sendSuccess(res, { templates });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch templates');
  }
}

export async function adminSaveTemplate(req, res) {
  try {
    const template = await certTemplatesRepo.saveTemplate(req.body);
    return sendSuccess(res, { template });
  } catch (error) {
    return sendError(res, 500, 'Failed to save template');
  }
}

