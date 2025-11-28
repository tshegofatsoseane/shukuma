const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
// customm middleware
const { requireAuth } = require('../middleware/auth');

// models
const User = require('../models/User');
const Progress = require('../models/Progress'); 
const WorkoutCard = require('../models/WorkoutCard');



// public hompage
router.get('/', (req, res) => {
  res.render('index'); // show the index page...
});


// dashboard (protcted so unregisterd users dont have access)
router.get('/dashboard', requireAuth, async (req, res) => {

  try {
    // get the user from sesshion
    const user = await User.findById(req.session.userId);

    // count how many workoutz they done
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });

    // calculate start of today
    const todayStart = new Date().setHours(0, 0, 0, 0);


    const completedToday = await Progress.countDocuments({ // check how many they did today (even 1 is good lol)
      userId: user._id,
      completedAt: { $gte: todayStart } // only get today's stuff

    });

    // send all the infos to the dashboerd page
    res.render('dashboard', {
      user, 
      totalWorkouts, 
      completedToday,
      streak: user.streakCount // how many dayz in a row 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashbord'); 
  }
});

module.exports = router;

