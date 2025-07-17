import request from '@/utils/request'

// 查询商品分类列表
export function listCategory(params) {
  return request({
    url: '/mall/category/list',
    method: 'get',
    params
  })
}

// 新增商品分类
export function createCategory(data) {
  return request({
    url: '/mall/category/create',
    method: 'post',
    data
  })
}

// 修改商品分类
export function updateCategory(data) {
  return request({
    url: '/mall/category/update',
    method: 'post',
    data
  })
}

// 删除商品分类
export function deleteCategory(ids) {
  return request({
    url: '/mall/category/delete',
    method: 'post',
    data: ids
  })
}

// 查询商品分类详情
export function getCategoryDetail(id) {
  return request({
    url: `/mall/category/detail/${id}`,
    method: 'get'
  })
}
