/**
 * 认证服务 - 纯 Server 驱动方案
 *
 * 核心原则：
 * - Server 负责：认证判断、权限控制、返回相应数据
 * - App 负责：接收什么数据就渲染什么
 *
 * 本服务仅提供最基础的 Token 管理功能（存储、读取、自动携带）
 * 不包含任何认证逻辑、权限判断、路由守卫等
 */

const STORAGE_KEY_TOKEN = 'auth_token'
const STORAGE_KEY_REFRESH_TOKEN = 'auth_refresh_token'

/**
 * 保存 Token
 */
export function saveToken(accessToken: string, refreshToken?: string) {
  localStorage.setItem(STORAGE_KEY_TOKEN, accessToken)
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken)
  }
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

/**
 * 获取刷新 Token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN)
}

/**
 * 清除 Token
 */
export function clearToken() {
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN)
}

/**
 * 获取认证头
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  if (token) {
    return { 'Authorization': `Bearer ${token}` }
  }
  return {}
}
