const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  domain: {
    type: String,
    enum: ['Web Development', 'DSA', 'AI/ML', 'DBMS', 'Operating Systems'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'coding', 'descriptive'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [String],           // for MCQ only
  correctAnswer: String,       // for MCQ only
  sampleAnswer: String,        // for descriptive/coding reference
  tags: [String],
  isAIGenerated: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);