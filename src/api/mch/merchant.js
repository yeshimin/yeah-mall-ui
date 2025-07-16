import request from '@/utils/request'

// 查询商家列表
export function listMerchant(query) {
  return request({
    url: '/admin/merchant/crud/query',
    method: 'get',
    params: query
  })
}

// 创建商家
export function createMerchant(data) {
  return request({
    url: '/admin/merchant/create',
    method: 'post',
    data
  })
}
