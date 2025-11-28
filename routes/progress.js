//progress-related routes (trying to keep files neat-ish)
const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
// customm middleware
const { requireAuth } = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');

// basically the user's gym diary
router.get('/', requireAuth, async (req, res) => {
  try {
    // grab the user from session
    const user = await User.findById(req.session.userId);

    // pull last 50 workouts (50 feels random but it's fine… I’ll tweak later if needed)
    const progressLog = await Progress.find({ userId: user._id })
      .populate('workoutId') // show proper workout names instead of mongo IDs
      .sort({ completedAt: -1 }) // newest first
      .limit(50); // TODO: maybe add pagination once i

    // total workout attempts since account creation
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });

    // throw all this at the progress.ejs page 
    res.render('progress', {
      progressLog,     // the actual list
      totalWorkouts,   // lifetime counter
      streak: user.streakCount // streaks
    });

  } catch (err) {
    // backend said “nah”
    console.error('Progress route decided to self-destruct:', err);
    res.status(500).send('Error loading progress (my bad)'); // maybe add better error UI later
  }
});

module.exports = router;
