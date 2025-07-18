import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/admin/sysRes/crud/query',
    method: 'get',
    params: query
  })
}

// 查询菜单树
export function menuTree(query) {
  return request({
    url: '/admin/sysRes/tree',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: '/admin/sysRes/crud/detail',
    method: 'get',
    params: {
      id: menuId
    }
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/admin/sysRes/tree',
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/admin/sysRole/queryResourceTree',
    method: 'get',
    params: { roleId }
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/admin/sysRes/create',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/admin/sysRes/update',
    method: 'post',
    data: data
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: '/admin/sysRes/delete',
    method: 'post',
    data: {
      ids: menuId
    }
  })
}