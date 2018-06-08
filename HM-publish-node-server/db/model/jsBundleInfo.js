/**
 * Created by tangsicheng on 2018/1/30.
 */
let mongoose = require("../mongoose")
let logger = require('../../config/log4js').logger;

var modelSchema = new mongoose.Schema({
    appName: { type: String, require: true },
    jsPath: { type: String, require: true },
    iOS: { type: String, require: true },
    android: { type: String, require: true },
    jsVersion: { type: String, require: true },
    isRelease:{ type: Boolean, require: true },
    timestamp: {type: Number, require: true },
    createTime: {type: String, require: true},
    createBy:{type:String, default:'System'},
    updateTime: {type: String, require: true},
    updateBy:{type:String, default:'System'},
    isDeleted: {type: Number , default: 0}
})

modelSchema.methods.getNewestInfo = ({appName, platform, version}) => {
    let params = {
        appName: appName,
        isDeleted: 0,
        isRelease:true
    }
    params[platform] = version
    return jsBundleInfo.find(params).sort({timestamp: 'desc'})
}

modelSchema.methods.updateReleaseStatusById = ({_id, status}) => {
    return new Promise(function (resolve, reject) {
        "use strict";
        jsBundleInfo.findById(_id, function (err, info) {
            logger.info(`通过id:${_id}找到的信息:`);
            logger.info(info);
            if (err) return reject(err);
            info.isRelease = status;
            info.save(function (err, updatedInfo) {
                if (err) return reject(err)
                logger.info(`更新成功后，更新后的数据`);
                logger.info(updatedInfo);
                resolve(updatedInfo);
            });
        });
    })
}


var jsBundleInfo = mongoose.model("jsBundleInfo", modelSchema)
module.exports = jsBundleInfo