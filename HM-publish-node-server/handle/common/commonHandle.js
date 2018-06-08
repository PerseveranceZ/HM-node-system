/**
 * Created by tangsicheng on 2018/3/24.
 */
var logger = require('../../config/log4js').logger;

class CommonHandle {
    static format({resCode = 'APP0000', msg = 'success', data = {}}) {
        return {
            resCode,
            msg,
            data
        }
    }

}

module.exports = CommonHandle;