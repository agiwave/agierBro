/**
 * 认证状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthToken } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<AuthToken | null>(null)
  const user = ref<User | null>(null)
  
  // 计算属性
  const isAuthenticated = computed(() => {
    if (!token.value) return false
    if (token.value.expiresAt && Date.now() > token.value.expiresAt) {
      return false
    }
    return true
  })
  
  const currentUser = computed(() => user.value)
  const hasToken = computed(() => !!token.value)
  
  // 方法
  function setToken(newToken: AuthToken) {
    token.value = newToken
    localStorage.setItem('auth_token', JSON.stringify(newToken))
  }
  
  function setUser(newUser: User) {
    user.value = newUser
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }
  
  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
  
  function hasRole(role: string): boolean {
    return user.value?.roles?.includes(role) ?? false
  }
  
  function hasPermission(permission: string): boolean {
    return user.value?.permissions?.includes(permission) ?? false
  }
  
  // 初始化
  function initFromStorage() {
    try {
      const tokenStr = localStorage.getItem('auth_token')
      if (tokenStr) {
        token.value = JSON.parse(tokenStr)
      }
      
      const userStr = localStorage.getItem('auth_user')
      if (userStr) {
        user.value = JSON.parse(userStr)
      }
    } catch (e) {
      console.error('Failed to restore auth state:', e)
    }
  }
  
  return {
    // 状态
    token,
    user,
    
    // 计算属性
    isAuthenticated,
    currentUser,
    hasToken,
    
    // 方法
    setToken,
    setUser,
    clearAuth,
    hasRole,
    hasPermission,
    initFromStorage
  }
})
