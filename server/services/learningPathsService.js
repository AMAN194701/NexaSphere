import { learningPathsRepository } from '../repositories/learningPathsRepository.js';

export const learningPathsService = {
  async getLearningPaths() {
    return learningPathsRepository.getAllLearningPaths();
  },

  async getLearningPathById(id) {
    return learningPathsRepository.getLearningPathById(id);
  },

  async enrollUser(userId, learningPathId) {
    return learningPathsRepository.enrollUser(userId, learningPathId);
  },

  async getUserDashboard(userId) {
    const paths = await learningPathsRepository.getUserLearningPath(userId);

    return {
      enrolledPaths: paths,
      totalPaths: paths.length,
    };
  },

  async updateProgress(userLearningPathId, progressPercentage, currentLevel) {
    return learningPathsRepository.updateProgress(
      userLearningPathId,
      progressPercentage,
      currentLevel
    );
  },

  async createMilestone(userLearningPathId, title, milestoneType) {
    return learningPathsRepository.createMilestone(userLearningPathId, title, milestoneType);
  },

  async getMilestones(userLearningPathId) {
    return learningPathsRepository.getMilestones(userLearningPathId);
  },

  calculateProgress(completed, total) {
    if (!total) return 0;

    return Math.round((completed / total) * 100);
  },
};
