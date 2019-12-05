var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//创建服务器
var app = express();
var server = require('http').Server(app);

//引入socket.io
var io = require('socket.io')(server);

//引入并开启数据库
var mongoose = require('./config/mongoose.js');
var db = mongoose();

var indexRouter = require('./routes/index');
// 使用indexRouter的io
app.indexio = indexRouter.io;
var usersRouter = require('./routes/users');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//indexRouter开启socket
app.indexio(io);

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

server.listen(8000,function () {
  console.log('服务器开启成功');
})

module.exports = app;
