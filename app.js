var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const mongo = require('mongodb').MongoClient;
require('dotenv').config();
const routes = require('./routes/routes.js');
const auth = require('./auth.js');

// var indexRouter = require('./routes/index');
var app = express();
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
app.use(helmet());


mongo.connect(process.env.DATABASE, (err, database) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
      console.log('Successful database connection');
      const db = database.db("user");
      auth(app, db);
      routes(app, db);
      
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
}});

module.exports = app;
