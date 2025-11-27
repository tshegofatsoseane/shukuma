const User = require('../models/User');

// Require authentication
exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

// Require admin
exports.requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).send('Access denied. Admin only.');
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Redirect if already logged in
exports.redirectIfAuth = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};
