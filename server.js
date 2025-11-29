require('dotenv').config();// grab stuff from .env
const express = require('express'); //commmonjs style for now
const mongoose = require('mongoose');


const session = require('express-session');//session cookiess
const MongoStore = require('connect-mongo');


const methodOverride = require('method-override');
const path = require('path');

const app = express();

//datbse conn
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,

  useUnifiedTopology: true,
  tls: true, //needed for fdocker
  tlsCAFile: '/etc/ssl/certs/ca-certificates.crt' // docker sssl cert
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true })); //parser

app.use(express.json());


app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //static files

// engine
app.set('view engine', 'ejs'); //render ejs templates
app.set('views', path.join(__dirname, 'views'));



// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET ,

  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI ,

    touchAfter: 24 * 3600 // update evry 24 hours if nothng changde
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // keep user loged in for to 7 days
  }
}));


// Make user available to all templates
app.use((req, res, next) => {



  // make sesion info avilable in all ejs templats
  res.locals.user = req.session.userId ? req.session : null;
  next();
});

// routes
app.use('/', require('./routes/index')); // home +dashbord


app.use('/auth', require('./routes/auth'));

app.use('/workouts', require('./routes/workouts'));// shuffle workouts in the shufle page
app.use('/progress', require('./routes/progress')); //progress page
app.use('/challenges', require('./routes/challenges')); 
app.use('/social', require('./routes/social'));

app.use('/admin', require('./routes/admin'));

// Error Handler
app.use((err, req, res, next) => {
  
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//start sever
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Shukuma running on http://localhost:${PORT}`);// remove thus when i'm done and before i to submit
}); 
