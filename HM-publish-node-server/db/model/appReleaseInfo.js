/**
 * Created by tangsicheng on 2018/3/3.
 */

var mongoose = require("../mongoose")
var modelSchema = new mongoose.Schema({
    clientType: { type: String, require: true },
    appName: { type: String, require: true },
    issueDate: { type: Number, default:new Date().getTime() },
    clientVersion: { type: String, require: true },
    clientPath: { type: String, require: true },
    description: {type: String },
    isForcedUpdating:{ type: String, require: true },
    createTime: {type: Number, require: true},
    createBy:{type:String, require: true},
    updateTime: {type: Number, require: true},
    updateBy:{type:String, require: true},
    isDeleted: {type: Number, require: true, default: 0}
})

modelSchema.methods.getReleaseInfosByGroup = (callback) => {
    /**
     * mongodb 的聚合写法，key 是你需要groupby 的关键字，initial 是你需要新增的处理后的字段初始值，reduce所对应的function
     * 是遍历每一条数据后都会执行的处理方法，finalize是全部遍历完后，对输出的结果做最后的处理。
     * 参考 https://stackoverflow.com/questions/6852588/group-by-in-mongoose
     */


    var group = {
        key: {'appName': 1, 'clientType': 1},
        initial: {"data": '', "total": []},
        cond:{"isDeleted":0},
        reduce: function Reduce(doc, out) {
            var result = {
                'id': doc._id,
                'clientVersion': doc.clientVersion,
                'updateTime': doc.updateTime,
                'issueDate': doc.issueDate,
                'description': doc.description,
                'isForcedUpdating': doc.isForcedUpdating
            }
            out.total.push(result);
            if ('' == out.data) {
                out.data = result
            } else {
                if (out.data.updateTime < result.updateTime) {
                    out.data = result
                }
            }
        },
        finalize: function Finalize(out) {
            out._id = out.data.id;
            out.clientVersion = out.data.clientVersion;
            out.issueDate = out.data.issueDate;
            out.updateTime = out.data.updateTime;
            out.description = out.data.description;
            out.isForcedUpdating = out.data.isForcedUpdating;
            delete out.data;
            delete out.total;
        }
    }

    releaseInfo.collection.group(group.key, group.cond, group.initial, group.reduce, group.finalize, true, function (err, results) {
        callback(err,results);
    });

}

modelSchema.methods.getClientPathWithId = (id) => {
    return releaseInfo.findById(id);
}

var releaseInfo = mongoose.model("releaseInfo", modelSchema)
module.exports = releaseInfo