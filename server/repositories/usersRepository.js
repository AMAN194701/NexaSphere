import { withDb } from './db.js';

function buildUserListQuery({ includeEmail = false, page = 1, limit = 20, role }) {
  const selectColumns = [
    'id',
    'username',
    'display_name',
    'avatar_url',
    'bio',
    'phone_number',
    'created_at as joined_at',
  ];

  if (includeEmail) {
    selectColumns.push('email', 'admin_roles', 'last_login');
  }

  const params = [limit, (page - 1) * limit];
  const conditions = [];

  if (role) {
    params.push(role);
    conditions.push(`(role = $${params.length} OR admin_roles = $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return {
    text: `
      SELECT
        ${selectColumns.join(',\n        ')}
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `,
    values: params,
  };
}

export const usersRepository = {
  async getAllPublicUsers({ page = 1, limit = 20, role } = {}) {
    return withDb(async (client) => {
      const { text, values } = buildUserListQuery({ page, limit, role });
      const { rows } = await client.query(text, values);
      const { rows } = await client.query(`
        SELECT 
          id, 
          username, 
          display_name, 
          avatar_url, 
          bio, 
          phone_number,
          created_at as joined_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 100
      `);
      return rows;
    });
  },

  async getAllUsersAdmin({ page = 1, limit = 20, role } = {}) {
    return withDb(async (client) => {
      const { text, values } = buildUserListQuery({ includeEmail: true, page, limit, role });
      const { rows } = await client.query(text, values);
      const { rows } = await client.query(`
        SELECT 
          id, 
          username, 
          display_name, 
          avatar_url, 
          bio, 
          phone_number,
          created_at as joined_at,
          email,
          admin_roles,
          last_login
        FROM users
        ORDER BY created_at DESC
      `);
      return rows;
    });
  },

  async createUser({ username, display_name, email, role }) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (username, display_name, email, admin_roles, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
        [username, display_name, email, role || 'member']
      );
      return rows[0];
    });
  },

  async getUserById(id) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        'SELECT id, username, display_name, email, phone_number, admin_roles, created_at FROM users WHERE id = $1',
        'SELECT id, username, display_name, email, admin_roles, created_at FROM users WHERE id = $1',
        [id]
      );
      return rows[0] || null;
    });
  },

  async getUserByEmail(email) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        'SELECT id, username, display_name, email, admin_roles, created_at FROM users WHERE email = $1',
        [email]
      );
      return rows[0] || null;
    });
  },

  async updateUser(id, updates) {
    return withDb(async (client) => {
      const fields = [];
      const values = [];
      let i = 1;
      if (updates.display_name !== undefined) {
        fields.push(`display_name = $${i++}`);
        values.push(updates.display_name);
      }
      if (updates.email !== undefined) {
        fields.push(`email = $${i++}`);
        values.push(updates.email);
      }
      if (updates.phone_number !== undefined) {
        fields.push(`phone_number = $${i++}`);
        values.push(updates.phone_number);
      }
      if (updates.admin_roles !== undefined) {
        fields.push(`admin_roles = $${i++}`);
        values.push(updates.admin_roles);
      }
      if (fields.length === 0) return null;
      values.push(id);
      const queryText = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, username, display_name, email, phone_number, admin_roles, created_at as joined_at`;
      const { rows } = await client.query(queryText, values);
      const hasDisplayName = updates.display_name !== undefined;
      const hasEmail = updates.email !== undefined;
      const hasAdminRoles = updates.admin_roles !== undefined;

      if (!hasDisplayName && !hasEmail && !hasAdminRoles) return null;

      if (hasDisplayName && hasEmail && hasAdminRoles) {
        const { rows } = await client.query(
          `UPDATE users
           SET display_name = $1, email = $2, admin_roles = $3
           WHERE id = $4
           RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
          [updates.display_name, updates.email, updates.admin_roles, id]
        );
        return rows[0] || null;
      }

      if (hasDisplayName && hasEmail) {
        const { rows } = await client.query(
          `UPDATE users
           SET display_name = $1, email = $2
           WHERE id = $3
           RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
          [updates.display_name, updates.email, id]
        );
        return rows[0] || null;
      }

      if (hasDisplayName && hasAdminRoles) {
        const { rows } = await client.query(
          `UPDATE users
           SET display_name = $1, admin_roles = $2
           WHERE id = $3
           RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
          [updates.display_name, updates.admin_roles, id]
        );
        return rows[0] || null;
      }

      if (hasEmail && hasAdminRoles) {
        const { rows } = await client.query(
          `UPDATE users
           SET email = $1, admin_roles = $2
           WHERE id = $3
           RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
          [updates.email, updates.admin_roles, id]
        );
        return rows[0] || null;
      }

      if (hasDisplayName) {
        const { rows } = await client.query(
          `UPDATE users
           SET display_name = $1
           WHERE id = $2
           RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
          [updates.display_name, id]
        );
        return rows[0] || null;
      }

      if (hasEmail) {
        const { rows } = await client.query(
          `UPDATE users
           SET email = $1
           WHERE id = $2
           RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
          [updates.email, id]
        );
        return rows[0] || null;
      }

      const { rows } = await client.query(
        `UPDATE users
         SET admin_roles = $1
         WHERE id = $2
         RETURNING id, username, display_name, email, admin_roles, created_at as joined_at`,
        [updates.admin_roles, id]
      );
      return rows[0] || null;
    });
  },

  async deactivateUser(id) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `UPDATE users SET admin_roles = 'deactivated' WHERE id = $1
         RETURNING id, username, display_name, email, admin_roles`,
        [id]
      );
      return rows[0] || null;
    });
  },
};
