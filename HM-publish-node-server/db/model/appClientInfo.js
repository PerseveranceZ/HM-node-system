/**
 * Created by tangsicheng on 2018/3/17.
 */

var mongoose = require("../mongoose"),
    moment = require("moment")
var modelSchema = new mongoose.Schema({
    displayName: { type: String, require: true },
    appName: { type: String, require: true, unique: true},
    iOSBundleId: { type: String, require: true },
    androidAppId: { type: String, require: true },
    downloadUrl: {type: String, require: true },
    isDiff: { type: String,default: 'false'},
    appCliPath: {type: String },
    createTime: {type: Number, require: true},
    createBy:{type:String, require: true},
    updateTime: {type: Number, require: true},
    updateBy:{type:String, require: true},
    isDeleted: {type: Number, require: true , default: 0}
})

var clientInfo = mongoose.model("clientInfo", modelSchema)

module.exports = clientInfo