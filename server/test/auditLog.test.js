import assert from 'node:assert/strict';
import test from 'node:test';
import { setWithDbOverride } from '../repositories/db.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { auditMonitoringService } from '../services/auditMonitoringService.js';
import { parseCSV } from '../utils/csvParser.js';

// Clean up DB overrides after each test
test.afterEach(() => {
  setWithDbOverride(null);
});

test('Audit Log Checksum and Tampering Detection', async () => {
  let insertedData = null;

  setWithDbOverride(async (fn) => {
    const mockClient = {
      query: async (sql, params) => {
        const sqlLower = sql.toLowerCase();
        if (sqlLower.includes('insert into audit_logs')) {
          insertedData = params;
          return { rows: [] };
        }
        return { rows: [] };
      },
      release: () => {},
    };
    return await fn(mockClient);
  });

  const logId = await auditLogRepository.insertAuditLog({
    adminId: 'test-admin',
    action: 'test-action',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    oldState: { x: 1 },
    newState: { x: 2 },
    resourceType: 'setting',
    resourceId: 'setting-abc',
    sessionId: 'session-xyz',
  });

  assert.ok(logId);
  // Verification checksum (param index 10 in query query) should be set
  assert.ok(insertedData[10]);

  // Now test verification verification
  setWithDbOverride(async (fn) => {
    const mockClient = {
      query: async (sql, params) => {
        return {
          rows: [
            {
              id: logId,
              admin_id: 'test-admin',
              action: 'test-action',
              ip_address: '192.168.1.1',
              user_agent: 'Mozilla/5.0',
              old_state: { x: 1 },
              new_state: { x: 2 },
              resource_type: 'setting',
              resource_id: 'setting-abc',
              session_id: 'session-xyz',
              hash_checksum: insertedData[10], // Correct checksum
            },
            {
              id: 'corrupted-uuid',
              admin_id: 'malicious-admin',
              action: 'malicious-action',
              ip_address: '1.2.3.4',
              user_agent: 'Curl',
              old_state: null,
              new_state: null,
              resource_type: 'user',
              resource_id: 'user-xyz',
              session_id: 'session-malicious',
              hash_checksum: 'wrong-checksum-hash', // Corrupted checksum
            },
          ],
        };
      },
      release: () => {},
    };
    return await fn(mockClient);
  });

  const corruptedIds = await auditLogRepository.verifyLogTampering();
  assert.equal(corruptedIds.length, 1);
  assert.equal(corruptedIds[0], 'corrupted-uuid');
});

test('Audit log queries mask emails and phone numbers before returning rows', async () => {
  setWithDbOverride(async (fn) => {
    const mockClient = {
      query: async (sql) => {
        if (sql.toLowerCase().includes('select * from audit_logs')) {
          return {
            rows: [
              {
                id: 'log-1',
                admin_id: 'admin-1',
                action: 'update_profile',
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0',
                old_state: {
                  email: 'user@example.com',
                  phone: '1234567890',
                  nested: { contact: 'friend@example.com' },
                },
                new_state: {
                  email: 'new@example.com',
                  phone: '+1 987 654 3210',
                },
                resource_type: 'profile',
                resource_id: 'profile-1',
                session_id: 'session-1',
              },
            ],
          };
        }
        return { rows: [] };
      },
      release: () => {},
    };
    return await fn(mockClient);
  });

  const logs = await auditLogRepository.queryAuditLogs();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].old_state.email, 'u***@example.com');
  assert.equal(logs[0].old_state.phone, '******7890');
  assert.equal(logs[0].old_state.nested.contact, 'f***@example.com');
  assert.equal(logs[0].new_state.email, 'n***@example.com');
  assert.equal(logs[0].new_state.phone, '******3210');
});

test('Suspicious Login Alert Checks', async () => {
  setWithDbOverride(async (fn) => {
    const mockClient = {
      query: async (sql, params) => {
        const sqlLower = sql.toLowerCase();
        if (sqlLower.includes('distinct ip_address')) {
          // Admin has logged in from 192.168.1.1 before, but not 10.0.0.1
          return { rows: [{ ip_address: '192.168.1.1' }] };
        }
        if (sqlLower.includes('count(*) as failed_count')) {
          // No failed login spikes
          return { rows: [{ failed_count: 0 }] };
        }
        return { rows: [] };
      },
      release: () => {},
    };
    return await fn(mockClient);
  });

  // Check login from new IP
  const alerts = await auditMonitoringService.checkSuspiciousActivity('admin-john', '10.0.0.1');
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].type, 'NEW_IP_LOGIN');
  assert.ok(alerts[0].message.includes('10.0.0.1'));

  // Check login from known IP (no alert)
  const noAlerts = await auditMonitoringService.checkSuspiciousActivity(
    'admin-john',
    '192.168.1.1'
  );
  assert.equal(noAlerts.length, 0);

  // Check failed login spike (5+ failures)
  setWithDbOverride(async (fn) => {
    const mockClient = {
      query: async (sql, params) => {
        const sqlLower = sql.toLowerCase();
        if (sqlLower.includes('distinct ip_address')) {
          return { rows: [{ ip_address: '192.168.1.1' }] };
        }
        if (sqlLower.includes('count(*) as failed_count')) {
          return { rows: [{ failed_count: 6 }] };
        }
        return { rows: [] };
      },
      release: () => {},
    };
    return await fn(mockClient);
  });

  const spikeAlerts = await auditMonitoringService.checkSuspiciousActivity(
    'admin-john',
    '192.168.1.1'
  );
  assert.equal(spikeAlerts.length, 1);
  assert.equal(spikeAlerts[0].type, 'FAILED_LOGIN_SPIKE');
});

test('Audit Analytics Reports & Retention', async () => {
  let deletedDays = 0;

  setWithDbOverride(async (fn) => {
    const mockClient = {
      query: async (sql, params) => {
        const sqlLower = sql.toLowerCase();
        if (sqlLower.includes('count(*) as action_count')) {
          return { rows: [{ admin_id: 'super-admin', action_count: 15 }] };
        }
        if (sqlLower.includes('count(*) as change_count')) {
          return { rows: [{ resource_type: 'event', change_count: 8 }] };
        }
        if (sqlLower.includes('count(*) as count')) {
          return { rows: [{ action: 'POST /api/events', count: 8 }] };
        }
        if (sqlLower.includes('delete from audit_logs')) {
          deletedDays = params[0];
          return { rowCount: 12 };
        }
        return { rows: [] };
      },
      release: () => {},
    };
    return await fn(mockClient);
  });

  const reports = await auditLogRepository.getReports();
  assert.equal(reports.activeAdmins[0].admin_id, 'super-admin');
  assert.equal(reports.activeResources[0].resource_type, 'event');

  const cleanupResult = await auditMonitoringService.runRetentionCleanup(60);
  assert.equal(cleanupResult.deletedCount, 12);
  assert.equal(deletedDays, 60);
});
