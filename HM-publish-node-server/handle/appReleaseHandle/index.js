/**
 * Created by tangsicheng on 2018/3/24.
 */
var logger = require('../../config/log4js').logger;
let ReleaseInfo = require('../../db/model/appReleaseInfo');

class AppReleaseHandle {
    /**
     * 通过标准格式的version（XXX.XXX.XXX;类似：1.0.0）来转换成一个带权重的数字
     * @param version 标准格式的version
     * @returns {*}
     */
    static changeVersionToWeightingNum(version) {
        let arr = version.split('.');
        return parseInt(arr[0] * 10000 + arr[1] * 100 + arr[2]);
    }

    getReleaseInfo(condition) {
        return new Promise(function (resolve, reject) {
            ReleaseInfo.find(condition, (err, infos) => {
                if (!err) {
                    resolve(infos);
                } else {
                    reject(err);
                }
            }).sort({
                'clientVersion': -1
            })
        })
    }
}

module.exports = AppReleaseHandle;