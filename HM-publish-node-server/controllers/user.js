/**
 * Created by tangsicheng on 2018/3/14.
 */

let UserModel = require('../db/model/user');
let logger = require('../config/log4js').logger;
let CommonHandle = require('../handle/common/commonHandle')
const jwt = require('jsonwebtoken');
const config = require('../config/config').ENVIROMENT_INFO;
const UserController = {};

UserController.login = (req, res, next) => {
    "use strict";
    logger.info(req.body);
    let data = req.body;
    if(data.username && data.password){
        UserModel.findOne({
            userName : data.username
        }, (err, user) => {
            if (err){
                logger.error(err);
                res.status(401).send(CommonHandle.format({code: 'APP0011', message: '认证失败，用户不存在!!'}));
            }
            if(!user){
                res.status(401).send({code: 'C100001', message: '认证失败，用户不存在!'});
            } else {
                user.comparePassword(data.password,(err, isMatch) => {
                    if(err){
                        logger.error(err);
                        res.status(401).send(CommonHandle.format({code: 'APP0011', message: '密码不正确!'}));
                    }
                    if(isMatch){
                        //jwt 中文文档 https://segmentfault.com/a/1190000009494020
                        let token = jwt.sign({username: user.userName}, config.secret,{
                            expiresIn: 60*60
                        });
                        //这里是让前端可以获取Authorization 请求头
                        res.setHeader('Access-Control-Expose-Headers','Authorization');
                        res.setHeader('Authorization','Bearer ' + token);
                        return res.send({
                            code:'C100000',
                            message: '登陆成功',
                            data:{
                                token:'Bearer ' + token
                            }
                        });

                    }else {
                        let err = new Error('密码错误')
                        logger.error(err);
                        res.status(401).send(CommonHandle.format({code: 'APP0011', message: '账号密码不正确!'}));
                    }
                })
            }
        })
    }else {
        res.status(401).send(CommonHandle.format({code: 'APP0011', message: '账号密码不正确!'}));
        // res.status(401).json({error:'账号密码不正确'});
    }

}


UserController.info = (req, res, next) => {
    "use strict";

    var data = {
        userName : req.user.userName,
        roles:req.user.get('roles')
    }
    res.json(CommonHandle.format({data: data}));
}




module.exports = UserController;