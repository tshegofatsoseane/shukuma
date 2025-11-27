// ============================================
// FILE: models/User.js
// ============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastWorkoutDate: {
    type: Date,
    default: null
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastWorkout = this.lastWorkoutDate ? new Date(this.lastWorkoutDate).setHours(0, 0, 0, 0) : null;
  
  if (!lastWorkout) {
    // First workout ever
    this.streakCount = 1;
  } else {
    const dayDiff = (today - lastWorkout) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      // Consecutive day
      this.streakCount += 1;
    } else if (dayDiff > 1) {
      // Streak broken
      this.streakCount = 1;
    }
    // dayDiff === 0 means already worked out today, no change
  }
  
  this.lastWorkoutDate = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
