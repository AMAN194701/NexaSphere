import { learningPathsService } from '../services/learningPathsService.js';

export async function listLearningPaths(req, res) {
  try {
    const paths = await learningPathsService.getLearningPaths();

    return res.json({
      paths,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getLearningPath(req, res) {
  try {
    const path = await learningPathsService.getLearningPathById(req.params.id);

    if (!path) {
      return res.status(404).json({
        error: 'Learning path not found',
      });
    }

    return res.json({
      path,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function enrollUser(req, res) {
  try {
    const { userId, learningPathId } = req.body;

    const enrollment = await learningPathsService.enrollUser(userId, learningPathId);

    return res.status(201).json({
      enrollment,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getDashboard(req, res) {
  try {
    const dashboard = await learningPathsService.getUserDashboard(req.params.userId);

    return res.json(dashboard);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
