/**
 * Created by tangsicheng on 2018/1/30.
 */
let config = require('../config/config').ENVIROMENT_INFO;
let path = require('path');
let JsBundleInfo = require('../db/model/jsBundleInfo');
let ReleaseInfo = require('../db/model/appReleaseInfo');
let logger = require('../config/log4js').logger;
let formidable = require('formidable');
let ClientInfo = require('../db/model/appClientInfo');
let PgyerInfo = require('../db/model/pgyerInfo');


let FileHandle = require('../handle/common/filesHandle');
let PgyerHandle = require('../handle/pgyerHandle');
let JsBundleHandle = require('../handle/jsBundleHandle');
let AppClientHandle = require('../handle/appClientHandle')
let CommonHandle = require('../handle/common/commonHandle')
let AppReleaseHandle = require('../handle/appReleaseHandle')

/**
 * 处理类初始化
 * @type {FilesHandle}
 */
let fileHandle = new FileHandle();
let pgyerHandle = new PgyerHandle();
let jsBundleHandle = new JsBundleHandle();
let appClientHandle = new AppClientHandle();

/**
 * 定义接口
 *
 * */
const AppController = {};
AppController.downloadIncrementZip = (req, res, next) => {
    var zipName = req.param('zipName');
    var isDiff = req.param('isDiff');
    var appName = req.param('appName');
    if (isDiff == 0) {
        let file = `${config.appPackagePath}/${appName}/${zipName}`;
        try {
            fileHandle.downloadFile(res, file);
        } catch (err) {
            return next(err);
        }
    } else {
        let query = {
            appName: appName,
            isDeleted: 0
        }
        ClientInfo.findOne(query, (err, infos) => {
            if (!err) {
                let diffFile = `${infos.appCliPath}/dist/js/${zipName}`;
                try {
                    fileHandle.downloadFile(res, diffFile);
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(err);
            }
        })
    }
};

AppController.addJsBundleInfo = (req, res, next) => {
    let body = req.body;
    body.isRelease = false;
    body.createTime = new Date().getTime();
    body.updateTime = new Date().getTime();
    body.createBy = 'system';
    body.updateBy = 'system';
    let jsBundleInfo = new JsBundleInfo(body)

    jsBundleInfo.save(err => {
        if (err) {
            return next(err)
        } else {
            res.send(CommonHandle.format({
                data: 'success'
            }))
        }
    })
};

AppController.checkJsVersion = (req, res, next) => {
    let {appName, jsVersion, isDiff = true} = req.query,
        platform = !!req.query.iOS ? 'iOS' : 'android',
        version = req.query[platform],
        checkParams = {
            appName,
            isDeleted: 0
        }

    if (jsVersion) checkParams['jsVersion'] = jsVersion;
    checkParams[platform] = version;
    JsBundleInfo.find(checkParams, (err, apps) => {
        if (err) {
            return next(err)
        }
        jsBundleHandle.requestZip({
            apps, appName, platform, version, jsVersion, isDiff
        }, (err, data) => {
            "use strict";
            if (!err) {
                res.send(CommonHandle.format(data));
            } else {
                return next(err);
            }
        })
    })
};
AppController.getJsBundleInfo = (req, res, next) => {

    JsBundleInfo.find({}, (err, apps) => {
        if (!err) {
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            return res.send(CommonHandle.format({
                code: 'APP0000',
                data: apps
            }));
        }
    }).sort({
        'timestamp': -1
    })
};
/**
 * 这个方法主要的获取逻辑是，在表中以app名称和客户端类型做分类，获取对应分类中后最后上传的那条数据。
 */
AppController.getReleaseInfos = (req, res, next) => {
    let releaseInfo = new ReleaseInfo();
    releaseInfo.getReleaseInfosByGroup((err, results) => {
        "use strict";
        if (!err) {
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            logger.info(results);
            return res.send(CommonHandle.format({
                code: 'APP0000',
                data: results
            }));
        } else {
            return next(err);
        }
    })

};


AppController.addReleaseInfos = (req, res, next) => {
    "use strict";
    let type = req.param('type');
    fileHandle.getUploadFromFormData(req).then(({files, fields}) => {
        fileHandle.uploadFile(type, files[0], fields.appName).then(packagePath => {
            return {fields, packagePath};
        }).then(({fields, packagePath}) => {
            let releaseInfo = {
                clientType: type,
                appName: fields.appName,
                issueDate: new Date(fields.issueDate).getTime(),
                clientVersion: fields.clientVersion,
                clientPath: packagePath,
                description: fields.description,
                isForcedUpdating: fields.isForcedUpdating,
                createTime: new Date().getTime(),
                createBy: req.user.userName,
                updateTime: new Date().getTime(),
                updateBy: req.user.userName
            }
            let releaseInfoModel = new ReleaseInfo(releaseInfo);

            releaseInfoModel.save((err, info) => {
                if (!err) {
                    logger.info("client info save success>>>>>>" + info);
                    res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
                    return res.send(CommonHandle.format({}))
                } else {
                    logger.error(err);
                    throw err;
                }
            })
        }).catch(err => {
            logger.error(err);
            throw err;
        })
    }).catch(err => {
        logger.error(err);
        return next(err);
    })
}


// updateReleaseInfos
AppController.updateReleaseInfos = (req, res, next)=>{
    console.log(req.body);
    let body = req.body;
    let id = body._id;
    body.updateTime = new Date().getTime();
    body.updateBy = req.user.userName;
    body.issueDate = new Date(body.issueDate).getTime();
    console.log(body);
    let releaseInfo = new ReleaseInfo();
    releaseInfo.update(body).where('_id', id).exec((err, doc) => {
        if (err) {
            return next(err);
        } else {
            logger.info('更新后的数据为:');
            logger.info(doc);
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            return res.send(CommonHandle.format({}))
        }

    })
}


/**
 * 上传蒲公英
 */
AppController.uploadToPgyer = (req, res, next) => {
    "use strict";
    let id = req.param('_id');
    let releaseInfo = new ReleaseInfo();
    releaseInfo.getClientPathWithId(id).then(val=>{
        pgyerHandle.uploadToPgyer(val.clientPath, val.description).then((pgyer) => {
            let pgyerData = pgyer.data;
            pgyerData.appReleaseInfoID = id;
            pgyerData.createTime = new Date().getTime();
            pgyerData.createBy = req.user.userName;
            pgyerData.updateTime = new Date().getTime();
            pgyerData.updateBy = req.user.userName;
            let pgyerInfoModel = new PgyerInfo(pgyerData);

            pgyerInfoModel.save((err, pgyerInfo) => {
                if (!err) {
                    logger.info("pgyerInfo save success>>>>>>" + pgyerInfo);
                    res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
                    return res.send(CommonHandle.format({}))
                } else {
                    throw err;
                }
            })
        }).catch(err => {
            throw err;
        })
    }).catch(err=>{
        logger.error(err);
        return next(err);
    })


}

AppController.addClientInfo = (req, res, next) => {
    "use strict";
    logger.info(req.body);
    let body = req.body;
    body.createTime = new Date().getTime();
    body.createBy = req.user.userName;

    body.updateTime = new Date().getTime();
    body.updateBy = req.user.userName;
    body.isDeleted = 0;
    let clientInfo = new ClientInfo(body);
    clientInfo.save(err => {
        if (err) {
            return next(err);
        } else {
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            return res.send(CommonHandle.format({}))
        }
    })
}

AppController.getClientInfo = (req, res, next) => {
    "use strict";
    ClientInfo.find().where('isDeleted', 0).exec((err, clientInfos) => {
        if (!err) {
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            return res.send(CommonHandle.format({
                resCode: 'APP0000',
                data: clientInfos
            }));
        } else {
            return next(err);
        }
    })
}

AppController.updateClientInfo = (req, res, next) => {
    "use strict";
    logger.info('put------');
    let body = req.body;
    body.updateBy = req.user.userName;
    body.updateTime = new Date().getTime();
    let id = body._id;
    delete body.createBy;
    delete body.createTime;
    delete body._id;
    logger.info(body);
    //这种方式，你需要传入req.body，不然是无效的。
    let clientInfo = new ClientInfo(req.body);
    clientInfo.update(body).where('_id', id).exec((err, doc) => {
        if (err) {
            return next(err);
        } else {
            logger.info('更新后的数据为:');
            logger.info(doc);
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            return res.send(CommonHandle.format({}))
        }

    })
}

/**
 *
 *  这里的update方式和上面的update是两种方式，可以仔细看一下。
 *  todo 这里应该做关联删除，要删除该app下的所有jsbundle和clientInfo
 *
 */
AppController.deleteClientInfo = (req, res, next) => {
    "use strict";
    let condition = {
        '_id': req.body._id
    };
    let updateObject = {
        $set: {
            'isDeleted': 1,
            'updateBy': req.user.userName,
            'updateTime': new Date().getTime()
        }
    }
    //这种方式就不需要所有值都有。推荐之后使用update的时候使用这种方式。
    ClientInfo.update(condition, updateObject, (err, doc) => {
        if (err) {
            return next(err);
        } else {
            logger.info('更新后的数据为:');
            logger.info(doc);
            res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
            return res.send(CommonHandle.format({}))
        }

    })
}

AppController.validateAppPackageName = (req, res, next) => {
    logger.info(req.query.appName);
    logger.info('---------------')
    let appName = req.query.appName;
    let id = req.query.id;
    if (appName) {
        ClientInfo.findOne({
            'appName': appName
        }).ne('_id', id).exec((err, infos) => {
            if (!err) {
                logger.info(infos);
                if (infos) {
                    let err = new Error('包名已存在');
                    err.status = 500;
                    return next(err);
                } else {
                    res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
                    return res.send(CommonHandle.format({}));
                }
            } else {
                return next(err);
            }
        })
    } else {
        let err = new Error('参数错误');
        err.status = 400;
        return next(err);
    }

};

AppController.validateDisplayName = (req, res, next) => {
    let displayName = req.query.displayName;
    let id = req.query.id;
    if (displayName) {
        ClientInfo.findOne({
            'displayName': displayName
        }).ne('_id', id).exec((err, infos) => {
            if (!err) {
                logger.info(infos);
                if (infos) {
                    let err = new Error('应用名已存在');
                    err.status = 500;
                    return next(err);
                } else {
                    res.setHeader("200", {'Content-Type': 'application/json;charset=UTF-8'});
                    return res.send(CommonHandle.format({}));
                }
            } else {
                return next(err);
            }
        })
    } else {
        let err = new Error('参数错误');
        err.status = 400;
        return next(err);
    }
};

/**
 *  校验版本号是否可用，必须大于等于当前版本号，并且需要符合格式。
 */
AppController.checkReleaseVersion = (req, res, next) => {

    let {appName, clientVersion, clientType} = req.query;
    if (appName && clientVersion && clientType) {
        let clientVersionNum = AppReleaseHandle.changeVersionToWeightingNum(clientVersion)
        ReleaseInfo.find({
            appName: appName,
            clientType: clientType,
            isDeleted: 0
        }, {clientVersion: 1, _id: 0}).exec((err, infos) => {
            if (!err) {

                let theBigestVersion = '';
                for (let index in infos) {
                    let currentVersionNum = AppReleaseHandle.changeVersionToWeightingNum(infos[index].clientVersion)
                    if (!theBigestVersion || theBigestVersion < currentVersionNum) {
                        theBigestVersion = currentVersionNum;
                    }
                }
                if (clientVersionNum < theBigestVersion) {
                    res.send(CommonHandle.format({
                        resCode: 'APP0010',
                        msg: "输入的版本号需要大于或者等于当前版本号！"
                    }));
                } else {
                    res.send(CommonHandle.format({
                        msg: "版本号可用！"
                    }));
                }
            } else {
                return next(err);
            }
        })
    } else {
        let err = new Error('参数错误');
        err.status = 400;
        return next(err);
    }
};
/**
 * 这个方法主要是为了运营平台根据app工程名称下载最新的bundle.zip大礼包的
 * bundle.zip大礼包在什么地方
 * */
AppController.downloadBundle = (req, res, next) => {
    var appName = req.param('appName');
    let query = {
        appName: appName,
        isDeleted: 0
    }
    ClientInfo.findOne(query, (err, infos) => {
        if (!err) {
            let appCliPath = infos.appCliPath;
            let bundleZip = `${infos.appCliPath}/platforms/ios/WeexEros/homeApp/bundle.zip`;
            let nativeJson = `${infos.appCliPath}/platforms/ios/WeexEros/homeApp/eros.native.json`;
            let bundleConfig = `${infos.appCliPath}/platforms/ios/WeexEros/homeApp/bundle.config`;
            let tempPath = path.resolve(__dirname, `../temp/jszip.zip`);
            let files = [bundleZip, nativeJson, bundleConfig];
            try {
                fileHandle.downloadFileWithJSZip({res, files, tempPath})

            } catch (err) {
                return next(err);
            }

        } else {
            return next(err);
        }
    })
}

/**
 *
 * @param clientType  用户请求的设备类型
 * @param appName   用户请求的app名
 */
AppController.downloadClient = (req, res, next) => {
    "use strict";
    var clientType = req.param('clientType');
    var appName = req.param('appName');
    let query = {
        clientType: clientType,
        appName: appName,
        isDeleted: 0
    }
    ReleaseInfo.findOne(query, (err, infos) => {
        if (!err) {
            let clientPath = infos.clientPath;
            try {
                fileHandle.downloadFile(res, clientPath);
            } catch (err) {
                let newErr = new Error('下载客户端失败');
                return next(newErr);
            }
        } else {
            return next(err);
        }
    }).sort({
        'updateTime': -1
    })
}

/**
 *
 * @param clientType  用户请求的设备类型
 * @param appName   用户请求的app名
 */
AppController.downloadPList = (req, res, next) => {
    // let plistPath=path.resolve(__dirname, '../download/ios-plist/axxt-ios.plist')
    let plistPath={ 'sit' : path.resolve(__dirname, '../download/ios-plist/axxt-ios-sit.plist'),
                  'prod' : path.resolve(__dirname, '../download/ios-plist/axxt-ios-prod.plist')}[process.env.NODE_ENV]
    try {
        fileHandle.downloadFile(res, plistPath);
    } catch (err) {
        let newErr = new Error('下载客户端失败');
        return next(newErr);
    }
}


/**
 * 校验用户客户端版本，判断是否需要强制更新
 * 1 如果是最新，返回不用更新
 * 2 如果不是最新，判断比他大的所有版本
 *   2.1 如果比他大的版本中有强制更新，则提示强制更新。并且返回下载链接
 *   2.2 如果比他大的版本中，没有强制更新，则提示不需要强制更新，但是童谣需要返回下载链接。
 *
 * @param clientVersion 原生客户端版本号
 * @param clientType    客户端类型（iOS/android）
 * @param appName       客户端名称 (client表中的appName)
 */
AppController.checkClientVersion = (req, res, next) => {
    "use strict";
    let {appName, clientVersion, clientType} = req.query;
    appClientHandle.checkClientVersion({appName, clientVersion, clientType})
        .then(({needUpdate, needForcedUpdating, data}) => {
            if (needUpdate) {
                if (needForcedUpdating) {
                    logger.info('版本需要强制更新');
                    res.send(CommonHandle.format({
                        resCode: 'APP0002',
                        msg: "版本需要强制更新",
                        data: data
                    }));
                } else {
                    logger.info('版本需要更新，可选！');
                    res.send(CommonHandle.format({
                        resCode: 'APP0003',
                        msg: "版本需要更新，可选！",
                        data: data
                    }));
                }
            } else {
                logger.info("当前版本是最新版本，无需更新！");
                res.send(CommonHandle.format({
                    resCode: 'APP0001',
                    msg: "当前版本是最新版本，无需更新！"
                }));
            }
        }).catch(err => {
        return next(err);
    })
};
// updateJsBundleStatus
AppController.updateJsBundleStatus = (req, res, next) => {
    "use strict";
    let _id = req.param('id');
    let status = req.param('status');
    // updateReleaseStatusById
    let jsBundleInfo = new JsBundleInfo();
    jsBundleInfo.updateReleaseStatusById({_id, status}).then(updateInfo=>{
        console.log('---------------');
        console.log(updateInfo);
        if(updateInfo){
            res.send(CommonHandle.format({
                resCode: 'APP0001',
                msg: "success"
            }));
        }
    }).catch(err=>{
        next(err);
    })
};

module.exports = AppController;