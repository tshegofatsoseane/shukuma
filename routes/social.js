const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const WorkoutAssignment = require('../models/WorkoutAssignment');
const WorkoutCard = require('../models/WorkoutCard');

// GET /social - Social hub
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .populate('friends', 'username streakCount')
      .populate('friendRequests.from', 'username');
    
    // Get recent friend activity
    const friendIds = user.friends.map(f => f._id);
    const recentActivity = await Progress.find({
      userId: { $in: friendIds }
    })
      .populate('userId', 'username')
      .populate('workoutId')
      .populate('cheers.userId', 'username')
      .sort({ completedAt: -1 })
      .limit(20);
    
    // Get pending workout assignments
    const assignments = await WorkoutAssignment.find({
      to: user._id,
      status: 'pending'
    })
      .populate('from', 'username')
      .populate('workoutId')
      .sort({ createdAt: -1 });
    
    res.render('social', {
      friends: user.friends,
      friendRequests: user.friendRequests,
      recentActivity,
      assignments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading social page');
  }
});

// GET /social/find-friends - Search for users
router.get('/find-friends', requireAuth, async (req, res) => {
  try {
    const { query } = req.query;
    const currentUser = await User.findById(req.session.userId);
    
    let users = [];
    if (query) {
      users = await User.find({
        $and: [
          { _id: { $ne: req.session.userId } },
          { _id: { $nin: currentUser.friends } },
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      })
        .select('username email streakCount')
        .limit(20);
    }
    
    res.render('find-friends', { users, query: query || '' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error searching users');
  }
});

// POST /social/friend-request/:userId - Send friend request
router.post('/friend-request/:userId', requireAuth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).send('User not found');
    }
    
    // Check if already friends
    if (targetUser.friends.includes(req.session.userId)) {
      return res.status(400).send('Already friends');
    }
    
    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === req.session.userId.toString()
    );
    
    if (existingRequest) {
      return res.status(400).send('Friend request already sent');
    }
    
    targetUser.friendRequests.push({ from: req.session.userId });
    await targetUser.save();
    
    res.redirect('/social/find-friends');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending friend request');
  }
});

// POST /social/accept-friend/:userId - Accept friend request
router.post('/accept-friend/:userId', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    const requestingUser = await User.findById(req.params.userId);
    
    if (!requestingUser) {
      return res.status(404).send('User not found');
    }

    // 1. Remove the friend request from currentUser
    currentUser.friendRequests = currentUser.friendRequests.filter(
      fr => fr.from.toString() !== req.params.userId
    );

    // 2. Also remove from requestingUser's *sentRequests* if you store that
    if (requestingUser.sentRequests) {
      requestingUser.sentRequests = requestingUser.sentRequests.filter(
        id => id.toString() !== currentUser._id.toString()
      );
    }

    // 3. Add both users to each other's friend list
    if (!currentUser.friends.includes(requestingUser._id)) {
      currentUser.friends.push(requestingUser._id);
    }

    if (!requestingUser.friends.includes(currentUser._id)) {
      requestingUser.friends.push(currentUser._id);
    }

    await currentUser.save();
    await requestingUser.save();
    
    res.redirect('/social');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error accepting friend request');
  }
});

// POST /social/decline-friend/:userId - Decline friend request
router.post('/decline-friend/:userId', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    
    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req.from.toString() !== req.params.userId
    );
    
    await currentUser.save();
    
    res.redirect('/social');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error declining friend request');
  }
});

// POST /social/remove-friend/:userId - Remove friend
router.post('/remove-friend/:userId', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    const friend = await User.findById(req.params.userId);
    
    if (!friend) {
      return res.status(404).send('User not found');
    }
    
    // Remove from both friends lists
    currentUser.friends = currentUser.friends.filter(
      f => f.toString() !== req.params.userId
    );
    friend.friends = friend.friends.filter(
      f => f.toString() !== req.session.userId.toString()
    );
    
    await currentUser.save();
    await friend.save();
    
    res.redirect('/social');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing friend');
  }
});

// POST /social/assign-workout - Assign workout to friend
router.post('/assign-workout', requireAuth, async (req, res) => {
  try {
    const { friendId, workoutId, message } = req.body;
    
    const assignment = new WorkoutAssignment({
      from: req.session.userId,
      to: friendId,
      workoutId,
      message
    });
    
    await assignment.save();
    
    res.redirect('/social');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error assigning workout');
  }
});

// POST /social/complete-assignment/:id - Complete assigned workout
router.post('/complete-assignment/:id', requireAuth, async (req, res) => {
  try {
    const assignment = await WorkoutAssignment.findById(req.params.id);
    
    if (!assignment || assignment.to.toString() !== req.session.userId.toString()) {
      return res.status(403).send('Unauthorized');
    }
    
    // Mark assignment as completed
    assignment.status = 'completed';
    assignment.completedAt = new Date();
    await assignment.save();
    
    // Log progress
    const user = await User.findById(req.session.userId);
    const progress = new Progress({
      userId: user._id,
      workoutId: assignment.workoutId,
      challengeType: 'regular'
    });
    await progress.save();
    
    // Update streak
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const lastWorkout = user.lastWorkoutDate ? new Date(user.lastWorkoutDate).setHours(0, 0, 0, 0) : null;
    
    if (!lastWorkout || lastWorkout < todayStart) {
      await user.updateStreak();
    }
    
    res.redirect('/social');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error completing assignment');
  }
});

// POST /social/decline-assignment/:id - Decline assigned workout
router.post('/decline-assignment/:id', requireAuth, async (req, res) => {
  try {
    const assignment = await WorkoutAssignment.findById(req.params.id);
    
    if (!assignment || assignment.to.toString() !== req.session.userId.toString()) {
      return res.status(403).send('Unauthorized');
    }
    
    assignment.status = 'declined';
    await assignment.save();
    
    res.redirect('/social');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error declining assignment');
  }
});

// POST /social/cheer/:progressId - Cheer for friend's workout
router.post('/cheer/:progressId', requireAuth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const progress = await Progress.findById(req.params.progressId);
    
    if (!progress) {
      return res.status(404).send('Progress not found');
    }
    
    // Check if already cheered
    const alreadyCheered = progress.cheers.find(
      c => c.userId.toString() === req.session.userId.toString()
    );
    
    if (alreadyCheered) {
      return res.json({ success: false, message: 'Already cheered' });
    }
    
    progress.cheers.push({
      userId: req.session.userId,
      emoji: emoji || '💪'
    });
    
    await progress.save();
    
    res.json({ success: true, cheersCount: progress.cheers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding cheer' });
  }
});

module.exports = router;