/**
 * Asynchronous Backup Cryptography — Test Suite (issue #3847)
 *
 * Verifies that the database backup and restore operations run asynchronously
 * and do not block the Node.js event loop with synchronous cryptographic
 * or compression tasks.
 */

import './setupEnv.js';
import assert from 'node:assert/strict';
import test from 'node:test';

// Mock PG Pool to prevent actual database connections in CI/test environments
import pg from 'pg';
pg.Pool = class MockPool {
  on() {}
  async connect() {
    return {
      query: async (sql, params) => {
        const sqlLower = sql.toLowerCase();
        if (sqlLower.includes('information_schema.tables')) {
          return { rows: [{ table_name: 'student_users' }, { table_name: 'events' }] };
        }
        if (sqlLower.includes('select * from "student_users"')) {
          return { rows: [{ id: 1, email: 'test@example.com' }] };
        }
        if (sqlLower.includes('select * from "events"')) {
          return { rows: [{ id: 1, name: 'Event 1' }] };
        }
        if (sqlLower.includes('select * from backup_restore_logs')) {
          return {
            rows: [
              {
                id: 1,
                backup_key: 'test-key',
                restore_type: 'automated_test',
                status: 'success',
                duration_ms: 100,
                verified_at: new Date().toISOString(),
                error_message: null,
              },
            ],
          };
        }
        return { rows: [], rowCount: 1 };
      },
      release: () => {},
    };
  }
};

const { backupService } = await import('../services/backupService.js');

test('Backup & Restore: Asynchronous execution test (issue #3847)', async (t) => {
  await t.test('performBackup executes asynchronously and resolves to a promise', async () => {
    const promise = backupService.performBackup('full');
    assert.ok(promise instanceof Promise, 'performBackup must return a Promise');
    const key = await promise;
    assert.ok(key, 'backup must complete successfully and return key');
  });

  await t.test('runRestore executes asynchronously and resolves to a promise', async () => {
    const key = await backupService.performBackup('full');
    const promise = backupService.runRestore(key);
    assert.ok(promise instanceof Promise, 'runRestore must return a Promise');
    const result = await promise;
    assert.ok(result.success, 'restore must complete successfully');
  });

  await t.test('Event loop concurrency is preserved during backup operation', async () => {
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
    }, 5);

    // Run performBackup while the interval ticks. If it were synchronous,
    // the interval wouldn't fire during the backup.
    await backupService.performBackup('full');

    clearInterval(interval);
    assert.ok(
      tickCount > 0,
      'event loop must not be frozen; ticks must be registered during backup execution'
    );
  });
});
