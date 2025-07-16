import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid, loginType = 'admin') {
  const data = {
    username,
    password,
    code,
    key: uuid
  }
  const url = loginType === 'admin' ? '/admin/auth/login' : '/mch/auth/login';
  return request({
    url,
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/admin/sysUser/mine',
    method: 'get'
  })
}

// 获取用户详细信息（支持admin和merchant）
export function getInfoByType(loginType = 'admin') {
  const url = loginType === 'admin' ? '/admin/sysUser/mine' : '/mch/merchant/mine';
  return request({
    url,
    method: 'get'
  })
}

// 获取资源信息（支持admin和merchant）
export function getMineResourcesByType(loginType = 'admin') {
  const url = loginType === 'admin' ? '/admin/sysUser/mineResources' : '/mch/merchant/mineResources';
  console.log('loginType.2:' + loginType);
  return request({
    url,
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/admin/auth/captcha',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}