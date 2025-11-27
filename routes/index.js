const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const WorkoutCard = require('../models/WorkoutCard');

// Public Homepage
router.get('/', (req, res) => {
  res.render('index');
});

// Dashboard (Protected)
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const completedToday = await Progress.countDocuments({
      userId: user._id,
      completedAt: { $gte: todayStart }
    });
    
    res.render('dashboard', {
      user,
      totalWorkouts,
      completedToday,
      streak: user.streakCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;
