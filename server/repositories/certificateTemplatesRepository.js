import { withDb } from './db.js';

let schemaReady = null;

async function ensureSchema(client) {
  await client.query(`
    create table if not exists certificate_templates (
      id text primary key,
      name text not null,
      background_url text,
      is_default boolean default false,
      elements jsonb default '[]',
      created_at timestamp with time zone default current_timestamp,
      updated_at timestamp with time zone default current_timestamp
    );
  `);
}

async function ensureReady() {
  if (!schemaReady) {
    schemaReady = withDb(async (client) => ensureSchema(client)).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function getTemplates() {
  await ensureReady();
  return withDb(async (client) => {
    const { rows } = await client.query('select * from certificate_templates order by created_at desc');
    if (rows.length === 0) {
      // Return a fallback template if empty
      return [{
        id: 'default',
        name: 'Default Template',
        background_url: '',
        is_default: true,
        elements: [
          { type: 'text', id: 'name', value: '{participant_name}', x: 400, y: 300, fontSize: 32, color: '#000000', font: 'Arial' },
          { type: 'text', id: 'course', value: '{course_name}', x: 400, y: 360, fontSize: 24, color: '#444444', font: 'Arial' },
          { type: 'text', id: 'date', value: '{date}', x: 400, y: 420, fontSize: 18, color: '#888888', font: 'Arial' }
        ]
      }];
    }
    return rows;
  });
}

export async function saveTemplate(template) {
  await ensureReady();
  return withDb(async (client) => {
    const id = template.id || `tpl_${Date.now()}`;
    const name = template.name || 'Untitled Template';
    const backgroundUrl = template.background_url || '';
    const isDefault = template.is_default || false;
    const elements = JSON.stringify(template.elements || []);

    if (isDefault) {
      // Unset other defaults
      await client.query('update certificate_templates set is_default = false');
    }

    const { rows } = await client.query(`
      insert into certificate_templates (id, name, background_url, is_default, elements, updated_at)
      values ($1, $2, $3, $4, $5, current_timestamp)
      on conflict (id) do update set
        name = excluded.name,
        background_url = excluded.background_url,
        is_default = excluded.is_default,
        elements = excluded.elements,
        updated_at = current_timestamp
      returning *
    `, [id, name, backgroundUrl, isDefault, elements]);

    return rows[0];
  });
}

export async function deleteTemplate(id) {
  await ensureReady();
  return withDb(async (client) => {
    await client.query('delete from certificate_templates where id = $1', [id]);
  });
}
