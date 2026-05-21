const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');
const UserScore = require('../models/UserScore');
const { generateQuestions, evaluateAnswer } = require('../services/aiService');

// Start a new interview session
exports.startSession = async (req, res) => {
  try {
    const { domain, difficulty } = req.body;
    const userId = req.user._id;

    // Fetch questions from DB or generate via AI
    let questions = await Question.find({ domain, difficulty }).limit(5);

    if (questions.length < 5) {
      const aiQuestions = await generateQuestions(domain, difficulty);
      // Save AI-generated questions to DB
      const saved = await Question.insertMany(aiQuestions);
      questions = [...questions, ...saved].slice(0, 5);
    }

    const session = await InterviewSession.create({
      userId,
      domain,
      difficulty,
      questions: questions.map(q => q._id)
    });

    res.status(201).json({
      success: true,
      sessionId: session._id,
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit an answer for a question
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, answerText } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const question = await Question.findById(questionId);

    // Get AI feedback on the answer
    const { feedback, score } = await evaluateAnswer(question.questionText, answerText);

    session.answers.push({ questionId, answerText, aiFeedback: feedback, score });
    await session.save();

    res.status(200).json({ success: true, feedback, score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete the session and calculate total score
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const totalScore = session.answers.reduce((sum, a) => sum + (a.score || 0), 0);

    session.totalScore = totalScore;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Save score record
    await UserScore.create({
      userId: session.userId,
      sessionId: session._id,
      domain: session.domain,
      totalScore,
      technicalScore: totalScore * 0.7,
      communicationScore: totalScore * 0.3
    });

    res.status(200).json({ success: true, totalScore, sessionId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all sessions for a user
exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};