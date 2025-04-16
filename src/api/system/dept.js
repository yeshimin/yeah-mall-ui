import request from '@/utils/request'
import { de } from 'element-plus/es/locales.mjs'

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  })
}

// 查询组织树
export function orgTree(query) {
  return request({
    url: '/sysOrg/tree',
    method: 'get',
    params: query
  })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get'
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/sysOrg/crud/detail',
    method: 'get',
    params: {
      id: deptId
    }
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/sysOrg/create',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/sysOrg/update',
    method: 'post',
    data: data
  })
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/sysOrg/delete',
    method: 'post',
    data: {
      ids: deptId
    }
  })
}