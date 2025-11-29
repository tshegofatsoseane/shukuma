
const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
// customm middleware
const { requireAuth } = require('../middleware/auth');


//models
const Progress = require('../models/Progress');
const User = require('../models/User');


router.get('/', requireAuth, async (req, res) => {
  try {
    // grab the user from seesion
    const user = await User.findById(req.session.userId);

    const progressLog = await Progress.find({ userId: user._id })
     
      .populate('workoutId')
      .sort({ completedAt: -1 }) 
      .limit(50); // maybe i'll add pagination later!!

    
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });// workout attmpts...in total!!

    res.render('progress', { 
      progressLog, 
      totalWorkouts, //get complted workouts since joining
      streak: user.streakCount
    });

  } catch (err) {
    // backend not returning 
    console.error('Failed to get progress!:', err);
    res.status(500).send('Error loading progress (my bad)'); // maybe add btter error ui later
  }
});

module.exports = router;
