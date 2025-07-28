import request from '@/utils/request';

export function getSkuList(params) {
  return request({
    url: '/mch/productSku/crud/query',
    method: 'get',
    params
  });
}

export function saveSku(data) {
  return request({
    url: '/mch/productSku/crud/save',
    method: 'post',
    data
  });
}

export function deleteSku(id) {
  return request({
    url: `/mch/productSku/crud/delete/${id}`,
    method: 'delete'
  });
}
