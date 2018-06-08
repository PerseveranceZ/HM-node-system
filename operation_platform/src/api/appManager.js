/**
 * Created by tangsicheng on 2018/3/7.
 */
import * as request from '@/utils/request'
export const getReleaseInfos=()=> {
    return request.fetch({
        url:'/app/releaseInfos'
    })
}
export const addReleaseInfos=(formdata,config)=> {
    return request.sandFormData(formdata,config)
}

export const getJsBundleInfos = () => {
    let config = {
        url:'/app/jsBundleInfo'
    }
    return request.fetch(config)
}
export const updateReleaseInfos = (data) => {
  let config = {
    url:`/app/releaseInfos`,
    method:'put',
    data
  }
  return request.fetch(config)
}


export const isValidateAppPackageName = params => {
  let config = {
    url:'/app/validateAppPackageName',
    params
  }
  return request.fetch(config)
}
export const addOrUpdateClientInfo = (data) => {
  let config = {
    url:'/app/clientInfo',
    method: data._id?'put':'post',
    data:data
  }
  return request.fetch(config)
}

export const postToPgyer = (_id) => {
  let config = {
    url:'/app/uploadToPgyer',
    method: 'post',
    timeout: 50000,
    data:{
      _id
    }
  }
  return request.fetch(config)
}


export const getClientInfo = (data) => {
  let config = {
    url:'/app/clientInfo',
  }
  return request.fetch(config)
}
export const deleteClientInfo = (data) => {
  let config = {
    url:'/app/clientInfo',
    method:'delete',
    data
  }
  return request.fetch(config)
}

export const isValidateDisplayName = params => {
  let config = {
    url:'/app/validateDisplayName',
    params
  }
  return request.fetch(config)
}

export const checkReleaseVersion = params => {
  let config = {
    url:'/app/checkReleaseVersion',
    params
  }
  return request.fetch(config)
}

export const downloadBundle = appName => {
  let config = {
    url:`/app/downloadBundle/${appName}`,
  }
  return request.fetch(config)
}

export const updateJsBundleStatus = param => {
  let config = {
    method: 'post',
    url:`/app/updateJsBundleStatus/${param._id}/${param.status}`
  }
  return request.fetch(config)
}
