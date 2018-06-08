/**
 * Created by tangsicheng on 2018/3/14.
 */
var mongoose = require("../mongoose"),
    moment = require("moment"),
    bcrypt = require('bcryptjs');
var modelSchema = new mongoose.Schema({
    userName: { type: String, require: true ,unique: true},
    password: { type: String, require: true },
    createTime: {type: String, default: moment().format('YYYY-MM-DD h:m:s')},
    createBy:{type:String, default:'System'},
    updateTime: {type: String, default: moment().format('YYYY-MM-DD h:m:s')},
    updateBy:{type:String, default:'System'},
    isDeleted: {type: Number , default: 0}
})

// 添加用户保存时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
modelSchema.pre('save',function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
})

modelSchema.methods.comparePassword = function (passw, callback) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
}


var user = mongoose.model("user", modelSchema)
module.exports = user