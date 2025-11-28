const express = require('express'); //(shuffle, complete, etc..ll the workout, related stuff!!
const router = express.Router();


const { requireAuth } = require('../middleware/auth'); // custom middlewares n models
const WorkoutCard = require('../models/WorkoutCard');
const Progress = require('../models/Progress');
const User = require('../models/User');


// show the shuffle page before actually shuffling
router.get('/shuffle', requireAuth, async (req, res) => {
  try {


    // grab user
    const user = await User.findById(req.session.userId);


    // streak or 0 if user has none!!
    const streakNow = user?.streak || 0;


    
    const totalDone = await Progress.countDocuments({ userId: user._id }); // workout count

    // start of the day..i'll use js date api next timw!
    const todayBegins = new Date();

    todayBegins.setHours(0, 0, 0, 0);

    
    const completedToday = await Progress.countDocuments({ // how many things they did today!!
      userId: user._id,
      createdAt: { $gte: todayBegins }
    });

    // show empty shuffle screen...no card yet!! (Rreminder to fix this on the timed chalanages page!!)
    res.render('shuffle', { 
      workout: null,

      streak: streakNow,

      totalWorkouts: totalDone,

      completedToday
    });

  } catch (err) {
    console.error('shuffle GET exploded:', err);
    res.status(500).send('Error loading shuffle page');
  }
});


// POST /workouts/shuffle — actually pick a random card
router.post('/shuffle', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    const streakNow = user?.streak || 0;
    const totalDone = await Progress.countDocuments({ userId: user._id });

    const todayBegins = new Date();

    todayBegins.setHours(0, 0, 0, 0);

    const completedToday = await Progress.countDocuments({
      userId: user._id,
      createdAt: { $gte: todayBegins }
    });


    // ok now the actual shuffle 👇
    const totalCards = await WorkoutCard.countDocuments();

    const randomIndex = Math.floor(Math.random() * totalCards); // classic math

    const randomWorkout = await WorkoutCard.findOne().skip(randomIndex); // not the most efficient but its fine lol

    res.render('shuffle', { 
      workout: randomWorkout,

      streak: streakNow,

      totalWorkouts: totalDone,


      completedToday
    });

  } catch (err) {
    console.error('shuffle POST died:', err);
    res.status(500).send('Error shuffling workout');
  }
});


// POST /workouts/complete/:id — mark a workout as done
router.post('/complete/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    // log it into Progress (basically "diary entry")
    const newProg = new Progress({
      userId: user._id,


      workoutId: req.params.id,

      challengeType: req.body.challengeType || 'regular' // sometimes daily/streak/etc

    });
    await newProg.save();

    // streak stuff (this part is always finicky)
    const todaysStart = new Date().setHours(0, 0, 0, 0);

    const lastDone = user.lastWorkoutDate

      ? new Date(user.lastWorkoutDate).setHours(0, 0, 0, 0)
      : null;


    
    if (!lastDone || lastDone < todaysStart) {// if last workout was not today, increase streak
      await user.updateStreak(); // hope this function behaves
    }

    res.redirect('/progress'); // straight to the gains page

  } catch (err) {
    console.error('complete route said nope:', err);
    res.status(500).send('Error completing workout'); // reminder to me...add better error handling later!!
  }
});



//  return a random workout for the timned challanges page
router.get('/random', requireAuth, async (req, res) => {
  try {
    const total = await WorkoutCard.countDocuments();
    const randomIndex = Math.floor(Math.random() * total);

    const card = await WorkoutCard.findOne().skip(randomIndex);

    res.json({
      id: card._id,
      name: card.name,
      description: card.description
    });
  } catch (err) {
    console.error('Error getting random workout:', err);
    res.status(500).json({ error: 'Failed to load random workout' });
  }
});


module.exports = router;
