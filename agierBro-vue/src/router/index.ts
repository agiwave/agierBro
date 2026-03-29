import { createRouter, createWebHistory } from 'vue-router'
import { mapToDataSource } from '@/services/dataSourceMapper'

/**
 * 前端 URL → 后端数据源地址 映射
 *
 * 统一分形规则（只有一条）：
 * - /xxx/yyy/zzz → /api/xxx/yyy/zzz.json
 */
function getUrlApiMapping(path: string): string {
  return mapToDataSource(path)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 首页
    { path: '/', name: 'home', component: () => import('@/views/Entry.vue') },

    // 通用路由：匹配所有路径
    { path: '/:pathMatch(.*)*', name: 'catch-all', component: () => import('@/views/Entry.vue') }
  ]
})

// 路由守卫：处理 /api/* 路径的重定向
router.beforeEach((to, from, next) => {
  const firstSegment = to.path.split('/')[1]
  
  // 如果访问的是 /api/* 路径，重定向到根路径
  // 因为 /api/* 是静态资源路径，不应该通过 Vue 路由访问
  if (firstSegment === 'api') {
    // 提取资源路径，例如 /api/users.json → /users
    const apiPath = to.path.replace('/api/', '').replace('.json', '')
    if (apiPath && apiPath !== 'index') {
      next('/' + apiPath)
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export { getUrlApiMapping }
export default router
