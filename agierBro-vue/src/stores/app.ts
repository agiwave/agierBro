/**
 * 应用状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const loading = ref(false)
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
  
  // 方法
  function setLoading(value: boolean) {
    loading.value = value
  }
  
  function setTheme(value: 'light' | 'dark') {
    theme.value = value
    document.documentElement.setAttribute('data-theme', value)
  }
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function showToast(message: string, level: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
    toast.value = {
      visible: true,
      message,
      level,
      duration
    }
    
    setTimeout(() => {
      toast.value.visible = false
    }, duration)
  }
  
  function hideToast() {
    toast.value.visible = false
  }
  
  return {
    // 状态
    loading,
    theme,
    sidebarCollapsed,
    toast,
    
    // 计算属性
    isLoading,
    currentTheme,
    isSidebarCollapsed,
    
    // 方法
    setLoading,
    setTheme,
    toggleSidebar,
    showToast,
    hideToast
  }
})
