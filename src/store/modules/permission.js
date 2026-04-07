import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      generateRoutes(roles) {
        return new Promise(resolve => {
          // 向后端请求路由数据
          getRouters().then(res => {
            console.log('Backend API response:', res.data)
            
            // 检查是否包含/mall/platBanner路由
            const hasPlatBanner = res.data.some(item => item.path === '/mall/platBanner')
            console.log('Has /mall/platBanner route:', hasPlatBanner)
            
            var resources = adapterMenuTree(res.data)
            console.log('After adapterMenuTree:', resources)

            const sdata = JSON.parse(JSON.stringify(resources))
            const rdata = JSON.parse(JSON.stringify(resources))
            const defaultData = JSON.parse(JSON.stringify(resources))
            const sidebarRoutes = filterAsyncRouter(sdata)
            console.log('After filterAsyncRouter (sidebarRoutes):', sidebarRoutes)
            
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            console.log('Dynamic routes to add:', asyncRoutes)
            
            asyncRoutes.forEach(route => { 
              console.log('Adding route:', route.path)
              router.addRoute(route) 
            })
            
            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            resolve(rewriteRoutes)
          })
        })
      }
    }
  })

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    // 跳过缺少路径的路由
    if (!route.path) {
      console.warn('Skipping route without path:', route)
      return false
    }
    
    // 跳过缺少必要属性的路由
    if (!route.component && (!route.children || !route.children.length)) {
      console.warn('Skipping route without component or children:', route.path)
      return false
    }
    
    // 跳过特定的无效秒杀路由路径
    if ((route.path === '/mall/seckill/seckill-analysis' || route.path === '/mall/seckill/seckill-monito') && (!route.component && (!route.children || !route.children.length))) {
      console.warn('Skipping invalid seckill route:', route.path)
      return false
    }
    
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    // 检查当前路由是否有权限
    let hasPermission = false
    if (route.permissions) {
      hasPermission = auth.hasPermiOr(route.permissions)
    } else if (route.roles) {
      hasPermission = auth.hasRoleOr(route.roles)
    } else {
      // 如果没有权限配置，默认有权限
      hasPermission = true
    }
    
    // 检查子路由是否有权限
    if (route.children && route.children.length) {
      const filteredChildren = filterDynamicRoutes(route.children)
      if (filteredChildren.length) {
        // 如果子路由有权限，即使当前路由没有权限，也保留当前路由
        route.children = filteredChildren
        res.push(route)
      } else if (hasPermission) {
        // 如果当前路由有权限，但子路由没有权限，保留当前路由
        res.push(route)
      }
    } else if (hasPermission) {
      // 如果没有子路由，但当前路由有权限，保留当前路由
      res.push(route)
    }
  })
  return res
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res
}

/**
 * 服务端数据到前端数据适配
 */
function adapterMenuTree(serverData) {
  // 确保serverData是一个数组
  if (!Array.isArray(serverData)) {
    console.error('Invalid serverData format, expected an array:', serverData)
    return []
  }
  
  return serverData.filter(item => {
    // 过滤掉缺少路径的路由
    if (!item.path) {
      console.warn('Skipping server route without path:', item)
      return false
    }
    
    // 过滤掉缺少必要属性的路由
    if (!item.component && (!item.children || !item.children.length)) {
      console.warn('Skipping server route without component or children:', item.path)
      return false
    }
    
    // 不过滤/mall路由，确保商城管理菜单显示
    // 但要确保它有正确的配置
    if (item.path === '/mall' && !item.component && (!item.children || !item.children.length)) {
      console.warn('Skipping invalid /mall route with no component or children:', item)
      return false
    }
    
    // 过滤掉路径为/mall/platBanner的无效路由
    if (item.path === '/mall/platBanner' && !item.component && (!item.children || !item.children.length)) {
      console.warn('Skipping invalid /mall/platBanner route:', item)
      return false
    }
    
    // 检查children中的路由是否有效
    if (item.children && item.children.length) {
      item.children = item.children.filter(child => {
        if (!child.path) {
          console.warn('Skipping child route without path:', child)
          return false
        }
        if (!child.component && (!child.children || !child.children.length)) {
          console.warn('Skipping child route without component or children:', item.path + '/' + child.path)
          return false
        }
        // 不再过滤platBanner路由，确保平台Banner管理菜单显示
        // if (child.path === 'platBanner') {
        //   console.warn('Skipping child route with path platBanner:', child)
        //   return false
        // }
        return true
      })
      // 如果所有children都被过滤掉了，那么这个父路由也应该被过滤掉
      if (!item.children.length) {
        console.warn('Skipping parent route with no valid children:', item.path)
        return false
      }
    }
    
    return true
  }).map(item => {
    const resource = {
      name: `Menu${item.id}`,
      path: item.path,
      hidden: !item.visible,
      redirect: item.type == 1 ? 'noRedirect' : '',
      component: item.component,
      alwaysShow: item.type == 1 ? true : false,
      meta: {
        title: item.name,
        icon: item.icon,
        noCache: false,
        link: item.linkUrl
      }
    };

    // 如果有 children，就递归转换
    if (item.children && item.children.length > 0) {
      resource.children = adapterMenuTree(item.children);
    }

    return resource;
  });
}

export default usePermissionStore
