/**
 * 通用认证服务
 * 
 * 提供 JWT Token 管理、认证状态、路由守卫等功能
 * 不依赖特定后端，可配置适配
 */

import { ref, computed } from 'vue'

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface User {
  id: string
  username: string
  email?: string
  roles?: string[]
  permissions?: string[]
}

const STORAGE_KEY_TOKEN = 'auth_token'
const STORAGE_KEY_USER = 'auth_user'

// 响应式状态
const token = ref<AuthToken | null>(null)
const user = ref<User | null>(null)
const isInitialized = ref(false)

/**
 * 初始化认证状态
 */
export function initAuth() {
  if (isInitialized.value) return

  try {
    // 从 localStorage 恢复 Token
    const tokenStr = localStorage.getItem(STORAGE_KEY_TOKEN)
    if (tokenStr) {
      token.value = JSON.parse(tokenStr)
    }

    // 从 localStorage 恢复用户信息
    const userStr = localStorage.getItem(STORAGE_KEY_USER)
    if (userStr) {
      user.value = JSON.parse(userStr)
    }
  } catch (e) {
    console.error('Failed to restore auth state:', e)
  }

  isInitialized.value = true
}

/**
 * 保存 Token
 */
export function saveToken(newToken: AuthToken) {
  token.value = newToken
  localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(newToken))
}

/**
 * 保存用户信息
 */
export function saveUser(newUser: User) {
  user.value = newUser
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
}

/**
 * 清除认证状态
 */
export function clearAuth() {
  token.value = null
  user.value = null
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_USER)
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return token.value?.accessToken || null
}

/**
 * 检查是否已认证
 */
export function isAuthenticated(): boolean {
  if (!token.value) return false
  
  // 检查是否过期
  if (token.value.expiresAt && Date.now() > token.value.expiresAt) {
    clearAuth()
    return false
  }
  
  return true
}

/**
 * 获取当前用户
 */
export function getCurrentUser(): User | null {
  return user.value
}

/**
 * 检查是否有角色
 */
export function hasRole(role: string): boolean {
  return user.value?.roles?.includes(role) ?? false
}

/**
 * 检查是否有权限
 */
export function hasPermission(permission: string): boolean {
  return user.value?.permissions?.includes(permission) ?? false
}

/**
 * 获取认证头
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const tokenStr = getToken()
  if (tokenStr) {
    headers['Authorization'] = `Bearer ${tokenStr}`
  }
  return headers
}

/**
 * 路由守卫
 */
export function authGuard(to: { path: string; meta?: { requiresAuth?: boolean; requiresRole?: string } }) {
  const requiresAuth = to.meta?.requiresAuth ?? false
  const requiresRole = to.meta?.requiresRole
  
  if (requiresAuth && !isAuthenticated()) {
    // 重定向到登录页，保存原路径
    return {
      path: '/auth/login',
      query: { redirect: to.path }
    }
  }
  
  if (requiresRole && !hasRole(requiresRole)) {
    // 无权限
    return { path: '/403' }
  }
  
  return true
}

// 计算属性
export const authState = {
  isAuthenticated: computed(() => isAuthenticated()),
  currentUser: computed(() => getCurrentUser()),
  hasToken: computed(() => !!token.value)
}
