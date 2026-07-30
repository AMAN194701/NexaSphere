import { supabaseRequest } from '../storage/supabaseClient.js';

/**
 * Repository for Learning Path management.
 * Handles metadata and milestone definitions.
 */
export const learningPathsRepository = {
  async listAll() {
    return await supabaseRequest('learning_paths?is_active=eq.true&order=category.asc');
  },

  async getById(id) {
    const [path] = await supabaseRequest(`learning_paths?id=eq.${id}`);
    if (!path) return null;

    const milestones = await supabaseRequest(
      `learning_path_milestones?path_id=eq.${id}&order=order_index.asc`
    );

    return { ...path, milestones };
  },

  async getUserEnrollment(userId, pathId) {
    const [enrollment] = await supabaseRequest(
      `user_learning_paths?user_id=eq.${userId}&path_id=eq.${pathId}`
    );
    return enrollment;
  },

  async enrollUser(userId, pathId, targetDate, initialLevel = 1) {
    return await supabaseRequest('user_learning_paths', {
      method: 'POST',
      body: [
        {
          user_id: userId,
          path_id: pathId,
          target_completion_date: targetDate,
          status: 'enrolled',
          progress_percent: 0,
          current_level: initialLevel,
        },
      ],
    });
  },

  async updateProgress(enrollmentId, updates) {
    return await supabaseRequest(`user_learning_paths?id=eq.${enrollmentId}`, {
      method: 'PATCH',
      body: { ...updates, last_activity_at: new Date().toISOString() },
    });
  },

  async completeMilestone(userPathId, milestoneId) {
    return await supabaseRequest('user_milestone_completions', {
      method: 'POST',
      body: [{ user_path_id: userPathId, milestone_id: milestoneId }],
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
