var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var serveStatic = require('serve-static');
var log4js = require('./config/log4js')
var routes = require('./routes')
const passport = require('passport');
//这里是配置
var app = express();
log4js.use(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.use(serveStatic(path.resolve(__dirname, './views')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With  ,X-Token');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});


routes(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    log4js.logger.error(`出错了！：${err}`);
    log4js.logger.error(`出错的URL是！：${req.url}`);
    res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.error = err;
    log4js.logger.error(res.locals.error)
    // render the error page
    res.status(err.status || 500);
    console.log(req.url);
    if(req.url.match(/.html/)){
        res.render('error',{error:err.status});
    }else {
        res.send({err:res.locals.error,msg:res.locals.message})
    }
    //
});

module.exports = app;
