/* Migration: Create Learning Paths
   Description: Core schema for learning paths and progress tracking
   Version: 1.0.0
   Date: 2026-06-10
*/

export const up = (pgm) => {
  pgm.createTable('learning_paths', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },

    name: {
      type: 'text',
      notNull: true,
    },

    description: {
      type: 'text',
    },

    estimated_weeks: {
      type: 'integer',
      notNull: true,
    },

    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createTable('learning_path_levels', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },

    learning_path_id: {
      type: 'uuid',
      notNull: true,
      references: 'learning_paths',
      onDelete: 'CASCADE',
    },

    level_name: {
      type: 'text',
      notNull: true,
    },

    objectives: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },

    skills: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },

    resources: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },

    certifications: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },
  });

  pgm.createTable('user_learning_paths', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },

    user_id: {
      type: 'text',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },

    learning_path_id: {
      type: 'uuid',
      notNull: true,
      references: 'learning_paths',
      onDelete: 'CASCADE',
    },

    current_level: {
      type: 'text',
      notNull: true,
      default: 'Beginner',
    },

    progress_percentage: {
      type: 'integer',
      notNull: true,
      default: 0,
    },

    started_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },

    estimated_completion_date: {
      type: 'timestamptz',
    },
  });

  pgm.createTable('learning_path_milestones', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },

    user_learning_path_id: {
      type: 'uuid',
      notNull: true,
      references: 'user_learning_paths',
      onDelete: 'CASCADE',
    },

    title: {
      type: 'text',
      notNull: true,
    },

    milestone_type: {
      type: 'text',
      notNull: true,
    },

    completed: {
      type: 'boolean',
      notNull: true,
      default: false,
    },

    completed_at: {
      type: 'timestamptz',
    },
  });

  pgm.createIndex('user_learning_paths', 'user_id');
  pgm.createIndex('user_learning_paths', 'learning_path_id');
};

export const down = (pgm) => {
  pgm.dropTable('learning_path_milestones', {
    ifExists: true,
    cascade: true,
  });

  pgm.dropTable('user_learning_paths', {
    ifExists: true,
    cascade: true,
  });

  pgm.dropTable('learning_path_levels', {
    ifExists: true,
    cascade: true,
  });

  pgm.dropTable('learning_paths', {
    ifExists: true,
    cascade: true,
  });
};
