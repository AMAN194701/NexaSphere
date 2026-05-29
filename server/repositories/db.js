import pg from "pg";
import { readContent, writeContent } from "../storage/contentFileStore.js";

// ---------------------------------------------------------------------------
// Pool configuration
//
// All values are environment-variable-backed so operators can tune them for
// their specific deployment without changing code. Sensible, documented
// defaults are used when the variable is absent.
//
// PG_POOL_MAX            — max simultaneous client checkouts (default 20).
//                          Raise for high-concurrency deployments; lower for
//                          hosting plans with a tight connection limit.
// PG_CONNECTION_TIMEOUT_MS — ms to wait for a free client before throwing
//                          (default 5000). Prevents withDb callers from
//                          hanging forever when every slot is occupied.
// PG_IDLE_TIMEOUT_MS     — ms an idle client stays open before being closed
//                          (default 30000). Keeps Supabase / managed-PG
//                          connection limits from being exhausted by dormant
//                          slots between request bursts.
// PG_STATEMENT_TIMEOUT_MS — per-query execution ceiling sent to the server
//                          (default 10000). Stops long-running queries from
//                          holding a client indefinitely and causing cascading
//                          stalls on other requests.
// ---------------------------------------------------------------------------

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function getPoolConfig() {
  return {
    max: parsePositiveInt(process.env.PG_POOL_MAX, 20),
    connectionTimeoutMillis: parsePositiveInt(
      process.env.PG_CONNECTION_TIMEOUT_MS,
      5_000,
    ),
    idleTimeoutMillis: parsePositiveInt(process.env.PG_IDLE_TIMEOUT_MS, 30_000),
    // statement_timeout is a Postgres session-level parameter. Passing it via
    // the connection string's options query parameter means every client
    // checked out of this pool enforces it automatically.
    options: `--statement_timeout=${parsePositiveInt(process.env.PG_STATEMENT_TIMEOUT_MS, 10_000)}`,
  };
}

let pool = null;

function getPool() {
  if (pool) return pool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  pool = new pg.Pool({
    connectionString: databaseUrl,
    ...getPoolConfig(),
  });

  // Surface unexpected errors on idle clients so they do not silently crash
  // the process or swallow stack traces. The pool itself stays alive — pg
  // will remove the broken client and replace it on the next checkout.
  pool.on('error', (err) => {
    console.error('[pg.Pool] Unexpected error on idle client:', err.message);
  });

  return pool;
}

export let withDbOverride = null;

// Mock database client for file-based fallback when PostgreSQL is not configured
class MockClient {
  async query(sql, params = []) {
    const cleanedSql = sql.trim().replace(/\s+/g, " ");
    const content = await readContent();

    // 1. List events
    if (
      cleanedSql.includes("select * from events order by created_at desc limit")
    ) {
      const limit = params[0] ?? 20;
      const offset = params[1] ?? 0;
      const events = content.events || [];
      const sorted = [...events].sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at) -
          new Date(a.createdAt || a.created_at)
      );
      const sliced = sorted.slice(offset, offset + limit);
      const rows = sliced.map((e) => ({
        id: e.id,
        name: e.name,
        short_name: e.shortName || e.short_name,
        date_text: e.date || e.date_text,
        description: e.description,
        status: e.status,
        icon: e.icon,
        tags: e.tags,
        created_at: e.createdAt || e.created_at,
        updated_at: e.updatedAt || e.updated_at,
      }));
      return { rows };
    }

    // 2. Count events
    if (cleanedSql.includes("select count(*)::int as total from events")) {
      const total = (content.events || []).length;
      return { rows: [{ total }] };
    }

    // 3. Create or update event (conflict update)
    if (
      cleanedSql.startsWith("insert into events") &&
      cleanedSql.includes("on conflict (id)")
    ) {
      const [id, name, shortName, date, description, status, icon, tags] =
        params;
      content.events = content.events || [];
      const existingIdx = content.events.findIndex((e) => e.id === id);
      const now = new Date().toISOString();
      const rowData = {
        id,
        name,
        short_name: shortName,
        date_text: date,
        description,
        status,
        icon,
        tags,
        created_at:
          existingIdx >= 0
            ? content.events[existingIdx].createdAt ||
              content.events[existingIdx].created_at ||
              now
            : now,
        updated_at: now,
      };
      const storeData = {
        id,
        name,
        shortName,
        date,
        description,
        status,
        icon,
        tags,
        createdAt: rowData.created_at,
        updatedAt: now,
      };
      if (existingIdx >= 0) {
        content.events[existingIdx] = storeData;
      } else {
        content.events.unshift(storeData);
      }
      await writeContent(content);
      return { rows: [rowData] };
    }

    // 4. Update event
    if (cleanedSql.startsWith("update events set")) {
      const [id, name, shortName, date, description, status, icon, tags] =
        params;
      content.events = content.events || [];
      const idx = content.events.findIndex((e) => e.id === id);
      if (idx < 0) return { rows: [] };
      const existing = content.events[idx];
      const now = new Date().toISOString();

      const updatedStore = {
        ...existing,
        name: name !== null ? name : existing.name,
        shortName:
          shortName !== null
            ? shortName
            : existing.shortName || existing.short_name,
        date: date !== null ? date : existing.date || existing.date_text,
        description: description !== null ? description : existing.description,
        status: status !== null ? status : existing.status,
        icon: icon !== null ? icon : existing.icon,
        tags: tags !== null ? tags : existing.tags,
        updatedAt: now,
      };
      content.events[idx] = updatedStore;
      await writeContent(content);

      const rowData = {
        id,
        name: updatedStore.name,
        short_name: updatedStore.shortName,
        date_text: updatedStore.date,
        description: updatedStore.description,
        status: updatedStore.status,
        icon: updatedStore.icon,
        tags: updatedStore.tags,
        created_at: updatedStore.createdAt || updatedStore.created_at,
        updated_at: now,
      };
      return { rows: [rowData] };
    }

    // 5. Delete event
    if (cleanedSql.startsWith("delete from events where id=$1")) {
      const [id] = params;
      content.events = content.events || [];
      const before = content.events.length;
      content.events = content.events.filter((e) => e.id !== id);
      await writeContent(content);
      return { rowCount: before - content.events.length };
    }

    // 6. List activity events
    if (
      cleanedSql.includes("select * from activity_events where activity_key=$1")
    ) {
      const [activityKey, limit, offset] = params;
      content.activityEvents = content.activityEvents || {};
      const events = content.activityEvents[activityKey] || [];
      const sorted = [...events].sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at) -
          new Date(a.createdAt || a.created_at)
      );
      const sliced = sorted.slice(offset, offset + limit);
      const rows = sliced.map((e) => ({
        id: e.id,
        activity_key: activityKey,
        name: e.name,
        date_text: e.date || e.date_text,
        tagline: e.tagline,
        description: e.description,
        status: e.status,
        created_by_name: e.createdBy?.name || "",
        created_by_email: e.createdBy?.email || "",
        created_by_phone: e.createdBy?.phone || "",
        created_at: e.createdAt || e.created_at || new Date().toISOString(),
      }));
      return { rows };
    }

    // 7. Count activity events
    if (
      cleanedSql.includes(
        "select count(*)::int as total from activity_events where activity_key=$1"
      )
    ) {
      const [activityKey] = params;
      content.activityEvents = content.activityEvents || {};
      const total = (content.activityEvents[activityKey] || []).length;
      return { rows: [{ total }] };
    }

    // 8. Create activity event
    if (cleanedSql.startsWith("insert into activity_events")) {
      const [
        id,
        activityKey,
        name,
        date,
        tagline,
        description,
        status,
        createdByName,
        createdByEmail,
        createdByPhone,
      ] = params;
      content.activityEvents = content.activityEvents || {};
      content.activityEvents[activityKey] =
        content.activityEvents[activityKey] || [];
      const now = new Date().toISOString();
      const newEventStore = {
        id,
        name,
        date,
        tagline,
        description,
        status,
        createdBy: {
          name: createdByName,
          email: createdByEmail,
          phone: createdByPhone,
        },
        createdAt: now,
      };
      content.activityEvents[activityKey].unshift(newEventStore);
      await writeContent(content);

      const rowData = {
        id,
        activity_key: activityKey,
        name,
        date_text: date,
        tagline,
        description,
        status,
        created_by_name: createdByName,
        created_by_email: createdByEmail,
        created_by_phone: createdByPhone,
        created_at: now,
      };
      return { rows: [rowData] };
    }

    // 9. Delete activity event
    if (
      cleanedSql.startsWith(
        "delete from activity_events where activity_key=$1 and id=$2"
      )
    ) {
      const [activityKey, eventId] = params;
      content.activityEvents = content.activityEvents || {};
      const list = content.activityEvents[activityKey] || [];
      const before = list.length;
      content.activityEvents[activityKey] = list.filter(
        (e) => e.id !== eventId
      );
      await writeContent(content);
      return { rowCount: before - content.activityEvents[activityKey].length };
    }

    // 10. List core team members
    if (
      cleanedSql.startsWith(
        "select id, name, email, phone, created_at from core_team_members"
      )
    ) {
      const members = content.coreTeam || [];
      const rows = members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.whatsapp || m.phone,
        created_at: m.createdAt || m.created_at || new Date().toISOString(),
      }));
      return { rows };
    }

    // 11. Insert core team member
    if (cleanedSql.startsWith("insert into core_team_members")) {
      const [name, email, phone] = params;
      content.coreTeam = content.coreTeam || [];
      const now = new Date().toISOString();
      const id = `core-${Date.now()}`;
      const newMember = {
        id,
        name,
        email,
        whatsapp: phone,
        createdAt: now,
      };
      content.coreTeam.push(newMember);
      await writeContent(content);
      return {
        rows: [
          {
            id,
            name,
            email,
            phone,
            created_at: now,
          },
        ],
      };
    }

    // 12. Delete core team member
    if (cleanedSql.startsWith("delete from core_team_members")) {
      const [id] = params;
      content.coreTeam = content.coreTeam || [];
      const before = content.coreTeam.length;
      content.coreTeam = content.coreTeam.filter((m) => m.id !== id);
      await writeContent(content);
      return { rowCount: before - content.coreTeam.length };
    }

    // 13. Select 1 from core team members
    if (cleanedSql.includes("select 1 from core_team_members")) {
      const [name, email, phone] = params;
      content.coreTeam = content.coreTeam || [];
      const exists = content.coreTeam.some(
        (m) =>
          String(m.name).toLowerCase() === String(name).toLowerCase() &&
          String(m.email).toLowerCase() === String(email).toLowerCase() &&
          String(m.whatsapp || m.phone || "").replace(/\D/g, "") ===
            String(phone).replace(/\D/g, "")
      );
      return { rows: exists ? [1] : [] };
    }

    return { rows: [], rowCount: 0 };
  }
}

export async function withDb(fn) {
  if (withDbOverride) {
    return await withDbOverride(fn);
  }
  const p = getPool();
  if (!p) {
    const client = new MockClient();
    return await fn(client);
  }
  const client = await p.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Returns a snapshot of live pool metrics useful for health checks and
 * performance monitoring. Returns null when the pool has not been initialised
 * (DATABASE_URL not set).
 */
export function getPoolStats() {
  if (!pool) return null;
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}
export function setWithDbOverride(fn) {
  withDbOverride = fn;
}

export { pg };

