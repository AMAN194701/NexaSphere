const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema({
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
  overallScore: {
    type: Number,
    required: true
  },
  domainScores: {
    type: Map,
    of: Number
  },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  aiFeedbackSummary: {
    type: String
  },
  readinessLevel: {
    type: String,
    enum: ['Not Ready', 'Needs Practice', 'Almost Ready', 'Job Ready'],
    default: 'Needs Practice'
  }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReport', performanceReportSchema);