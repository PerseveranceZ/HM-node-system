/**
 * Created by tangsicheng on 2018/3/14.
 */
const bcrypt = require('bcryptjs');

let password = 'admin'   //获取注册页面上表单输入的密码

//生成salt的迭代次数
const saltRounds = 10;
//随机生成salt
const salt = bcrypt.genSaltSync(saltRounds);
//获取hash值
var hash = bcrypt.hashSync(password, salt);
console.log(`经过bcryptjs 加密${password}后，得到结果为：`);
console.log(hash);
console.log(`加密结束`);