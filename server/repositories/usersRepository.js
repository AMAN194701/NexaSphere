import { withDb } from './db.js';

export const usersRepository = {
  async getAllPublicUsers() {
    return withDb(async (client) => {
      const { rows } = await client.query(`
        SELECT 
          id, 
          username, 
          display_name, 
          avatar_url, 
          bio, 
          created_at as joined_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 100
      `);
      return rows;
    });
  },

  async getAllUsersAdmin() {
    return withDb(async (client) => {
      const { rows } = await client.query(`
        SELECT 
          id, 
          username, 
          display_name, 
          avatar_url, 
          bio, 
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

  async updateUser(id, updates) {
    return withDb(async (client) => {
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
