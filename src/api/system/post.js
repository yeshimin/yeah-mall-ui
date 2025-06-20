import request from '@/utils/request'

// 查询岗位列表
export function listPost(query) {
  return request({
    url: '/admin/sysPost/crud/query',
    method: 'get',
    params: query
  })
}

// 查询岗位详细
export function getPost(postId) {
  return request({
    url: '/admin/sysPost/crud/detail',
    method: 'get',
    params: {
      id: postId
    }
  })
}

// 新增岗位
export function addPost(data) {
  return request({
    url: '/admin/sysPost/create',
    method: 'post',
    data: data
  })
}

// 修改岗位
export function updatePost(data) {
  return request({
    url: '/admin/sysPost/update',
    method: 'post',
    data: data
  })
}

// 删除岗位
export function delPost(postId) {
  return request({
    url: '/admin/sysPost/delete',
    method: 'post',
    data: {
      ids: postId
    }
  })
}
