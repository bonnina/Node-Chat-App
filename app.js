var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const sessionStore = new session.MemoryStore();
const mongo = require('mongodb').MongoClient;
require('dotenv').config();
const routes = require('./routes/routes.js');
const auth = require('./auth.js');

var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

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
  key: 'express.sid',
  store: sessionStore,
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

      let currentUsers = 0;
      http.listen(process.env.PORT || 3000);

      io.on('connection', socket => {
        console.log('A user has connected');
        ++currentUsers;
        io.emit('user count', currentUsers);

      socket.on('disconnect', function(){
        console.log('A user disconnected');
        --currentUsers;
        io.emit('user count', currentUsers);
      });

    });
}});



module.exports = app;
