import request from '@/utils/request'

// 查询商品SPU列表
export function listSpu(params) {
  return request({
    url: '/mall/spu/list',
    method: 'get',
    params
  })
}

// 新增商品SPU
export function createSpu(data) {
  return request({
    url: '/mall/spu/create',
    method: 'post',
    data
  })
}

// 修改商品SPU
export function updateSpu(data) {
  return request({
    url: '/mall/spu/update',
    method: 'post',
    data
  })
}

// 删除商品SPU
export function deleteSpu(ids) {
  return request({
    url: '/mall/spu/delete',
    method: 'post',
    data: ids
  })
}

// 查询商品SPU详情
export function getSpuDetail(id) {
  return request({
    url: `/mall/spu/detail/${id}`,
    method: 'get'
  })
}
