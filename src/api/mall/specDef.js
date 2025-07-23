import request from '@/utils/request'

// 规格定义列表
export function listSpecDef(params) {
  return request({
    url: '/mch/productSpecDef/crud/query',
    method: 'get',
    params
  })
}

// 新增规格定义
export function createSpecDef(data) {
  return request({
    url: '/mch/productSpecDef/create',
    method: 'post',
    data
  })
}

// 编辑规格定义
export function updateSpecDef(data) {
  return request({
    url: '/mch/productSpecDef/update',
    method: 'post',
    data
  })
}

// 删除规格定义（支持批量）
export function deleteSpecDef(ids) {
  return request({
    url: '/mch/productSpecDef/delete',
    method: 'post',
    data: ids
  })
}

// 其它增删改查接口可后续补充
