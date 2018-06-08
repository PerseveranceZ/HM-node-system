/**
 * Created by tangsicheng on 2018/4/27.
 */
import * as request from '@/utils/request'

export function saveBanner(data) {
  return request.fetch({
    url: `/banners/list`,
    method: data._id?'put':'post',
    data
  })
}

export function getBannerListByAppName(appName) {
  return request.fetch({
    url: `/banners/list/${appName}`
  })
}

export function deletedBannerById(id) {
  return request.fetch({
    url: `/banners/list/${id}`,
    method: 'delete',
  })
}
