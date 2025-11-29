const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
// customm middleware
const { requireAuth } = require('../middleware/auth');

// models
const User = require('../models/User');
const Progress = require('../models/Progress'); 
const WorkoutCard = require('../models/WorkoutCard'); //card model



// public hompage
router.get('/', (req, res) => {
  res.render('index'); // show the index page
});


// dashboard (protcted so unregisterd users dont have access)
router.get('/dashboard', requireAuth, async (req, res) => {

  try {
    
    const user = await User.findById(req.session.userId);// get the user from sesshion!!

    // count how many workoutz they done since start
    const totalWorkouts = await Progress.countDocuments({ userId: user._id });
    // calculate start of today date
    const todayStart = new Date().setHours(0, 0, 0, 0);


    const completedToday = await Progress.countDocuments({ // check how many they did today
      userId: user._id,
      completedAt: { $gte: todayStart } // only get today's stuff

    });

    // send all the infos to the dashboerd page
    res.render('dashboard', {
      user, 
      totalWorkouts, 
 
      completedToday, //get complted today workouts
      streak: user.streakCount // how many dayz in a row 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashbord'); //reminder to add bbeter erro andling!!
  }
});

module.exports = router;

