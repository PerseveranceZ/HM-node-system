/**
 * Created by tangsicheng on 2018/3/24.
 */
let logger = require('../../config/log4js').logger;
let config = require('../../config/config').ENVIROMENT_INFO;
let AppReleaseHandle = require('../appReleaseHandle');
let PgyerHandle = require('../pgyerHandle')

class AppClientHandle {

    checkClientVersion({appName, clientVersion, clientType}) {
        let  checkParams = {
            appName,
            clientType,
            isDeleted:0
        };
        let currentVersionNum = AppReleaseHandle.changeVersionToWeightingNum(clientVersion + '');

        return new Promise(function (resolve, reject) {
            new AppReleaseHandle().getReleaseInfo(checkParams).then(infos => {
                let needForcedUpdating = false;
                let needUpdate = false;
                let lastedInfo = '';
                for (let index in infos) {
                    let info = infos[index];
                    if (!info.clientVersion) {
                        continue;
                    }
                    info.infoVersionNum = AppReleaseHandle.changeVersionToWeightingNum(info.clientVersion + '');
                    if (info.infoVersionNum > currentVersionNum) {
                        needUpdate = true;
                        if (info.isForcedUpdating == 'true') {
                            needForcedUpdating = true;
                        }
                        if (!lastedInfo) {
                            lastedInfo = info;
                        } else {
                            if (info.infoVersionNum > lastedInfo.infoVersionNum) {
                                lastedInfo = info;
                            }
                        }
                    }
                }

                return {needUpdate, lastedInfo, needForcedUpdating}
            }).then(({needUpdate, lastedInfo, needForcedUpdating}) => {
                if (needUpdate) {

                    logger.info('需要进行大版本更新！！');

                    if(process.env.NODE_ENV == 'prod' || process.env.NODE_ENV == 'sit'){
                        let url = '';
                        if (clientType == 'iOS') {
                            url = `itms-services://?action=download-manifest&url=${config.ip}/app/downloadPList`
                        } else {
                            url = `${config.ip}/app/downloadClient/${appName}/android`
                        }
                        let data ={
                            description: lastedInfo.description,
                            url:url
                        }
                        resolve({needUpdate,needForcedUpdating,data})
                    }else {
                        let condition = {
                            appReleaseInfoID: lastedInfo._id,
                            isDeleted: 0
                        }
                        new PgyerHandle().getDownloadURL(condition,clientType).then(url=>{
                            let data ={
                                description: lastedInfo.description,
                                url:url
                            }
                            resolve({needUpdate,needForcedUpdating,data})
                        }).catch(err=>{
                            throw err;
                        })
                    }
                } else {
                    resolve({needUpdate})
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }
}

module.exports = AppClientHandle;