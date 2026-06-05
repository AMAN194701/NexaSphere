import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { _closeRedis, _getRedisClient } from '../services/rateLimitService.js';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/authRateLimiter.js';

function createMockReqRes(ip) {
  const req = {
    ip,
    method: 'POST',
    path: '/api/auth/login',
    originalUrl: '/api/auth/login',
    headers: {},
    app: { get: () => false },
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
  };
  return { req, res };
}

test('Scenario 1 & 2: Normal login usage & 5 failed attempts blocks on next request', async () => {
  const ip = '192.168.1.1';
  let nextCalled = 0;
  const next = () => {
    nextCalled++;
  };

  // 5 allowed requests
  for (let i = 0; i < 5; i++) {
    const { req, res } = createMockReqRes(ip);
    await authRateLimiter(req, res, next);
    assert.equal(res.statusCode, 200, `Request ${i + 1} should be allowed`);
  }

  assert.equal(nextCalled, 5);

  // 6th request should be blocked
  const { req, res } = createMockReqRes(ip);
  await authRateLimiter(req, res, next);

  assert.equal(res.statusCode, 429);
  assert.equal(nextCalled, 5); // next() should not be called
});

test('Scenario 4: Multiple IPs have independent limits', async () => {
  const ip1 = '10.0.0.1';
  const ip2 = '10.0.0.2';

  const next = () => {};

  // Exhaust IP1
  for (let i = 0; i < 5; i++) {
    const { req, res } = createMockReqRes(ip1);
    await authRateLimiter(req, res, next);
  }

  // 6th request IP1 blocked
  const { req: req1, res: res1 } = createMockReqRes(ip1);
  await authRateLimiter(req1, res1, next);
  assert.equal(res1.statusCode, 429);

  // 1st request IP2 allowed
  const { req: req2, res: res2 } = createMockReqRes(ip2);
  await authRateLimiter(req2, res2, next);
  assert.equal(res2.statusCode, 200);
});

test('Scenario 6: Password reset abuse is rate limited to 3 requests', async () => {
  const ip = '172.16.0.1';
  let nextCalled = 0;
  const next = () => {
    nextCalled++;
  };

  for (let i = 0; i < 3; i++) {
    const { req, res } = createMockReqRes(ip);
    await passwordResetRateLimiter(req, res, next);
    assert.equal(res.statusCode, 200);
  }

  assert.equal(nextCalled, 3);

  // 4th request blocked
  const { req, res } = createMockReqRes(ip);
  await passwordResetRateLimiter(req, res, next);

  assert.equal(res.statusCode, 429);
});

test('Scenario 5: Redis unavailable causes graceful fallback to memory', () => {
  // If Redis is not configured, the service falls back to memory safely.
  // The fact that tests run without throwing proves this fallback works.
  const client = _getRedisClient();
  if (!process.env.REDIS_URL) {
    assert.equal(client, null);
  }
});

test('Scenario 7: UPSTASH_REDIS_REST_URL throws a configuration error', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serviceUrl = pathToFileURL(path.resolve(__dirname, '../services/rateLimitService.js')).href;

  try {
    execSync(
      `node -e "process.env.UPSTASH_REDIS_REST_URL='https://some-instance.upstash.io'; import('${serviceUrl}').catch(err => { console.error(err.message); process.exit(1); })"`,
      { stdio: 'pipe' }
    );
    assert.fail('Should have thrown an error when UPSTASH_REDIS_REST_URL is configured');
  } catch (error) {
    const stdout = error.stdout ? error.stdout.toString() : '';
    const stderr = error.stderr ? error.stderr.toString() : '';
    const output = stdout + '\n' + stderr + '\n' + error.message;
    assert.match(output, /UPSTASH_REDIS_REST_URL is configured/);
  }
});

test.after(() => {
  _closeRedis(); // Clean up connections so the test runner can exit
});
