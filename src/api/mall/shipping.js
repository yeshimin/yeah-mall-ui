import request from '@/utils/request'

// 获取商家发货信息
export function getShippingInfo() {
  return request({
    url: '/mch/shipping/info',
    method: 'get'
  })
}

// 保存商家发货信息
export function saveShippingInfo(data) {
  return request({
    url: '/mch/shipping/save',
    method: 'post',
    data: data
  })
}

// 获取物流商列表
export function getLogisticsList() {
  return request({
    url: '/mch/shipping/logistics/list',
    method: 'get'
  })
}

// 保存物流商信息
export function saveLogistics(data) {
  return request({
    url: '/mch/shipping/logistics/save',
    method: 'post',
    data: data
  })
}

// 删除物流商
export function deleteLogistics(id) {
  return request({
    url: `/mch/shipping/logistics/delete/${id}`,
    method: 'delete'
  })
}

// 获取省市区树形数据
export function getAreaTree(maxLevel = 3) {
  return request({
    url: `/mch/area/tree`,
    method: 'get',
    params: { maxLevel }
  })
}

// 获取省份列表
export function getProvinceList() {
  return request({
    url: '/mch/shipping/region/province',
    method: 'get'
  })
}

// 获取城市列表
export function getCityList(province) {
  return request({
    url: `/mch/shipping/region/city/${province}`,
    method: 'get'
  })
}

// 获取区县列表
export function getDistrictList(city) {
  return request({
    url: `/mch/shipping/region/district/${city}`,
    method: 'get'
  })
}