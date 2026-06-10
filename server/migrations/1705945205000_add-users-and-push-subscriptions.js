/* Migration: Add Users and Push Subscriptions Tables
   Description: Creates users table for user profiles and push_subscriptions table for web push notification support
   Version: 1.0.0
   Date: 2026-06-10
*/

export const up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, notNull: true, default: pgm.func('gen_random_uuid()') },
    username: { type: 'text', notNull: true },
    display_name: { type: 'text' },
    avatar_url: { type: 'text' },
    bio: { type: 'text' },
    email: { type: 'text' },
    admin_roles: { type: 'jsonb', notNull: true, default: '[]' },
    last_login: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('users', 'unique_username', {
    unique: 'username',
  });

  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'created_at');

  pgm.createTable('push_subscriptions', {
    endpoint: { type: 'text', primaryKey: true, notNull: true },
    p256dh: { type: 'text', notNull: true },
    auth: { type: 'text', notNull: true },
    subscription: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('push_subscriptions', 'created_at', {
    name: 'idx_push_subscriptions_created',
    direction: { created_at: 'DESC' },
  });
};

export const down = (pgm) => {
  pgm.dropTable('push_subscriptions', { ifExists: true, cascade: true });
  pgm.dropTable('users', { ifExists: true, cascade: true });
};
