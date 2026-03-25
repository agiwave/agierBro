import { createRouter, createWebHistory } from 'vue-router'
import { mapToDataSource } from '@/services/dataSourceMapper'

/**
 * 前端 URL → 后端数据源地址 映射
 *
 * 极简规则（只有两条）：
 * 1. / → /api/index.json
 * 2. /xxx → /api/xxx.json（无论多少级）
 *
 * 示例：
 * - /                    → /api/index.json
 * - /users               → /api/users.json
 * - /users/001           → /api/users/001.json
 * - /editor/papers       → /api/editor/papers.json
 * - /editor/papers/001   → /api/editor/papers/001.json
 */
function getUrlApiMapping(path: string): string {
  return mapToDataSource(path)
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
