import request from '@/utils/request'

// 创建秒杀活动
export function createSeckillActivity(data) {
  return request({
    url: '/admin/seckill/activity/create',
    method: 'post',
    data
  })
}

// 更新秒杀活动
export function updateSeckillActivity(data) {
  return request({
    url: '/admin/seckill/activity/update',
    method: 'post',
    data
  })
}

// 删除秒杀活动
export function deleteSeckillActivity(ids) {
  return request({
    url: '/admin/seckill/activity/delete',
    method: 'post',
    data: ids
  })
}

// 获取秒杀活动详情
export function getSeckillActivityDetail(id) {
  return request({
    url: `/admin/seckill/activity/detail`,
    method: 'get',
    params: { id }
  })
}

// 查询秒杀活动列表
export function querySeckillActivityList(params) {
  return request({
    url: '/admin/seckill/activity/query',
    method: 'get',
    params
  })
}

// 关联秒杀商品
export function addSeckillProduct(data) {
  return request({
    url: '/admin/seckill/product/add',
    method: 'post',
    data
  })
}

// 移除秒杀商品
export function removeSeckillProduct(data) {
  return request({
    url: '/admin/seckill/product/remove',
    method: 'post',
    data
  })
}

// 查询秒杀商品列表
export function querySeckillProductList(params) {
  return request({
    url: '/admin/seckill/product/query',
    method: 'get',
    params
  })
}

// 获取活动监控数据
export function getSeckillMonitorData(activityId) {
  return request({
    url: `/admin/seckill/monitor/data`,
    method: 'get',
    params: { activityId }
  })
}