const PerformanceReport = require('../models/PerformanceReport');
const InterviewSession = require('../models/InterviewSession');
const UserScore = require('../models/UserScore');
const { generateFeedbackSummary } = require('../services/aiService');

// Generate performance report for a session
exports.generateReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId).populate('questions');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const score = await UserScore.findOne({ sessionId });

    // Collect all AI feedback from answers
    const allFeedback = session.answers.map(a => a.aiFeedback).join(' ');

    const { strengths, weaknesses, suggestions, summary } =
      await generateFeedbackSummary(allFeedback, session.domain);

    const readiness =
      score.totalScore >= 80 ? 'Job Ready' :
      score.totalScore >= 60 ? 'Almost Ready' :
      score.totalScore >= 40 ? 'Needs Practice' : 'Not Ready';

    const report = await PerformanceReport.create({
      userId: session.userId,
      sessionId,
      overallScore: score.totalScore,
      strengths,
      weaknesses,
      suggestions,
      aiFeedbackSummary: summary,
      readinessLevel: readiness
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reports for a user
exports.getUserReports = async (req, res) => {
  try {
    const reports = await PerformanceReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single report
exports.getReportById = async (req, res) => {
  try {
    const report = await PerformanceReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};