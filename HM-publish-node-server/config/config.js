const path = require('path');
var logger = require('../config/log4js').logger;


/**
 * 这里说明一下，如果之后有新变量，请接下去补充：
 * 1.appPackagePath:    app脚手架所在的路径，可以直接写绝对路径，但是必须和本项目在同一个服务器上，并且需要有读写权限。
 * 2.mongodbURL:        mongodb的url
 * 3.secret:            运营平台登陆时jwt需要的key，
 * 4.pgyer:             蒲公英的一些关键参数，详情请参考蒲公英官网
 * 5.ip                 本服务器的ip+端口
 */
class configs{
    Environment(option) {
        //这里你可以根据option来分环境。
        return {
            pgyer:{
                uKey:'',
                _api_key:''
            },
            appPackagePath:path.resolve(__dirname, './app_clients_manager'),
            mongodbURL:'mongodb://localhost/home',
            secret:'ANⅪNTRUSTOPERATION',
            ip:'127.0.0.1:3001'
        }
    };

    SET_ENV(option){
        this.ENVIROMENT_INFO = this.Environment(option);
    }
}
const _configs = new configs();
logger.info('当前环境为：'+process.env.NODE_ENV);
_configs.SET_ENV(process.env.NODE_ENV);
module.exports = _configs