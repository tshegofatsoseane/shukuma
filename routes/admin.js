const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
const { requireAdmin } = require('../middleware/auth'); // customm middleware
const WorkoutCard = require('../models/WorkoutCard');

// todo: maybe add routes for user progress, user managemnt..idk, i'll see

//manage workouts
router.get('/workouts', requireAdmin, async (req, res) => {
  try {
    //newest first
    const workouts = await WorkoutCard.find().sort({ createdAt: -1 }); 
    // render the page with workouts
    res.render('admin/workouts', { workouts }); 
  } catch (err) {
    console.error(err);
    res.status(500).send('ereror loading workouts'); 
  }
});

//add new workout
router.post('/workouts', requireAdmin, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const workout = new WorkoutCard({ name, description, category });
    await workout.save(); // safe it to db (rmeinder to create .env file and add use mongodb cnnection key)
    res.redirect('/admin/workouts');
  } catch (err) {
    console.error(err);
    res.status(500).send('rror creating workout');
  }
});

// edit workout
router.post('/workouts/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    await WorkoutCard.findByIdAndUpdate(req.params.id, {
      name,
      description,
      category
    }); // updating stuff
    // redirect to admi. page
    res.redirect('/admin/workouts');
  } catch (err) {
    console.error(err);
    res.status(500).send('Errar updating workout');
  }
});

// delete workout (might remove this!!)
router.delete('/workouts/:id', requireAdmin, async (req, res) => {
  try {
    await WorkoutCard.findByIdAndDelete(req.params.id);
    // redirect to admi npage
    res.redirect('/admin/workouts');
  } catch (err) {
    console.error(err);
    res.status(500).send('error deleting workout');
  }
});

module.exports = router;