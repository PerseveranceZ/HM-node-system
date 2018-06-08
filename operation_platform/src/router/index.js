import Vue from 'vue'
import Router from 'vue-router'


const _import = process.env.NODE_ENV == 'development' ? require('./_import_development') : require('./_import_production');
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  {path: '/login', component: _import('login/index'), hidden: true},
  {path: '/404', component: _import('404'), hidden: true},

  {
    path: '/',
    component: Layout,
    name: 'home',
    hidden: true,
    redirect: '/home/index',
  },
  {
    path: '/home',
    component: Layout,
    name: 'index',
    children: [{
      path: 'index',
      name: '首页',
      component: _import('index/index'),
      meta: {title: '首页', icon: 'home'}
    }]
  },
  {
    path: '/clients-manager',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'clients-manager',
        component: _import('client-version-manager/app-clients-infos'),
        meta: {title: '客户端信息', icon: 'tree'}
      }
    ]
  },
  {
    path: '/application-Manager',
    component: Layout,
    redirect: '/application-Manager/upload-app',
    name: 'application-Manager',
    meta: {title: 'app版本控制', icon: 'example'},
    children: [
      // {
      //   path: 'apps-manager',
      //   name: 'apps-manager',
      //   component: _import('client-version-manager/app-clients-infos'),
      //   meta: {title: 'app应用信息', icon: 'tree'}
      // },
      {
        path: 'upload-app',
        name: 'upload-app',
        component: _import('client-version-manager/app-release-infos'),
        meta: {title: 'app客户端发布', icon: 'table'}
      },
      {
        path: 'js-bundle-manager',
        name: 'js-bundle-manager',
        component: _import('client-version-manager/js-bundle-manager'),
        meta: {title: 'bundle版本信息', icon: 'tree'}
      }
    ]
  },

  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})

