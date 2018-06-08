/**
 * Created by tangsicheng on 2018/02/28.
 */

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}
/**
 * @param {date} 标准时间格式:Fri Nov 17 2017 09:26:23 GMT+0800 (中国标准时间)
 * @param {type} 类型
 *   type == 1 ---> "yyyy-mm-dd hh:MM:ss.fff"
 *   type == 2 ---> "yyyymmddhhMMss"
 *   type == '' ---> "yyyy-mm-dd hh:MM:ss"
 */
export const formatDate = (date, type) => {
  var year = date.getFullYear();//年
  var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;//月
  var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();//日
  var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();//时
  var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();//分
  var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();//秒
  var milliseconds = date.getMilliseconds() < 10 ? "0" + date.getMilliseconds() : date.getMilliseconds() //毫秒
  if (type == 1) {
    return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds + "." + milliseconds;
  } else if (type == 2) {
    return year + "" + month + "" + day + "" + hour + "" + minutes + "" + seconds;
  } else if (type == 3) {
    return year + "-" + month + "-" + day;
  } else {
    return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
  }
}

/**
 * 时间转换：20150101010101 --> '2015-01-01 01:01:01'
 */
export const parseToDate = (timeValue) => {
  var result = "";
  var year = timeValue.substr(0, 4);
  var month = timeValue.substr(4, 2);
  var date = timeValue.substr(6, 2);
  var hour = timeValue.substr(8, 2);
  var minute = timeValue.substr(10, 2);
  var second = timeValue.substr(12, 2);
  result = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  return result;
}
/**
 * 判断空值
 */
export const isEmpty = (keys) => {
  if (typeof keys === "string") {
    keys = keys.replace(/\"|&nbsp;|\\/g, '').replace(/(^\s*)|(\s*$)/g, "");
    if (keys == "" || keys == null || keys == "null" || keys === "undefined") {
      return true;
    } else {
      return false;
    }
  } else if (typeof keys === "undefined") {  // 未定义
    return true;
  } else if (typeof keys === "number") {
    return false;
  } else if (typeof keys === "boolean") {
    return false;
  } else if (typeof keys == "object") {
    if (JSON.stringify(keys) == "{}") {
      return true;
    } else if (keys == null) { // null
      return true;
    } else {
      return false;
    }
  }

  if (keys instanceof Array && keys.length == 0) {// 数组
    return true;
  }

}

/**
 * 返回两位的小数的字符串
 */
export const toFixedNum = (num) => {
  const tonum = Number(num).toFixed(2);
  return tonum;
}

/**
 * 读取base64
 */
export const readFile = file => {
  //var file = this.files[0];
  //判断是否是图片类型
  if (!/image\/\w+/.test(file.raw.type)) {
    alert("只能选择图片");
    return false;
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    var filedata = {
      filename: file.name,
      filebase64: e.target.result
    }
    alert(e.target.result)
  }
}
