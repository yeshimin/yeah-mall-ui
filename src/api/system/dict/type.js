import request from '@/utils/request'

// 查询字典类型列表
export function listType(query) {
  return request({
    url: '/sysDict/crud/query',
    method: 'get',
    params: query
  })
}

// 查询字典类型详细
export function getType(dictId) {
  return request({
    url: '/sysDict/crud/detail',
    method: 'get',
    params: {
      id: dictId
    }
  })
}

// 新增字典类型
export function addType(data) {
  return request({
    url: '/sysDict/create',
    method: 'post',
    data: data
  })
}

// 修改字典类型
export function updateType(data) {
  return request({
    url: '/sysDict/update',
    method: 'post',
    data: data
  })
}

// 删除字典类型
export function delType(dictId) {
  return request({
    url: '/sysDict/delete',
    method: 'post',
    data: {
      ids: dictId
    }
  })
}

// 刷新字典缓存
export function refreshCache() {
  return request({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  })
}

// 获取字典选择框列表
export function optionselect(params) {
  return request({
    url: '/sysDict/crud/query',
    method: 'get',
    params
  })
}
