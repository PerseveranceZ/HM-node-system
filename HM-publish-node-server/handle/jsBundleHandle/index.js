/**
 * Created by tangsicheng on 2018/3/24.
 */
let logger = require('../../config/log4js').logger;
let JsBundleInfo = require('../../db/model/jsBundleInfo');
let ClientInfo = require('../../db/model/appClientInfo');
let md5 = require('js-md5')

class JsBundleHandle {
    requestZip({apps, appName, platform, version, jsVersion, isDiff}, callback) {

        let jsBundleInfo = new JsBundleInfo();
        jsBundleInfo.getNewestInfo({appName, platform, version}).then(newests => {
            if (!newests || !newests.length) {
                logger.error('app版本信息在数据库中没有相应的数据，请检查版本信息是否正确！');
                let err = new Error('JsBundleInfo Is Not Found');
                err.status = 500;
                return callback(err);
            }
            if (isDiff == 0 || isDiff === 'false' || isDiff === false) {
                logger.info('请求全量包');
                // 请求全量包
                return callback(null, {
                    resCode: 0,
                    msg: "请求全量包成功",
                    data: {
                        diff: false,
                        path: `${newests[0].jsPath}/0/${newests[0].jsVersion}.zip`
                    }
                })
            }
            // 请求差分包
            if (!apps.length) {
                // 不存在jsVersion 当前包信息可能被篡改 直接返回最新版本全量包
                logger.info('不存在jsVersion 当前包信息可能被篡改 直接返回最新版本全量包')
                return callback(null, {
                    resCode: 0,
                    msg: "jsVersion 不存在",
                    data: {
                        diff: false,
                        path: `${newests[0].jsPath}/0/${newests[0].jsVersion}.zip`
                    }
                })
            } else {
                if (apps[0].createTime>newests[0].createTime || newests[0].jsVersion === jsVersion) {

                    if(apps[0].createTime>newests[0].createTime){
                        logger.info('客户端的js版本大于目前可以下载的版本');
                    }else{
                        logger.info('客户端的js版本已经最新，不需要更新');
                    }
                    return callback(null, {
                        resCode: 4000,
                        msg: "当前版本已是最新，不需要更新"
                    });
                } else {
                    // 存在 jsVersion 但不是最新
                    logger.info('存在 jsVersion 但不是最新');
                    logger.info('jsVersion>>>>' + jsVersion);
                    logger.info('newests[0].jsVersion>>>>' + newests[0].jsVersion);
                    let query = {
                        "appName": appName,
                        isDeleted: 0
                    }
                    ClientInfo.findOne(query, (err, infos) => {
                        if (!err) {
                            // 这里做了一个处理，如果用户选择了差分包增量更新，则返回差分包，如果不是差分包，那就返回全量包。
                            if (infos.isDiff == 'true') {

                                return callback(null, {
                                    resCode: 0,
                                    msg: "当前版本需要更新",
                                    data: {
                                        diff: true,
                                        jsVersion: newests[0].jsVersion,
                                        //有报错
                                        path: `${newests[0].jsPath}/1/${md5(jsVersion + newests[0].jsVersion)}.zip`
                                    }
                                })
                            } else {
                                return callback(null, {
                                    resCode: 0,
                                    msg: "当前版本需要更新",
                                    data: {
                                        diff: false,
                                        path: `${newests[0].jsPath}/0/${newests[0].jsVersion}.zip`
                                    }
                                })
                            }

                        } else {
                            return callback(err);
                        }
                    })
                }
            }
        })
    }
}

module.exports = JsBundleHandle;