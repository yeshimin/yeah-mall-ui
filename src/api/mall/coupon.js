import request from '@/utils/request'

// 商家端优惠券管理API

// 获取优惠券列表
export function getCouponList(params) {
  return request({
    url: '/mch/coupon/query',
    method: 'get',
    params
  })
}

// 创建优惠券
export function createCoupon(data) {
  return request({
    url: '/mch/coupon/create',
    method: 'post',
    data
  })
}

// 更新优惠券
export function updateCoupon(data) {
  return request({
    url: '/mch/coupon/update',
    method: 'post',
    data
  })
}

// 删除优惠券
export function deleteCoupon(ids) {
  return request({
    url: '/mch/coupon/delete',
    method: 'post',
    data: ids
  })
}

// 获取优惠券详情
export function getCouponDetail(id) {
  return request({
    url: `/mch/coupon/detail/${id}`,
    method: 'get'
  })
}

// 更新优惠券状态
export function updateCouponStatus(data) {
  return request({
    url: '/mch/coupon/updateStatus',
    method: 'post',
    data
  })
}

// 获取优惠券使用记录
export function getCouponRecord(params) {
  return request({
    url: '/mch/coupon/queryRecord',
    method: 'get',
    params
  })
}
