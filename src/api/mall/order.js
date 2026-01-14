import request from '@/utils/request'

// 查询订单列表
export function queryOrderList(params) {
  const shopId = localStorage.getItem('shopId') || '';
  return request({
    url: `/mch/order/query`,
    method: 'get',
    params: {
      ...params,
      shopId: parseInt(shopId)
    }
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/mch/order/detail`,
    method: 'get',
    params: { id }
  })
}

// 订单发货
export function deliverOrder(data) {
  return request({
    url: `/mch/order/deliver`,
    method: 'post',
    data
  })
}

// 订单备注
export function remarkOrder(data) {
  return request({
    url: `/mch/order/remark`,
    method: 'post',
    data
  })
}
