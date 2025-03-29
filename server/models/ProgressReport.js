const mongoose = require('mongoose');

const progressReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionDetails: {
    date: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      required: true,
      enum: ['individual', 'group', 'family']
    }
  },
  progress: {
    goals: [{
      type: String,
      required: true
    }],
    achievements: [{
      type: String,
      required: true
    }],
    challenges: [{
      type: String,
      required: true
    }]
  },
  nextSteps: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProgressReport', progressReportSchema); 