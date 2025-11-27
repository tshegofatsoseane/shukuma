const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');

// GET /progress - View progress log
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const progressLog = await Progress.find({ userId: user._id })
      .populate('workoutId')
      .sort({ completedAt: -1 })
      .limit(50);
    
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });
    
    res.render('progress', {
      progressLog,
      totalWorkouts,
      streak: user.streakCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading progress');
  }
});

module.exports = router;
