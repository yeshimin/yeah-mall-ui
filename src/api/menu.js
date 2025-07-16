import request from '@/utils/request'
import { getLoginType } from '@/store/modules/user'

// 获取路由
export const getRouters = () => {
  const loginType = getLoginType();
  const url = loginType === 'admin'
    ? '/admin/sysUser/mineResources'
    : '/mch/merchant/mineResources';
  return request({
    url,
    method: 'get'
  })
}