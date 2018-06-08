/**
 * Created by tangsicheng on 2018/3/24.
 */
let request = require('request');
let logger = require('../../config/log4js').logger;
let fs = require('fs');
let config = require('../../config/config').ENVIROMENT_INFO;
let PgyerInfo = require('../../db/model/pgyerInfo');

class PgyerHandle {
    /**
     * https://www.pgyer.com/doc/view/api#uploadApp 请参考蒲公英
     * @param filePath apk／ipa包路径
     * @param description 上传的描述信息
     * @param cb 回调函数
     */
    uploadToPgyer(filePath, description) {
        return new Promise(function (resolve, reject) {
            let formData = {
                // Pass a simple key-value pair
                _api_key: config.pgyer._api_key,
                // Pass data via Buffers
                file: fs.createReadStream(filePath),
                // Pass data via Streams
                buildInstallType: 1,
                buildPassword: '',
                buildUpdateDescription: description
            };
            logger.info('正在上传蒲公英');
            request.post({
                url: 'https://www.pgyer.com/apiv2/app/upload',
                formData: formData
            }, function (error, response, body) {
                if (!error) {
                    logger.info(response);
                    logger.info(body);
                    resolve(JSON.parse(body));
                } else {
                    logger.error(error);
                    reject(error);
                }
            })
        })

    }

    getDownloadURL(condition,clientType){
        return new Promise(function (resolve, reject) {
            PgyerInfo.findOne(condition, (err, pgyerInfo) => {
                if (!err) {
                    let url = ''
                    if (clientType == 'iOS') {
                        url = `itms-services://?action=download-manifest&url=https://www.pgyer.com/app/plist/${pgyerInfo.buildKey}`
                    } else {
                        //https://www.pgyer.com/apiv2/app/install?_api_key=35696ae775f768f6ada66349c6f286ae&buildKey=6576c9d96597b18263ed0c68d6fff6e5
                        url = `https://www.pgyer.com/apiv2/app/install?_api_key=${config.pgyer._api_key}&buildKey=${pgyerInfo.buildKey}`
                    }
                    resolve(url);
                } else {
                    reject(err);
                }
            })
        })
    }
}

module.exports = PgyerHandle;