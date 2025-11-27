// ============================================
// FILE: models/WorkoutCard.js
// ============================================
const mongoose = require('mongoose');

const workoutCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance'],
    default: 'strength'
  },
  image: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkoutCard', workoutCardSchema);
