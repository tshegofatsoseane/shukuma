const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  teamCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// generte team code befor valdation
teamSchema.pre('validate', function(next) {
  if (!this.teamCode) {
    this.teamCode = generateTeamCode();
  }
  next();
});

// helpr functio to generte team code
function generateTeamCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = mongoose.model('Team', teamSchema);