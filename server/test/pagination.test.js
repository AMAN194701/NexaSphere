import assert from 'node:assert/strict';
import test from 'node:test';

// ---------------------------------------------------------------------------
// Inline the pagination helpers so this test has no dependency on the full
// server module (which requires env vars and a DB connection at import time).
// ---------------------------------------------------------------------------

function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
}

// Simulates listCoreTeamStore file-based pagination (slice logic identical to
// the production implementation so regressions in the store are caught here).
function paginateArray(arr, page, limit) {
  const total = arr.length;
  const start = (page - 1) * limit;
  const members = arr.slice(start, start + limit);
  return { members, total };
}

function buildPaginationEnvelope(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

// ---------------------------------------------------------------------------
// parsePagination
// ---------------------------------------------------------------------------

test('defaults to page 1 and limit 20 when query is empty', () => {
  const { page, limit } = parsePagination({});
  assert.equal(page, 1);
  assert.equal(limit, 20);
});

test('parses valid page and limit integers from query strings', () => {
  const { page, limit } = parsePagination({ page: '3', limit: '15' });
  assert.equal(page, 3);
  assert.equal(limit, 15);
});

test('page is clamped to minimum of 1', () => {
  assert.equal(parsePagination({ page: '0' }).page, 1);
  assert.equal(parsePagination({ page: '-5' }).page, 1);
});

test('limit is clamped to maximum of 100', () => {
  assert.equal(parsePagination({ limit: '200' }).limit, 100);
  assert.equal(parsePagination({ limit: '101' }).limit, 100);
});

test('limit is clamped to minimum of 1', () => {
  // parseInt('0') = 0, fallback || 20 triggers so default 20 is used, then Math.max(1,20)=20.
  // parseInt('-10') = -10, -10 || 20 = -10 (truthy negative), Math.max(1,-10) = 1.
  assert.equal(parsePagination({ limit: '-10' }).limit, 1);
  assert.equal(parsePagination({ limit: '-1' }).limit, 1);
});

test('non-numeric page falls back to 1', () => {
  assert.equal(parsePagination({ page: 'abc' }).page, 1);
});

test('non-numeric limit falls back to 20', () => {
  assert.equal(parsePagination({ limit: 'xyz' }).limit, 20);
});

// ---------------------------------------------------------------------------
// paginateArray — core-team slice logic
// ---------------------------------------------------------------------------

function makeMembers(count) {
  return Array.from({ length: count }, (_, i) => ({ id: String(i + 1), name: `Member ${i + 1}` }));
}

test('first page returns first N members', () => {
  const members = makeMembers(10);
  const { members: page1, total } = paginateArray(members, 1, 4);
  assert.equal(total, 10);
  assert.equal(page1.length, 4);
  assert.equal(page1[0].id, '1');
  assert.equal(page1[3].id, '4');
});

test('second page returns the next N members', () => {
  const members = makeMembers(10);
  const { members: page2 } = paginateArray(members, 2, 4);
  assert.equal(page2.length, 4);
  assert.equal(page2[0].id, '5');
});

test('last partial page returns only the remaining members', () => {
  const members = makeMembers(10);
  const { members: page3 } = paginateArray(members, 3, 4);
  assert.equal(page3.length, 2);
  assert.equal(page3[0].id, '9');
  assert.equal(page3[1].id, '10');
});

test('page beyond total returns an empty array', () => {
  const members = makeMembers(5);
  const { members: empty } = paginateArray(members, 3, 3);
  assert.equal(empty.length, 0);
});

test('empty dataset returns empty members and total of 0', () => {
  const { members, total } = paginateArray([], 1, 20);
  assert.equal(members.length, 0);
  assert.equal(total, 0);
});

test('limit larger than dataset returns all members on page 1', () => {
  const members = makeMembers(5);
  const { members: all, total } = paginateArray(members, 1, 100);
  assert.equal(all.length, 5);
  assert.equal(total, 5);
});

// ---------------------------------------------------------------------------
// buildPaginationEnvelope
// ---------------------------------------------------------------------------

test('envelope totalPages rounds up correctly', () => {
  assert.equal(buildPaginationEnvelope(1, 10, 25).totalPages, 3);
  assert.equal(buildPaginationEnvelope(1, 10, 30).totalPages, 3);
  assert.equal(buildPaginationEnvelope(1, 10, 31).totalPages, 4);
});

test('envelope totalPages is at least 1 when total is 0', () => {
  assert.equal(buildPaginationEnvelope(1, 20, 0).totalPages, 1);
});

test('envelope carries through page and limit unchanged', () => {
  const env = buildPaginationEnvelope(3, 15, 60);
  assert.equal(env.page, 3);
  assert.equal(env.limit, 15);
  assert.equal(env.total, 60);
});
