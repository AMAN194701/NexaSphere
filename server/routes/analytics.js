import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json');

// Default TTL for the in-process analytics cache (15 seconds). Overridable via
// ANALYTICS_CACHE_TTL_MS so operators can tune it without a code change.
const DEFAULT_TTL_MS = 15_000;

function getCacheTtlMs() {
  const v = Number(process.env.ANALYTICS_CACHE_TTL_MS);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_TTL_MS;
}

// Module-level cache shared across all requests. A single object is cheaper
// than a Map because analytics only has one logical dataset.
const cache = {
  data: null,
  cachedAt: 0,
};

/**
 * Reads `content.json` from disk and returns its parsed value.
 * Returns a safe empty structure when the file is absent or unreadable so
 * analytics routes never 500 on a cold start.
 */
async function readContentSafe() {
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { events: [], activityEvents: {}, coreTeam: [] };
  }
}

/**
 * Returns content from the in-process cache when the entry is fresh, otherwise
 * reads from disk, stores the result, and resets the timestamp.
 * Concurrent callers that arrive while a read is in flight all await the same
 * promise so the file is read at most once per TTL window.
 */
let inflightRead = null;

async function getCachedContent() {
  const ttlMs = getCacheTtlMs();
  if (cache.data !== null && Date.now() - cache.cachedAt < ttlMs) {
    return cache.data;
  }
  // Deduplicate concurrent cache misses: if a read is already in flight, wait
  // for it rather than issuing a second fs.readFile.
  if (!inflightRead) {
    inflightRead = readContentSafe().then((data) => {
      cache.data = data;
      cache.cachedAt = Date.now();
      inflightRead = null;
      return data;
    });
  }
  return inflightRead;
}

/**
 * Invalidates the analytics cache immediately so the next request re-reads
 * from the source of truth. Call this after any write operation (event create,
 * update, delete; activity-event create/delete; core-team create/delete).
 */
export function invalidateAnalyticsCache() {
  cache.data = null;
  cache.cachedAt = 0;
}

const router = Router();

/**
 * GET /
 * Returns a high-level summary of events, activity events, and core team members.
 */
router.get('/', async (_req, res) => {
  try {
    const content = await getCachedContent();

    const events = content.events || [];
    const activityEvents = content.activityEvents || {};
    const coreTeam = content.coreTeam || [];

    const upcomingEvents = events.filter((e) => e.status === 'upcoming');
    const completedEvents = events.filter((e) => e.status === 'completed');

    const activityEventCounts = {};
    let totalActivityEvents = 0;
    for (const [key, list] of Object.entries(activityEvents)) {
      const count = Array.isArray(list) ? list.length : 0;
      activityEventCounts[key] = count;
      totalActivityEvents += count;
    }

    return res.json({
      overview: {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        completedEvents: completedEvents.length,
        totalActivityEvents,
        totalCoreTeamMembers: coreTeam.length,
      },
      activityEventCounts,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to generate analytics' });
  }
});

/**
 * GET /events
 * Returns detailed analytics for events including tag distribution.
 */
router.get('/events', async (_req, res) => {
  try {
    const content = await getCachedContent();
    const events = content.events || [];

    const tagFrequency = {};
    for (const event of events) {
      const tags = Array.isArray(event.tags) ? event.tags : [];
      for (const tag of tags) {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      }
    }

    const statusBreakdown = {};
    for (const event of events) {
      const status = event.status || 'unknown';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    }

    return res.json({
      total: events.length,
      statusBreakdown,
      tagFrequency,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to generate event analytics' });
  }
});

export default router;
