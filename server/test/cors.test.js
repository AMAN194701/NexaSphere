import assert from 'node:assert/strict';
import test from 'node:test';

// ---------------------------------------------------------------------------
// Inline the buildCorsOrigins logic so the test has no dependency on the full
// server module (which requires env vars and a DB connection at import time).
// ---------------------------------------------------------------------------

function buildCorsOrigins(env = {}) {
  const raw = env.CORS_ORIGIN;
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'CORS_ORIGIN must be set in production. ' +
        'Refusing to start with an open wildcard in production.',
    );
  }
  return [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8787',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
}

// ---------------------------------------------------------------------------
// Development fallback
// ---------------------------------------------------------------------------

test('dev fallback returns localhost origins when CORS_ORIGIN is unset', () => {
  const origins = buildCorsOrigins({ NODE_ENV: 'development' });
  assert.ok(Array.isArray(origins));
  assert.ok(origins.length > 0);
  assert.ok(origins.every((o) => o.startsWith('http://localhost') || o.startsWith('http://127.0.0.1')));
});

test('dev fallback includes port 5173 and 3000', () => {
  const origins = buildCorsOrigins({ NODE_ENV: 'development' });
  assert.ok(origins.includes('http://localhost:5173'));
  assert.ok(origins.includes('http://localhost:3000'));
});

test('fallback does not include wildcard true or asterisk', () => {
  const origins = buildCorsOrigins({ NODE_ENV: 'development' });
  assert.ok(!origins.includes(true));
  assert.ok(!origins.includes('*'));
});

// ---------------------------------------------------------------------------
// Production guard
// ---------------------------------------------------------------------------

test('production throws when CORS_ORIGIN is unset', () => {
  assert.throws(
    () => buildCorsOrigins({ NODE_ENV: 'production' }),
    /CORS_ORIGIN must be set in production/,
  );
});

test('production throws when CORS_ORIGIN is an empty string', () => {
  assert.throws(
    () => buildCorsOrigins({ NODE_ENV: 'production', CORS_ORIGIN: '' }),
    /CORS_ORIGIN must be set in production/,
  );
});

test('production does not throw when CORS_ORIGIN is set', () => {
  assert.doesNotThrow(() =>
    buildCorsOrigins({
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://nexasphere-glbajaj.vercel.app',
    }),
  );
});

// ---------------------------------------------------------------------------
// Allowlist parsing
// ---------------------------------------------------------------------------

test('single origin is returned as a one-element array', () => {
  const origins = buildCorsOrigins({ CORS_ORIGIN: 'https://example.com' });
  assert.deepEqual(origins, ['https://example.com']);
});

test('comma-separated origins are split and trimmed correctly', () => {
  const origins = buildCorsOrigins({
    CORS_ORIGIN: 'https://app.example.com , https://admin.example.com',
  });
  assert.deepEqual(origins, ['https://app.example.com', 'https://admin.example.com']);
});

test('empty segments from trailing comma are filtered out', () => {
  const origins = buildCorsOrigins({ CORS_ORIGIN: 'https://app.example.com,' });
  assert.deepEqual(origins, ['https://app.example.com']);
});

test('whitespace-only segments are filtered out', () => {
  const origins = buildCorsOrigins({ CORS_ORIGIN: 'https://a.com , , https://b.com' });
  assert.deepEqual(origins, ['https://a.com', 'https://b.com']);
});

test('explicit CORS_ORIGIN is used in production without error', () => {
  const origins = buildCorsOrigins({
    NODE_ENV: 'production',
    CORS_ORIGIN:
      'https://nexasphere-glbajaj.vercel.app,https://nexasphere-admin.vercel.app',
  });
  assert.ok(origins.includes('https://nexasphere-glbajaj.vercel.app'));
  assert.ok(origins.includes('https://nexasphere-admin.vercel.app'));
});

test('explicit CORS_ORIGIN overrides dev fallback in development', () => {
  const origins = buildCorsOrigins({
    NODE_ENV: 'development',
    CORS_ORIGIN: 'http://localhost:4000',
  });
  assert.deepEqual(origins, ['http://localhost:4000']);
  assert.ok(!origins.includes('http://localhost:5173'));
});
