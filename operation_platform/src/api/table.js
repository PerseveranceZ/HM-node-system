import * as request from '@/utils/request'

export function getList(params) {
  return request.fetch({
    url: '/table/list',
    method: 'get',
    params
  })
}
