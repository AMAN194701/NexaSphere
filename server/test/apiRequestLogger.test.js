import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { apiRequestLogger } from '../middleware/apiRequestLogger.js';

function createTestLogger(entries) {
  return {
    http(message, metadata) {
      entries.push({ message, metadata });
    },
  };
}

async function withServer(app, fn) {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function flushApiLogQueue() {
  await new Promise((resolve) => setTimeout(resolve, 75));
}

test('apiRequestLogger emits structured API request metadata without sensitive request data', async () => {
  const entries = [];
  const app = express();

  app.use(express.json());
  app.use('/api', apiRequestLogger({ logger: createTestLogger(entries) }));
  app.post('/api/login', (_req, res) => res.status(201).json({ ok: true }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/login?token=secret-token&next=/dashboard`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret-access-token',
        Cookie: 'session=secret-cookie',
        'Content-Type': 'application/json',
        'X-Request-ID': 'req-test-123',
      },
      body: JSON.stringify({ username: 'user@example.com', password: 'secret-password' }),
    });

    assert.equal(response.status, 201);
    await response.text();
  });

  await flushApiLogQueue();

  assert.equal(entries.length, 1);
  assert.equal(entries[0].message, 'API request');
  assert.equal(entries[0].metadata.event, 'api_request');
  assert.equal(entries[0].metadata.method, 'POST');
  assert.equal(entries[0].metadata.path, '/api/login');
  assert.equal(entries[0].metadata.status, 201);
  assert.equal(entries[0].metadata.reqId, 'req-test-123');
  assert.equal(typeof entries[0].metadata.responseTimeMs, 'number');
  assert.ok(entries[0].metadata.responseTimeMs >= 0);

  assert.equal(entries[0].metadata.query, undefined);
  assert.equal(entries[0].metadata.headers, undefined);
  assert.equal(entries[0].metadata.body, undefined);
  assert.equal(entries[0].metadata.originalUrl, undefined);

  const serializedEntry = JSON.stringify(entries[0]);
  assert.doesNotMatch(serializedEntry, /secret-token/);
  assert.doesNotMatch(serializedEntry, /secret-access-token/);
  assert.doesNotMatch(serializedEntry, /secret-cookie/);
  assert.doesNotMatch(serializedEntry, /secret-password/);
});

test('apiRequestLogger drops unsafe request IDs from API request logs', async () => {
  const entries = [];
  const app = express();

  app.use('/api', apiRequestLogger({ logger: createTestLogger(entries) }));
  app.get('/api/profile', (_req, res) => res.status(200).json({ ok: true }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/profile`, {
      headers: {
        'X-Request-ID': 'user@example.com bearer-token',
      },
    });

    assert.equal(response.status, 200);
    await response.text();
  });

  await flushApiLogQueue();

  assert.equal(entries.length, 1);
  assert.equal(entries[0].metadata.reqId, null);

  const serializedEntry = JSON.stringify(entries[0]);
  assert.doesNotMatch(serializedEntry, /user@example\.com/);
  assert.doesNotMatch(serializedEntry, /bearer-token/);
});

test('apiRequestLogger prefers route templates over concrete path identifiers', async () => {
  const entries = [];
  const app = express();

  app.use('/api', apiRequestLogger({ logger: createTestLogger(entries) }));
  app.get('/api/portfolio/:username', (_req, res) => res.status(200).json({ ok: true }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/portfolio/alice-private`);
    assert.equal(response.status, 200);
    await response.text();
  });

  await flushApiLogQueue();

  assert.equal(entries.length, 1);
  assert.equal(entries[0].metadata.path, '/api/portfolio/:username');
  assert.doesNotMatch(JSON.stringify(entries[0]), /alice-private/);
});

test('apiRequestLogger groups unmatched API paths without logging concrete identifiers', async () => {
  const entries = [];
  const app = express();

  app.use('/api', apiRequestLogger({ logger: createTestLogger(entries) }));
  app.use((_req, res) => res.status(404).json({ error: 'missing' }));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/users/alice-private-token`);
    assert.equal(response.status, 404);
    await response.text();
  });

  await flushApiLogQueue();

  assert.equal(entries.length, 1);
  assert.equal(entries[0].metadata.path, '/api/*');
  assert.doesNotMatch(JSON.stringify(entries[0]), /alice-private-token/);
});

test('apiRequestLogger batches independently per middleware instance', async () => {
  const firstEntries = [];
  const secondEntries = [];
  const firstApp = express();
  const secondApp = express();

  firstApp.use('/api', apiRequestLogger({ logger: createTestLogger(firstEntries) }));
  secondApp.use('/api', apiRequestLogger({ logger: createTestLogger(secondEntries) }));
  firstApp.get('/api/alpha', (_req, res) => res.status(200).json({ ok: true }));
  secondApp.get('/api/beta', (_req, res) => res.status(202).json({ ok: true }));

  await withServer(firstApp, async (firstBaseUrl) => {
    const response = await fetch(`${firstBaseUrl}/api/alpha`);
    assert.equal(response.status, 200);
    await response.text();
  });

  await withServer(secondApp, async (secondBaseUrl) => {
    const response = await fetch(`${secondBaseUrl}/api/beta`);
    assert.equal(response.status, 202);
    await response.text();
  });

  await flushApiLogQueue();

  assert.equal(firstEntries.length, 1);
  assert.equal(secondEntries.length, 1);
  assert.equal(firstEntries[0].metadata.path, '/api/alpha');
  assert.equal(secondEntries[0].metadata.path, '/api/beta');
});
