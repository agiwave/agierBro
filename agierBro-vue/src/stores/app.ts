/**
 * 应用状态管理
 *
 * 提供全局状态：loading、toast、主题、侧边栏等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY_THEME = 'app_theme'

export const useAppStore = defineStore('app', () => {
  // 状态
  const loading = ref(false)
  const loadingStack = ref<number>(0) // 支持嵌套 loading
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)

  // Toast 状态
  const toast = ref({
    visible: false,
    message: '',
    level: 'info' as 'success' | 'error' | 'info' | 'warning',
    duration: 3000
  })

  // 计算属性
  const isLoading = computed(() => loading.value)
  const currentTheme = computed(() => theme.value)
  const isSidebarCollapsed = computed(() => sidebarCollapsed.value)

  // 初始化
  function init() {
    // 恢复主题
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null
    if (savedTheme) {
      theme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }

  // Loading 方法（支持嵌套）
  function setLoading(value: boolean) {
    if (value) {
      loadingStack.value++
      loading.value = true
    } else {
      loadingStack.value = Math.max(0, loadingStack.value - 1)
      loading.value = loadingStack.value > 0
    }
  }

  // 包装 Promise，自动管理 loading
  async function withLoading<T>(promise: Promise<T>, delay = 300): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | null = null

    // 延迟显示 loading，避免闪烁
    if (delay > 0) {
      timeout = setTimeout(() => {
        setLoading(true)
        timeout = null
      }, delay)
    } else {
      setLoading(true)
    }

    try {
      return await promise
    } finally {
      if (timeout) {
        clearTimeout(timeout)
      }
      setLoading(false)
    }
  }

  // 主题方法
  function setTheme(value: 'light' | 'dark') {
    theme.value = value
    localStorage.setItem(STORAGE_KEY_THEME, value)
    document.documentElement.setAttribute('data-theme', value)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // 侧边栏方法
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(value: boolean) {
    sidebarCollapsed.value = value
  }

  // Toast 方法
  function showToast(
    message: string,
    level: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration = 3000
  ) {
    // 清除之前的定时器
    if (toast.value.visible) {
      hideToast()
    }

    toast.value = {
      visible: true,
      message,
      level,
      duration
    }

    if (duration > 0) {
      setTimeout(() => {
        hideToast()
      }, duration)
    }
  }

  function hideToast() {
    toast.value.visible = false
  }

  // 快捷方法
  function showSuccess(message: string, duration = 3000) {
    showToast(message, 'success', duration)
  }

  function showError(message: string, duration = 3000) {
    showToast(message, 'error', duration)
  }

  function showWarning(message: string, duration = 3000) {
    showToast(message, 'warning', duration)
  }

  function showInfo(message: string, duration = 3000) {
    showToast(message, 'info', duration)
  }

  return {
    // 状态
    loading,
    loadingStack,
    theme,
    sidebarCollapsed,
    toast,

    // 计算属性
    isLoading,
    currentTheme,
    isSidebarCollapsed,

    // 方法
    init,
    setLoading,
    withLoading,
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebarCollapsed,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
