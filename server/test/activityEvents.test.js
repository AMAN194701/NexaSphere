import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import pg from 'pg';

// Mock the PG Pool to prevent actual database connection attempts during tests
pg.Pool = class MockPool {
  on() {}
  async connect() {
    return {
      query: async (sql) => {
        const sqlLower = sql.toLowerCase();
        if (sqlLower.includes('select count(*)')) {
          return { rows: [{ total: 0 }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      },
      release: () => {},
    };
  }
};

process.env.NODE_ENV = 'test';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'StrongPassword123!';
process.env.ADMIN_EVENT_PASSWORD = 'StrongEventPassword123!';
process.env.PORT = '0';

test('Activity Events Authentication Enforcement', async (t) => {
  const { default: app } = await import('../index.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const sendRequest = (method, path, body) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: port,
        path: path,
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(data || '{}');
          } catch {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on('error', (err) => reject(err));
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    await t.test('1. GET activity events should be public', async () => {
      const res = await sendRequest('GET', '/api/content/activity-events/test-activity');
      assert.equal(res.status, 200, 'Expected 200 OK');
      assert.ok(Array.isArray(res.body.events), 'Expected events array');
    });

    await t.test('2. POST activity event should reject without auth', async () => {
      const res = await sendRequest('POST', '/api/content/activity-events/test-activity', {
        name: 'Manual Event',
        date: '2026-06-09',
        description: 'Testing auth enforcement',
      });
      assert.equal(res.status, 401, 'Expected 401 Unauthorized');
      assert.equal(res.body.error, 'Unauthorized');
    });

    await t.test('3. DELETE activity event should reject without auth', async () => {
      const res = await sendRequest(
        'DELETE',
        '/api/content/activity-events/test-activity/event-123'
      );
      assert.equal(res.status, 401, 'Expected 401 Unauthorized');
      assert.equal(res.body.error, 'Unauthorized');
    });
  } finally {
    server.close();
  }
});
