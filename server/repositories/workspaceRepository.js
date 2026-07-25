import { withDb } from './db.js';

let schemaReady = null;

async function ensureSchema(client) {
  await client.query(`
    create table if not exists workspace_documents (
      room_id text primary key,
      content text not null default '',
      version integer not null default 0,
      updated_at timestamptz not null default now()
    )
  `);
}

async function ensureReady() {
  if (!schemaReady) {
    schemaReady = withDb(async (client) => {
      await ensureSchema(client);
    });
  }
  return schemaReady;
}

export async function getWorkspaceDocument(roomId) {
  await ensureReady();

  return withDb(async (client) => {
    const { rows } = await client.query(
      'select room_id, content, version, updated_at from workspace_documents where room_id = $1',
      [roomId],
    );

    return rows.length ? rows[0] : null;
  });
}

export async function saveWorkspaceDocument(roomId, content, newVersion) {
  await ensureReady();

  return withDb(async (client) => {
    const { rows } = await client.query(
      `insert into workspace_documents (room_id, content, version, updated_at)
       values ($1, $2, $3, now())
       on conflict (room_id) do update set
         content = excluded.content,
         version = excluded.version,
         updated_at = now()
       returning version`,
      [roomId, content, newVersion],
    );

    return rows[0];
  });
}

export async function deleteWorkspaceDocument(roomId) {
  await ensureReady();

  return withDb(async (client) => {
    await client.query('delete from workspace_documents where room_id = $1', [roomId]);
  });
}
