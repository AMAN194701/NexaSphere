const mongoose = require('mongoose');

const userScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  technicalScore: {
    type: Number,
    default: 0
  },
  communicationScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  timeTaken: {       // in seconds
    type: Number,
    default: 0
  },
  strengths: [String],
  weaknesses: [String]
}, { timestamps: true });

module.exports = mongoose.model('UserScore', userScoreSchema);