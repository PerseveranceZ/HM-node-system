/**
 * Created by tangsicheng on 2018/3/23.
 */
var mongoose = require("../mongoose")
/**
 * 字段含义参考https://www.pgyer.com/doc/view/api#installApp
 */
var modelSchema = new mongoose.Schema({
    appReleaseInfoID:{type: mongoose.Schema.Types.ObjectId, require: true},
    buildKey: { type: String, require: true },
    buildType: { type: Number, require: true },
    buildIsFirst: { type: String },
    buildIsLastest: { type: String },
    buildFileKey: { type: String },
    buildFileName: {type: String },
    buildFileSize: {type: String },
    buildVersion:{ type: String},
    buildVersionNo:{ type: String },
    buildBuildVersion:{ type: String },
    buildIdentifier:{ type: String},
    buildIcon:{ type: String },
    buildDescription:{ type: String},
    buildUpdateDescription:{ type: String},
    buildScreenshots:{ type: String},
    buildShortcutUrl:{ type: String },
    buildCreated:{ type: String },
    buildUpdated:{ type: String },
    buildQRCodeURL:{ type: String },
    createTime: {type: Number, require: true},
    createBy:{type:String, require: true},
    updateTime: {type: Number, require: true},
    updateBy:{type:String, require: true},
    isDeleted: {type: Number, require: true, default: 0}
})

var pgyerUploadInfo = mongoose.model("pgyerUploadInfo", modelSchema)
module.exports = pgyerUploadInfo