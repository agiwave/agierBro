import { createRouter, createWebHistory } from 'vue-router'

/**
 * URL 到 API 的映射规则
 * 
 * 规则：
 * 1. / → /api/index.json
 * 2. /:entity → /api/:entity/index.json
 * 3. /:entity/:sub → /api/:entity/:sub/index.json
 * 4. /:entity/:sub/:id → /api/:entity/:sub/:id.json
 */
function getUrlApiMapping(path: string): string {
  const cleanPath = path.split('?')[0]

  if (cleanPath === '/' || cleanPath === '') {
    return '/api/index.json'
  }

  const segments = cleanPath.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return '/api/index.json'
  }
  
  const first = segments[0]
  if (first.startsWith('@') || first === 'src' || first === 'node_modules') {
    return ''
  }

  // /:entity → /api/:entity/index.json
  if (segments.length === 1) {
    return `/api/${first}/index.json`
  }
  
  // /:entity/:sub → /api/:entity/:sub/index.json
  if (segments.length === 2) {
    return `/api/${segments[0]}/${segments[1]}/index.json`
  }
  
  // /:entity/:sub/:id → /api/:entity/:sub/:id.json
  return `/api/${segments.join('/')}.json`
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Entry.vue') },
    { path: '/:entity', name: 'entity', component: () => import('@/views/Entry.vue') },
    { path: '/:entity/:sub', name: 'entity-sub', component: () => import('@/views/Entry.vue') },
    { path: '/:entity/:sub/:id', name: 'entity-detail', component: () => import('@/views/Entry.vue') }
  ]
})

export { getUrlApiMapping }
export default router
