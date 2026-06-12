import { withDb } from './db.js';

function mapLearningPath(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    estimatedWeeks: row.estimated_weeks,
    createdAt: row.created_at,
  };
}

function mapUserPath(row) {
  return {
    id: row.id,
    userId: row.user_id,
    learningPathId: row.learning_path_id,
    currentLevel: row.current_level,
    progressPercentage: row.progress_percentage,
    startedAt: row.started_at,
    estimatedCompletionDate: row.estimated_completion_date,
  };
}

export const learningPathsRepository = {
  async getAllLearningPaths() {
    return withDb(async (client) => {
      const { rows } = await client.query('select * from learning_paths order by created_at desc');

      return rows.map(mapLearningPath);
    });
  },

  async getLearningPathById(id) {
    return withDb(async (client) => {
      const { rows } = await client.query('select * from learning_paths where id = $1', [id]);

      if (!rows.length) return null;

      return mapLearningPath(rows[0]);
    });
  },

  async enrollUser(userId, learningPathId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `
        insert into user_learning_paths
        (user_id, learning_path_id)
        values ($1,$2)
        returning *
        `,
        [userId, learningPathId]
      );

      return mapUserPath(rows[0]);
    });
  },

  async getUserLearningPath(userId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `
        select *
        from user_learning_paths
        where user_id = $1
        `,
        [userId]
      );

      return rows.map(mapUserPath);
    });
  },

  async updateProgress(id, progressPercentage, currentLevel) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `
        update user_learning_paths
        set
          progress_percentage = $2,
          current_level = $3
        where id = $1
        returning *
        `,
        [id, progressPercentage, currentLevel]
      );

      if (!rows.length) return null;

      return mapUserPath(rows[0]);
    });
  },

  async createMilestone(userLearningPathId, title, milestoneType) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `
        insert into learning_path_milestones
        (
          user_learning_path_id,
          title,
          milestone_type
        )
        values ($1,$2,$3)
        returning *
        `,
        [userLearningPathId, title, milestoneType]
      );

      return rows[0];
    });
  },

  async getMilestones(userLearningPathId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `
        select *
        from learning_path_milestones
        where user_learning_path_id = $1
        order by completed_at desc nulls last
        `,
        [userLearningPathId]
      );

      return rows;
    });
  },
};
