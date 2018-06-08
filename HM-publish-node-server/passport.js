/**
 * Created by tangsicheng on 2018/3/14.
 */
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;

const User = require('./db/model/user');
const config = require('./config/config').ENVIROMENT_INFO;
const jwt = require('jsonwebtoken');
var logger = require('./config/log4js').logger;


module.exports = function(passport) {
    passport.use(new Strategy(
        function(token, done) {
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    err.message = 'token 已经过期';
                    err.status = 401;
                    logger.error(err);
                    return done(err,false,'token 已经过期');
                } else {
                    // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
                    if(decoded.exp*1000 >new Date()){
                        User.findOne({
                            userName: decoded.username
                        }, function(err, user) {
                            if (err) {
                                logger.error(err);
                                return done(err);
                            }
                            if (!user) {
                                return done(null, false,{message:'用户不存在'});
                            }
                            return done(null, user);
                        });
                    }else {
                        let err = new Error('token 失效，请重新登陆');
                        err.status = 401;
                        logger.error(err);
                        return done(err,false,{message:'token 失效，请重新登陆'});
                    }
                }
            });
        }
    ));
};
