import request from '@/utils/request'

// 商品SKU列表
export function listSku(params) {
  return request({
    url: '/mch/productSku/crud/query',
    method: 'get',
    params
  })
}
// 新增SKU
export function createSku(data) {
  return request({
    url: '/mch/productSku/create',
    method: 'post',
    data
  })
}
// 编辑SKU
export function updateSku(data) {
  return request({
    url: '/mch/productSku/update',
    method: 'post',
    data
  })
}
// 删除SKU（支持批量）
export function deleteSku(ids) {
  return request({
    url: '/mch/productSku/delete',
    method: 'post',
    data: ids
  })
}
// 其它SKU相关接口可后续补充
