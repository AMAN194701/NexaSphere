import assert from 'node:assert/strict';
import test from 'node:test';

// ---------------------------------------------------------------------------
// Inline the cache logic so this test has no dependency on the full server
// module (env vars, DB connections, file system) at import time.
// ---------------------------------------------------------------------------

function makeCache(ttlMs = 15_000) {
  const cache = { data: null, cachedAt: 0 };
  let inflightRead = null;

  async function getCachedContent(readFn) {
    if (cache.data !== null && Date.now() - cache.cachedAt < ttlMs) {
      return cache.data;
    }
    if (!inflightRead) {
      inflightRead = readFn().then((data) => {
        cache.data = data;
        cache.cachedAt = Date.now();
        inflightRead = null;
        return data;
      });
    }
    return inflightRead;
  }

  function invalidate() {
    cache.data = null;
    cache.cachedAt = 0;
  }

  return { getCachedContent, invalidate, _cache: cache };
}

// ---------------------------------------------------------------------------
// TTL behaviour
// ---------------------------------------------------------------------------

test('cache miss on first call — read function is invoked', async () => {
  let callCount = 0;
  const { getCachedContent } = makeCache(1000);
  const readFn = async () => { callCount++; return { events: [] }; };

  await getCachedContent(readFn);
  assert.equal(callCount, 1);
});

test('cache hit within TTL — read function is not invoked again', async () => {
  let callCount = 0;
  const { getCachedContent } = makeCache(10_000);
  const readFn = async () => { callCount++; return { events: [{ id: '1' }] }; };

  await getCachedContent(readFn);
  await getCachedContent(readFn);
  await getCachedContent(readFn);
  assert.equal(callCount, 1);
});

test('cache returns the same data object on repeated hits', async () => {
  const { getCachedContent } = makeCache(10_000);
  const payload = { events: [{ id: 'abc' }] };
  const readFn = async () => payload;

  const a = await getCachedContent(readFn);
  const b = await getCachedContent(readFn);
  assert.equal(a, b); // strict reference equality
});

test('expired cache entry is refreshed on next call', async () => {
  let callCount = 0;
  // TTL of 1ms so the entry expires immediately.
  const { getCachedContent, _cache } = makeCache(1);
  const readFn = async () => { callCount++; return { events: [] }; };

  await getCachedContent(readFn);
  // Force-expire by backdating the cachedAt timestamp.
  _cache.cachedAt = Date.now() - 100;

  await getCachedContent(readFn);
  assert.equal(callCount, 2);
});

// ---------------------------------------------------------------------------
// Invalidation
// ---------------------------------------------------------------------------

test('invalidate resets the cache so the next call re-reads', async () => {
  let callCount = 0;
  const { getCachedContent, invalidate } = makeCache(60_000);
  const readFn = async () => { callCount++; return { events: [] }; };

  await getCachedContent(readFn);
  assert.equal(callCount, 1);

  invalidate();
  await getCachedContent(readFn);
  assert.equal(callCount, 2);
});

test('invalidate after each of N mutations causes N+1 total reads for N+1 requests', async () => {
  let callCount = 0;
  const { getCachedContent, invalidate } = makeCache(60_000);
  const readFn = async () => { callCount++; return { events: [] }; };

  for (let i = 0; i < 3; i++) {
    await getCachedContent(readFn);
    invalidate();
  }
  await getCachedContent(readFn);
  assert.equal(callCount, 4);
});

test('invalidate sets data to null and cachedAt to 0', () => {
  const { invalidate, _cache } = makeCache(60_000);
  _cache.data = { events: [] };
  _cache.cachedAt = Date.now();

  invalidate();
  assert.equal(_cache.data, null);
  assert.equal(_cache.cachedAt, 0);
});

// ---------------------------------------------------------------------------
// Concurrent cache-miss deduplication
// ---------------------------------------------------------------------------

test('concurrent cache misses issue only one read', async () => {
  let callCount = 0;
  const { getCachedContent } = makeCache(10_000);
  const readFn = () =>
    new Promise((resolve) => {
      callCount++;
      // Simulate async I/O delay.
      setTimeout(() => resolve({ events: [] }), 10);
    });

  // Fire three concurrent requests before the first resolves.
  await Promise.all([
    getCachedContent(readFn),
    getCachedContent(readFn),
    getCachedContent(readFn),
  ]);
  assert.equal(callCount, 1);
});

// ---------------------------------------------------------------------------
// Analytics computation — summary endpoint logic
// ---------------------------------------------------------------------------

test('overview correctly counts upcoming and completed events', () => {
  const events = [
    { id: '1', status: 'completed' },
    { id: '2', status: 'upcoming' },
    { id: '3', status: 'completed' },
  ];
  const upcoming = events.filter((e) => e.status === 'upcoming').length;
  const completed = events.filter((e) => e.status === 'completed').length;
  assert.equal(upcoming, 1);
  assert.equal(completed, 2);
});

test('tag frequency aggregation counts correctly across events', () => {
  const events = [
    { tags: ['AI', 'Learning'] },
    { tags: ['AI', 'Community'] },
    { tags: [] },
  ];
  const tagFrequency = {};
  for (const event of events) {
    for (const tag of event.tags || []) {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    }
  }
  assert.equal(tagFrequency['AI'], 2);
  assert.equal(tagFrequency['Learning'], 1);
  assert.equal(tagFrequency['Community'], 1);
  assert.equal(tagFrequency['Missing'], undefined);
});

test('activity event counts are summed correctly across keys', () => {
  const activityEvents = {
    coding: [{ id: 'c1' }, { id: 'c2' }],
    design: [{ id: 'd1' }],
    empty: [],
  };
  let total = 0;
  const counts = {};
  for (const [key, list] of Object.entries(activityEvents)) {
    const count = Array.isArray(list) ? list.length : 0;
    counts[key] = count;
    total += count;
  }
  assert.equal(counts.coding, 2);
  assert.equal(counts.design, 1);
  assert.equal(counts.empty, 0);
  assert.equal(total, 3);
});
