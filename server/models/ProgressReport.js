const mongoose = require('mongoose');

const progressReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapyPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapyPlan',
    required: true
  },
  sessionDetails: {
    date: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    activitiesPerformed: [{
      activity: {
        type: String,
        required: true
      },
      performance: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        required: true
      },
      notes: String
    }]
  },
  goalProgress: [{
    goal: {
      type: String,
      required: true
    },
    progress: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true
    },
    notes: String
  }],
  observations: {
    type: String,
    required: true
  },
  recommendations: String,
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProgressReport', progressReportSchema); 