import request from '@/utils/request'

// 获取商家发货信息
export function getShippingInfo() {
  const shopId = localStorage.getItem('shopId') || '';
  return request({
    url: `/mch/deliveryInfo/query`,
    method: 'get',
    params: { shopId }
  })
}

// 保存商家发货信息
export function saveShippingInfo(data) {
  const shopId = localStorage.getItem('shopId') || '';
  const saveData = {
    shopId: parseInt(shopId),
    name: data.senderName,
    contact: data.senderPhone,
    provinceCode: data.provinceCode,
    provinceName: data.province,
    cityCode: data.cityCode,
    cityName: data.city,
    districtCode: data.districtCode,
    districtName: data.district,
    detailAddress: data.senderAddress,
    postalCode: data.postalCode
  };
  return request({
    url: `/mch/deliveryInfo/save`,
    method: 'post',
    data: saveData
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