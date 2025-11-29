// ============================================
// FILE: models/Progress.js
// ============================================
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutCard',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  challengeType: {
    type: String,
    enum: ['daily', 'timed', 'regular', 'team'],
    default: 'regular'
  },
  cheers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      default: '💪'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});
// Index for efficient queries
progressSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('Progress', progressSchema);
