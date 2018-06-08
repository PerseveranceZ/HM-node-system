/**
 * Created by tangsicheng on 2018/2/10.
 */
var log4js = require('log4js');

log4js.configure({
    "appenders": {
        "access": {
            "type": "dateFile",
            "filename": "../log/app.log",
            "pattern": "-yyyy-MM-dd",
            "category": "http"
        },
        "app": {
            "type": "file",
            "filename": "../log/app.log",
            "maxLogSize": 10485760,
            "pattern": "-yyyy-MM-dd",
            "numBackups": 3
        },
        "errorFile": {
            "type": "file",
            "pattern": "-yyyy-MM-dd",
            "filename": "../log/app.log"
        },
        "errors": {
            "type": "logLevelFilter",
            "level": "ERROR",
            "appender": "errorFile"
        },
        "stdout": {//控制台输出
            "type": 'stdout'
        },
    },
    "categories": {
        "default": { "appenders": [ "app", "errors", "stdout" ], "level": "INFO" },
        "http": { "appenders": [ "access"], "level": "INFO" }
    },
    pm2: true
});
// log4js.configure(require('./log4js.json'));

var logger = log4js.getLogger('logger');

exports.logger = logger;

exports.use = function(app){
    app.use(log4js.connectLogger(logger, {level:'info', format:':method :url response-time=:response-time ms'}));
}