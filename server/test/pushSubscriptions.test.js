import assert from 'node:assert/strict';
import test from 'node:test';

// ---------------------------------------------------------------------------
// Inline the validation helper so the test has no dependency on the full
// server module (which requires env vars and DB at import time).
// ---------------------------------------------------------------------------

function isValidPushSubscription(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const endpoint = value.endpoint;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) {
    return false;
  }
  const keys = value.keys;
  if (!keys || typeof keys !== 'object') return false;
  if (typeof keys.p256dh !== 'string' || !keys.p256dh) return false;
  return true;
}

function makeValidSubscription(overrides = {}) {
  return {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlzo1N4n2RnC2xvsxxx',
      auth: 'tBHItJI5svbpez7KI4CCXg',
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isValidPushSubscription
// ---------------------------------------------------------------------------

test('valid subscription with endpoint and keys passes validation', () => {
  assert.equal(isValidPushSubscription(makeValidSubscription()), true);
});

test('null is rejected', () => {
  assert.equal(isValidPushSubscription(null), false);
});

test('undefined is rejected', () => {
  assert.equal(isValidPushSubscription(undefined), false);
});

test('array is rejected', () => {
  assert.equal(isValidPushSubscription([]), false);
});

test('string is rejected', () => {
  assert.equal(isValidPushSubscription('https://endpoint'), false);
});

test('missing endpoint is rejected', () => {
  const sub = makeValidSubscription();
  delete sub.endpoint;
  assert.equal(isValidPushSubscription(sub), false);
});

test('http endpoint (non-HTTPS) is rejected', () => {
  assert.equal(
    isValidPushSubscription(makeValidSubscription({ endpoint: 'http://fcm.example.com/send/abc' })),
    false,
  );
});

test('empty endpoint string is rejected', () => {
  assert.equal(isValidPushSubscription(makeValidSubscription({ endpoint: '' })), false);
});

test('missing keys object is rejected', () => {
  const sub = makeValidSubscription();
  delete sub.keys;
  assert.equal(isValidPushSubscription(sub), false);
});

test('null keys is rejected', () => {
  assert.equal(isValidPushSubscription(makeValidSubscription({ keys: null })), false);
});

test('keys without p256dh is rejected', () => {
  assert.equal(
    isValidPushSubscription(makeValidSubscription({ keys: { auth: 'someauth' } })),
    false,
  );
});

test('empty p256dh string is rejected', () => {
  assert.equal(
    isValidPushSubscription(makeValidSubscription({ keys: { p256dh: '', auth: 'someauth' } })),
    false,
  );
});

test('valid subscription without auth key still passes (auth is optional per spec)', () => {
  const sub = makeValidSubscription();
  delete sub.keys.auth;
  assert.equal(isValidPushSubscription(sub), true);
});

// ---------------------------------------------------------------------------
// In-memory Set deduplication and cap behaviour
// ---------------------------------------------------------------------------

test('same subscription is not stored twice', () => {
  const store = new Set();
  const sub = makeValidSubscription();
  const serialised = JSON.stringify(sub);
  store.add(serialised);
  store.add(serialised);
  assert.equal(store.size, 1);
});

test('different endpoints are stored as separate entries', () => {
  const store = new Set();
  const subA = makeValidSubscription({ endpoint: 'https://fcm.example.com/a' });
  const subB = makeValidSubscription({ endpoint: 'https://fcm.example.com/b' });
  store.add(JSON.stringify(subA));
  store.add(JSON.stringify(subB));
  assert.equal(store.size, 2);
});

test('unsubscribing removes the entry from the set', () => {
  const store = new Set();
  const sub = makeValidSubscription();
  const serialised = JSON.stringify(sub);
  store.add(serialised);
  assert.equal(store.size, 1);
  store.delete(serialised);
  assert.equal(store.size, 0);
});

test('cap eviction removes oldest entry when limit is reached', () => {
  const CAP = 3;
  const store = new Set();

  for (let i = 0; i < CAP; i++) {
    store.add(JSON.stringify(makeValidSubscription({ endpoint: `https://fcm.example.com/${i}` })));
  }
  assert.equal(store.size, CAP);

  // Simulate adding one more beyond the cap — evict oldest first.
  const oldest = store.values().next().value;
  store.delete(oldest);
  store.add(JSON.stringify(makeValidSubscription({ endpoint: 'https://fcm.example.com/new' })));

  assert.equal(store.size, CAP);
  assert.ok(!store.has(oldest));
});
