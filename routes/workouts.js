const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const WorkoutCard = require('../models/WorkoutCard');
const Progress = require('../models/Progress');
const User = require('../models/User');

// GET /workouts/shuffle - Show shuffle page
router.get('/shuffle', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);

  const streak = user ? user.streak : 0;
  const totalWorkouts = await Progress.countDocuments({ userId: user._id });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedToday = await Progress.countDocuments({
    userId: user._id,
    createdAt: { $gte: todayStart }
  });

  res.render('shuffle', { 
    workout: null,
    streak,
    totalWorkouts,
    completedToday
  });
});

// POST /workouts/shuffle - Get random workout
router.post('/shuffle', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const streak = user ? user.streak : 0;
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedToday = await Progress.countDocuments({
      userId: user._id,
      createdAt: { $gte: todayStart }
    });

    const count = await WorkoutCard.countDocuments();
    const random = Math.floor(Math.random() * count);
    const workout = await WorkoutCard.findOne().skip(random);

    res.render('shuffle', { 
      workout,
      streak,
      totalWorkouts,
      completedToday
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error shuffling workout');
  }
});


// POST /workouts/complete/:id - Mark workout as complete
router.post('/complete/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    const progress = new Progress({
      userId: user._id,
      workoutId: req.params.id,
      challengeType: req.body.challengeType || 'regular'
    });
    await progress.save();

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const lastWorkout = user.lastWorkoutDate 
      ? new Date(user.lastWorkoutDate).setHours(0, 0, 0, 0) 
      : null;

    if (!lastWorkout || lastWorkout < todayStart) {
      await user.updateStreak();
    }

    res.redirect('/progress');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error completing workout');
  }
});

module.exports = router;
