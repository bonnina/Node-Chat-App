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

var indexRouter = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use('/public', express.static(process.cwd() + '/public'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongo.connect(process.env.DATABASE, (err, db) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
      console.log('Successful database connection');
    
      passport.serializeUser((user, done) => {
        done(null, user._id);
      });

      passport.deserializeUser((id, done) => {
        db.collection('user').findOne({_id: new ObjectID(id)}, (err, doc) => {
          done(null, doc);
        });
      });

      app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on port " + process.env.PORT);
      });
}});


module.exports = app;
