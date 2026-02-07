import request from '@/utils/request'

// 新增金刚区入口（文件上传）
export function createQuickEntry(file, data) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', data.name);
  formData.append('linkUrl', data.linkUrl);
  formData.append('sort', data.sort);
  formData.append('status', data.status);
  
  return request({
    url: '/admin/quickEntry/create',
    method: 'post',
    data: formData
  })
}

// 修改金刚区入口（文件上传）
export function updateQuickEntry(id, file, data) {
  const formData = new FormData();
  formData.append('id', id);
  formData.append('name', data.name);
  formData.append('linkUrl', data.linkUrl);
  formData.append('sort', data.sort);
  formData.append('status', data.status);
  if (file) {
    formData.append('file', file);
  }
  
  return request({
    url: '/admin/quickEntry/update',
    method: 'post',
    data: formData
  })
}

// 删除金刚区入口
export function deleteQuickEntry(ids) {
  return request({
    url: '/admin/quickEntry/delete',
    method: 'post',
    data: ids
  })
}

// 查询金刚区入口详情
export function getQuickEntryDetail(id) {
  return request({
    url: `/admin/quickEntry/detail`,
    method: 'get',
    params: { id }
  })
}

// 查询金刚区入口列表
export function queryQuickEntryList(params) {
  return request({
    url: '/admin/quickEntry/query',
    method: 'get',
    params
  })
}

// 更新金刚区入口状态
export function updateQuickEntryStatus(id, status) {
  return request({
    url: '/admin/quickEntry/updateStatus',
    method: 'post',
    data: { id, status }
  })
}