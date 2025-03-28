const mongoose = require('mongoose');

const clinicalRatingSchema = new mongoose.Schema({
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
  evaluationPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  overallRating: {
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comments: String
  },
  domainRatings: [{
    domain: {
      type: String,
      required: true,
      enum: [
        'articulation',
        'language_comprehension',
        'language_expression',
        'voice',
        'fluency',
        'pragmatics',
        'feeding_swallowing',
        'cognition'
      ]
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comments: String
  }],
  recommendations: [{
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClinicalRating', clinicalRatingSchema); 