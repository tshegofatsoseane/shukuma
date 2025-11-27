const express = require('express'); // commonjs module...might convertto es module.
const router = express.Router();
const User = require('../models/User');
// customm middleware
const { redirectIfAuth } = require('../middleware/auth');


// todo: maybe add routes for user progress, user managemnt..idk, i'll see

// show sign up formm (user make accounyt)
router.get('/signup', redirectIfAuth, (req, res) => { 
  // no errors yet
  res.render('signup', { error: null });

});

 // reminder...make sure it works!!
router.post('/signup', redirectIfAuth, async (req, res) => { 
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {  
    return res.render('signup', { error: 'All fields are required' });
  }


// password should match or no entry!!

  if (password !== confirmPassword) { 

    return res.render('signup', { error: 'Passwords do not match' });

  }



  if (password.length < 6) { //password to small!!

    return res.render('signup', { error: 'Password must be at least 6 chars' });

  }


  try {

    // check if user alreadi exists!

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });  

    if (existingUser) {
      return res.render('signup', { error: 'Username or email already taken' }); // i should probably make cusstorm error middlware
    }

    // make new user in datbase
    const user = new User({ username, email, password });
    await user.save(); //save 


    // log in automaticaly
    // set user id
    req.session.userId = user._id; 
     // set user name
    req.session.username = user.username;

    res.redirect('/dashboard'); // enter dashboiard!
  } catch (err) {
    console.error('Signup error:', err);
    res.render('signup', { error: 'something went wrong' }); 
  }
});

// show login form (user alredy exist maybe!!)
router.get('/login', redirectIfAuth, (req, res) => { 
  res.render('login', { error: null });
});

// login route (check user details!!)
router.post('/login', redirectIfAuth, async (req, res) => {
  const { email, password } = req.body;

  // very important validation!
  if (!email || !password) {
    return res.render('login', { error: 'all fields are required' });
  }

  try {
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.render('login', { error: 'wrongcredentials' });
    }

    // checkl if passord is correct!!!
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {

      return res.render('login', { error: 'Invalid credentials' });

    }



    // give user a session so they are loged in!

    req.session.userId = user._id;

    req.session.username = user.username;

    res.redirect('/dashboard');

  } catch (err) {

    console.error('Login error:', err);

    res.render('login', { error: 'Something went wrong logging in' });

  }

});



// log out

// done!!

router.get('/logout', (req, res) => { 

  //destroy user session

  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    // bye bye
    res.redirect('/'); 

  });
});


module.exports = router;