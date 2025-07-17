import request from '@/utils/request'

// 查询Banner列表
export function listBanner(params) {
  return request({
    url: '/mall/banner/list',
    method: 'get',
    params
  })
}

// 新增Banner
export function createBanner(data) {
  return request({
    url: '/mall/banner/create',
    method: 'post',
    data
  })
}

// 修改Banner
export function updateBanner(data) {
  return request({
    url: '/mall/banner/update',
    method: 'post',
    data
  })
}

// 删除Banner
export function deleteBanner(ids) {
  return request({
    url: '/mall/banner/delete',
    method: 'post',
    data: ids
  })
}

// 查询Banner详情
export function getBannerDetail(id) {
  return request({
    url: `/mall/banner/detail/${id}`,
    method: 'get'
  })
}
