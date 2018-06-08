/**
 * Created by tangsicheng on 2018/3/13.
 */
const path = require('path');


/**
 * 这里说明一下，如果之后有新变量，请接下去补充：
 *  distPath : dist包打包到的目标路径
 */
class configs{
    Environment(option) {
      return {
        distPath:path.resolve(__dirname, '../../HM-publish-node-server/views')
      }
    };

    SET_ENV(option){
        this.ENVIROMENT_INFO = this.Environment(option);
    }
}
const _configs = new configs();
console.log('当前环境为：'+process.env.NODE_ENV);
_configs.SET_ENV(process.env.NODE_ENV);
module.exports = _configs
