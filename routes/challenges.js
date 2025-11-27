const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
// customm middleware
const { requireAuth } = require('../middleware/auth');
const WorkoutCard = require('../models/WorkoutCard');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Team = require('../models/Team');

// main challanges page (user see stuff here)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId); // get the user
    
    // calc day of the year
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    
    const totalCards = await WorkoutCard.countDocuments();
    const dailyCard = await WorkoutCard.findOne().skip(dayOfYear % totalCards);
    
    // check if daily card completd today
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const dailyCompleted = await Progress.findOne({
      userId: user._id,
      workoutId: dailyCard._id,
      completedAt: { $gte: todayStart }
    });
    
    // Get top users for leaderboard
    const leaderboard = await Progress.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const leaderboardWithUsers = await User.populate(leaderboard, { path: '_id' });
    
    res.render('challenges', {
      dailyCard,
      dailyCompleted: !!dailyCompleted,
      streak: user.streakCount,
      leaderboard: leaderboardWithUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading challenges');
  }
});

// Timed challenge page
router.get('/timed', requireAuth, (req, res) => {
  res.render('timed-challenge');
});

// Submit timed challenge score
router.post('/timed/score', requireAuth, async (req, res) => {
  try {
    const { score } = req.body;
    // Store score in user profile or separate TimedScore model
    res.json({ success: true, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving score' });
  }
});

// team challenges
router.get('/teams', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('teamId');
    
    let teamScore = 0;
    let teamMembers = [];
    
    if (user.teamId) {
      const team = await Team.findById(user.teamId).populate('members');
      teamMembers = team.members;
      
      // Calculate team score
      for (let member of team.members) {
        const memberProgress = await Progress.countDocuments({ userId: member._id });
        teamScore += memberProgress;
      }
    }
    
    // Get top teams
    const teams = await Team.find().populate('members');
    const teamLeaderboard = [];
    
    for (let team of teams) {
      let score = 0;
      for (let member of team.members) {
        const count = await Progress.countDocuments({ userId: member._id });
        score += count;
      }
      teamLeaderboard.push({ team, score });
    }
    
    teamLeaderboard.sort((a, b) => b.score - a.score);
    
    res.render('teams', {
      userTeam: user.teamId,
      teamScore,
      teamMembers,
      teamLeaderboard: teamLeaderboard.slice(0, 10)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading teams');
  }
});

// create a team
router.post('/teams/create', requireAuth, async (req, res) => {
  try {
    const { teamName } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (user.teamId) {
      return res.status(400).send('You are already in a team');
    }
    
    const team = new Team({
      name: teamName,
      createdBy: user._id,
      members: [user._id]
    });
    await team.save();
    
    user.teamId = team._id;
    await user.save();
    
    res.redirect('/challenges/teams');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating team');
  }
});

// Join a team
router.post('/teams/join', requireAuth, async (req, res) => {
  try {
    const { teamCode } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (user.teamId) {
      return res.status(400).send('You are already in a team');
    }
    
    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
    if (!team) {
      return res.status(404).send('Team not found');
    }
    
    team.members.push(user._id);
    await team.save();
    
    user.teamId = team._id;
    await user.save();
    
    res.redirect('/challenges/teams');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error joining team');
  }
});

// leave a team
router.post('/teams/leave', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user.teamId) {
      return res.status(400).send('You are not in a team');
    }

    const team = await Team.findById(user.teamId);

    // remove user from team
    team.members = team.members.filter(
      (memberId) => memberId.toString() !== user._id.toString()
    );
    await team.save();

    // remove team reference from user
    user.teamId = null;
    await user.save();

    // if team has no members left, delete it
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(team._id);
    }

    res.redirect('/challenges/teams');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error leaving team');
  }
});


module.exports = router;
