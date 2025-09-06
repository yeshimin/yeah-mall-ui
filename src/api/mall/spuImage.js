import request from '@/utils/request'

// 上传主图
export function setMainImage(data) {
  return request({
    url: '/mch/productSpuImage/create',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传滚动图
export function setCarouselImages(data) {
  return request({
    url: '/mch/productSpuImage/create',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除图片
export function deleteSpuImage(id) {
  return request({
    url: `/mch/productSpuImage/delete/${id}`,
    method: 'delete'
  })
}

// 获取图片列表
export function listSpuImages(queryParams) {
  return request({
    url: '/mch/productSpuImage/crud/query',
    method: 'get',
    params: queryParams
  })
}