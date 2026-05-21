const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const protect = require('../middleware/authMiddleware');

// Get questions by domain and difficulty
router.get('/questions', protect, async (req, res) => {
  try {
    const { domain, difficulty, type } = req.query;
    const filter = {};
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;

    const questions = await Question.find(filter).limit(10);
    res.status(200).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new question (admin only)
router.post('/questions', protect, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;