const mongoose = require('mongoose');

const workoutAssignmentSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutCard',
    required: true
  },
  message: {
    type: String,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'declined'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

workoutAssignmentSchema.index({ to: 1, status: 1 });

module.exports = mongoose.model('WorkoutAssignment', workoutAssignmentSchema);