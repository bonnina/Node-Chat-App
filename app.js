var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const passport    = require('passport');
const session = require('express-session');
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

// var indexRouter = require('./routes/index');
var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('/', indexRouter);

mongo.connect(process.env.DATABASE, (err, database) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
      console.log('Successful database connection');
      const db = database.db("user");
    
      passport.serializeUser((user, done) => {
        done(null, user._id);
      });

      passport.deserializeUser((id, done) => {
        db.collection('user').findOne({_id: new ObjectID(id)}, (err, doc) => {
          done(null, doc);
        });
      });

      passport.use(new LocalStrategy(
        function(name, password, done) {
          db.collection('user').findOne({ username: name }, (err, user) => {
            console.log('User '+ name +' attempted to log in.');
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (password !== user.password) { return done(null, false); }
            return done(null, user);
          });
        }
      ));
     
      app.route('/')
        .get((req, res) => {
          res.render(process.cwd() + '/views/index', {title: 'Hello', message: 'login', showLogin: true});
        });
      
      app.route('/login')
        .post(passport.authenticate('local', { failureRedirect: '/' }), (req,res) => {
          res.redirect('/profile');
        });

      app.route('/profile')
        .get(checkAuthentification, (req, res) => {
          res.render(process.cwd() + '/views/profile', {username: req.user.username});
        });
      
      app.route('/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/');
        });

      app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on port " + process.env.PORT);
      });
}});

function checkAuthentification(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = app;
