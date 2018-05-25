var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').load({path: process.env.DOTENV || './.env'});

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var videoRouter = require('./routes/video');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log();
console.log('process.env.CLIENT_URL=', process.env.CLIENT_URL);

app.use(function (req, res, next) {
  var allowedOrigins = [process.env.CLIENT_URL,
    'http://192.168.1.91:4200',
    'https://192.168.1.91:4200',
    'http://127.0.0.1:4200',
    'https://127.0.0.1:4200',
    'http://84.51.210.138:4200',
    'https://84.51.210.138:4200',
    'http://localhost:4200',
    'https://localhost:4200'];
  var origin = req.headers.origin;
  console.log('req.headers.origin=', req.headers.origin);
  let index = allowedOrigins.indexOf(origin);
  console.log('index=', index);
  if (origin === undefined) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.indexOf(origin) > -1) {
    console.log('allowedOrigins.indexOf(origin)');
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/users', usersRouter);
app.use('/video', videoRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
