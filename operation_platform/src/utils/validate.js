/**
 * Created by jiachenpan on 16/11/18.
 */

export function isvalidUsername(str) {

  const userName = /^[a-zA-z][a-zA-Z0-9_]{4,12}$/
  return userName.test(str)
}

/* 合法uri*/
export function isValidateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/* 小写字母*/
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母*/
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母*/
export function validatAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}


/* 校验版本号*/
export function isValidatClientVersion(str) {
  const reg = /^(0|[1-9][0-9]{0,2})(\.(0|[1-9][0-9]{0,2})){2}$/
  return reg.test(str)
}
/* 校验时间是否是yyyy-mm-dd */
export function isValidateDate(str){
  "use strict";
  const reg = /^\d{4}\-\d{2}\-\d{2}$/
}
