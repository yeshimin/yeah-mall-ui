import { login, logout, getInfoByType } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from "@/utils/validate"
import defAva from '@/assets/images/profile.jpg'

// 获取当前登录类型（admin/merchant）
export function getLoginType() {
  let loginType = 'admin';
  try {
    loginType = localStorage.getItem('loginType') || '';
  } catch (e) {}
  return loginType || 'admin';
}

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        const loginType = userInfo.loginType || 'admin'
        // 调试：输出 loginType
        console.log('set loginType:', loginType)
        // 登录时强制写入localStorage，保证后续接口判断
        try {
          localStorage.setItem('loginType', loginType);
        } catch (e) {}
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid, loginType).then(res => {
            setToken(res.data.token)
            this.token = res.data.token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        const loginType = getLoginType();
        return new Promise((resolve, reject) => {
          getInfoByType(loginType).then(res => {
            const user = res.data.user
            let avatar = user.avatar || ""
            if (!isHttp(avatar)) {
              avatar = (isEmpty(avatar)) ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
            }
            if (res.data.roles && res.data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.data.roles
              this.permissions = res.data.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.id
            // 对于商家，使用loginAccount作为name
            this.name = loginType === 'merchant' ? user.loginAccount : user.username
            this.avatar = avatar
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          // logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          // }).catch(error => {
          //   reject(error)
          // })
        })
      }
    }
  })

export default useUserStore
