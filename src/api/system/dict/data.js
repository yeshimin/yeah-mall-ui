import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/sysDict/crud/query',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: '/sysDict/crud/detail',
    method: 'get',
    params: {
      id: dictCode
    }
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    // url: '/system/dict/data/type/' + dictType,
    url: '/sysDict/tree',
    params: {
      rootNodeCode: dictType
    },
    method: 'get'
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/sysDict/create',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/sysDict/update',
    method: 'post',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: '/sysDict/delete',
    method: 'post',
    data: {
      ids: dictCode
    }
  })
}
