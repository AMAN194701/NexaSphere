/**
 * Admin Dashboard Routes
 * Provides admin-only endpoints for membership data and session info.
 */
import { tracedFetch } from '../config/appContext.js';
import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { supabaseBreaker, HAS_SUPABASE } from '../storage/supabaseClient.js';
import {
  validateConfigChange,
  createChangeHistory,
  rollbackConfig,
} from '../utils/configApproval.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';
import { CircuitBreaker, circuitBreakerRegistry } from '../utils/circuitBreaker.js';
import {
  runIntegrityCheck,
  detectCorruption,
  generateRecoveryRecommendation,
  createRecoveryAuditLog,
} from '../utils/dataIntegrityValidator.js';
import {
  activateReadOnlyMode,
  deactivateReadOnlyMode,
  getReadOnlyStatus,
  createIncidentLog,
} from '../routes/readOnlyMode.js';
import {
  activateReadOnlyMode as activateReadOnlyMode2,
  deactivateReadOnlyMode as deactivateReadOnlyMode2,
  getReadOnlyStatus as getReadOnlyStatus2,
  createIncidentLog as createIncidentLog2,
} from '../utils/readOnlyMode.js';
import {
  getServiceStatus,
  getIncidentTimeline,
  getMaintenanceSchedule,
  getHistoricalUptime,
  getSubscriberNotifications,
} from '../utils/serviceStatus.js';
import {
  runConsistencyCheck,
  getSynchronizationStatus,
  detectConflicts,
  generateIntegrityReport,
  getConsistencyAlerts,
} from '../utils/consistencyVerifier.js';

const router = Router();
const adminAuth = [apiRateLimiter, adminAuthMiddleware.requireAdmin];

/**
 * Raw membership fetch helper, wrapped in a circuit breaker to protect
 * against repeated failures from the upstream Google Apps Script endpoint.
 */
async function _rawMembershipFetch(scriptUrl, secret) {
  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getResponses', token: secret }),
  });
  if (!response.ok) {
    throw new Error(`Google Apps Script returned ${response.status}`);
  }
  return response.json();
}

const membershipBreaker = circuitBreakerRegistry.register(
  'membership-gas',
  new CircuitBreaker(_rawMembershipFetch, {
    name: 'membership-gas',
    failureThreshold: 3,
    successThreshold: 2,
    coolDownPeriod: 15000,
    maxCoolDownPeriod: 120000,
  })
);

/**
 * GET /membership — Fetch membership responses from Supabase (primary source of truth).
 * Falls back to Google Apps Script if Supabase is unavailable.
 * This ensures form submissions are always visible to admins even when
 * Google Sheets writes fail (quota, network, etc.).
 */
router.get('/membership', adminAuth, async (req, res) => {
  // Primary: Read from Supabase (source of truth)
  if (HAS_SUPABASE) {
    try {
      const data = await supabaseBreaker.execute('form_submissions?form_type=eq.membership&order=created_at.desc', {
        method: 'GET',
      });
      const responses = (data || []).map((row) => ({
        submittedAt: row.created_at,
        formType: row.form_type,
        fullName: row.full_name,
        collegeEmail: row.college_email,
        whatsapp: row.whatsapp,
        ...row.payload,
      }));
      return res.json({ responses });
    } catch (err) {
      if (err.code === 'CIRCUIT_OPEN') {
        console.warn('[Membership] Supabase circuit breaker is OPEN, falling back to Google Apps Script');
      } else {
        console.error('[Membership] Failed to fetch from Supabase:', err.message);
      }
      // Fall through to Google Apps Script fallback
    }
  }

  // Fallback: Google Apps Script (legacy path)
  const scriptUrl = process.env.MEMBERSHIP_SCRIPT_URL;
  const secret = process.env.MEMBERSHIP_SECRET;

  if (!scriptUrl || !secret) {
    return res.json({ responses: [] });
  }

  try {
    const data = await membershipBreaker.execute(scriptUrl, secret);
    return res.json({ responses: data.responses || [] });
  } catch (err) {
    if (err.code === 'CIRCUIT_OPEN') {
      console.warn('[Membership] Google Apps Script circuit breaker is OPEN, returning empty responses');
      return res.json({ responses: [] });
    }
    console.error('[Membership] Failed to fetch responses from Google Apps Script:', err.message);
    return res.status(500).json({ error: 'Failed to fetch membership responses' });
  }
});

/**
 * GET /me — Returns the authenticated admin's username.
 */
router.get('/me', adminAuth, (req, res) => {
  return res.json({ username: req.adminSession.username });
});

/**
 * POST /api/admin/config-review
 * Validate critical configuration changes
 */
router.post('/api/admin/config-review', adminAuth, (req, res) => {
  const validation = validateConfigChange(req.body);

  const history = createChangeHistory(req.body);

  const rollback = rollbackConfig(req.body);

  return res.json({
    success: true,
    validation,
    history,
    rollback,
  });
});

router.get('/api/admin/database-health', adminAuth, (req, res) => {
  res.json(runIntegrityCheck());
});

router.get('/api/admin/database-corruption', adminAuth, (req, res) => {
  res.json(detectCorruption());
});

router.get('/api/admin/database-recovery', adminAuth, (req, res) => {
  res.json(generateRecoveryRecommendation());
});

router.get('/api/admin/database-audit-log', adminAuth, (req, res) => {
  res.json(createRecoveryAuditLog());
});

router.get('/api/admin/read-only-status', adminAuth, (req, res) => {
  res.json(getReadOnlyStatus());
});

router.post('/api/admin/read-only-enable', adminAuth, (req, res) => {
  res.json(activateReadOnlyMode());
});

router.post('/api/admin/read-only-disable', adminAuth, (req, res) => {
  res.json(deactivateReadOnlyMode());
});

router.get('/api/admin/read-only-log', adminAuth, (req, res) => {
  res.json(createIncidentLog());
});

router.get('/api/admin/read-only-status', adminAuth, (req, res) => {
  res.json(getReadOnlyStatus());
});

router.post('/api/admin/read-only-enable', adminAuth, (req, res) => {
  res.json(activateReadOnlyMode());
});

router.post('/api/admin/read-only-disable', adminAuth, (req, res) => {
  res.json(deactivateReadOnlyMode());
});

router.get('/api/admin/read-only-log', adminAuth, (req, res) => {
  res.json(createIncidentLog());
});

router.get('/api/admin/service-status', adminAuth, (req, res) => {
  res.json(getServiceStatus());
});

router.get('/api/admin/incidents', adminAuth, (req, res) => {
  res.json(getIncidentTimeline());
});

router.get('/api/admin/maintenance', adminAuth, (req, res) => {
  res.json(getMaintenanceSchedule());
});

router.get('/api/admin/uptime-report', adminAuth, (req, res) => {
  res.json(getHistoricalUptime());
});

router.get('/api/admin/status-subscribers', adminAuth, (req, res) => {
  res.json(getSubscriberNotifications());
});

router.get('/api/admin/consistency-check', adminAuth, (req, res) => {
  res.json(runConsistencyCheck());
});

router.get('/api/admin/sync-status', adminAuth, (req, res) => {
  res.json(getSynchronizationStatus());
});

router.get('/api/admin/conflicts', adminAuth, (req, res) => {
  res.json(detectConflicts());
});

router.get('/api/admin/integrity-report', adminAuth, (req, res) => {
  res.json(generateIntegrityReport());
});

router.get('/api/admin/consistency-alerts', adminAuth, (req, res) => {
  res.json(getConsistencyAlerts());
});

router.get('/api/admin/dependency-report', adminAuth, async (req, res) => {
  // dependency monitoring report
});

router.get('/api/admin/security-analytics', adminAuth, async (req, res) => {
  res.json({
    blockedIPs,
    riskScores,
    suspiciousRequests,
  });
});

export default router;
