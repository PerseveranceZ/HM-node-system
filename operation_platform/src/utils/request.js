import axios from 'axios'
import {Message, MessageBox} from 'element-ui'
import store from '../store'
import {getToken} from '@/utils/auth'
import extend from 'node.extend'
import qs from 'qs'
import router from '../router'

// 创建axios实例
const service = axios.create({
  timeout: 15000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
    config.data = qs.stringify(config.data)
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// download url
const downloadUrl = url => {
  let iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  iframe.onload = function () {
    document.body.removeChild(iframe)
  }
  document.body.appendChild(iframe)
}
// respone拦截器
service.interceptors.response.use(
  response => {
    if (response.headers && (response.headers['content-type'] === 'application/zip')) {
       downloadUrl(response.request.responseURL)
      return response;
    }else {
      return response;
    }
  },
  error => {

    if (error.response) {
      if (error.response.status == 401) {
        if (router.currentRoute.fullPath != '/login') {
          store.dispatch('FedLogOut').then(() => {
            Message.error('验证失败,请重新登录')
            router.replace({
              path: '/login',
              query: {redirect: router.currentRoute.fullPath}
            })
          })
          location.reload();
        } else {
          Message({
            message: '登陆失效',
            type: 'error',
            duration: 5 * 1000
          })
          return Promise.reject(error)
        }

      } else {
        // Message({
        //   message: error.message,
        //   type: 'error',
        //   duration: 5 * 1000
        // })
        return Promise.reject(error)
      }
    } else {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }


  }
)


export const fetch = (config) => {

  let defaultParams = {
    url: '',
    method: 'get',
    headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
    responseType: 'text',
    params: {},
    data: {},
    baseURL: process.env.BASE_API
  }
  return new Promise((resolve, reject) => {
    config = extend(true, defaultParams, config)
    service(config)
      .then(response => {
        resolve(response)
      }, err => {
        reject(err)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

/**
 * 获取xhr response
 * @param xhr
 * @returns {string|null|string|*}
 */
function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}
/**
 * 发送formdata
 * todo！！！这里注意！axios发送formData会有一定的问题，导致后台获取不到formdata，之后有时间客户把这个问题解决一下
 */

export const sandFormData = (formData, info) => {

  let defaultParams = {
    url: '',
    baseURL: process.env.NODE_API,
    onProgress: function (e) {

    }
  }
  info = extend(true, defaultParams, info)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 600000;

    if (xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          info.onProgress(e);
        }

      };
    }
    xhr.onerror = function error(e) {
      var err = new Error('服务请求失败');
      reject(err);
    };
    xhr.ontimeout = (e) => {
      var err = new Error('服务请求超时');
      reject(err);
    }
    xhr.onload = function onload() {
      if (xhr.status == 200) {

        resolve(getBody(xhr));

      } else if (xhr.status == 401) {
        store.dispatch('FedLogOut').then(() => {
          Message.error('验证失败,请重新登录')
          router.replace({
            path: '/login',
            query: {redirect: router.currentRoute.fullPath}
          })
        })
      } else {
        var err = new Error('update file error!');
        err.status = 500;
        reject(err);
      }

    };
    xhr.open("POST", `${info.baseURL + info.url}`);
    xhr.setRequestHeader('Authorization', getToken());
    xhr.send(formData);
  })
}
