/**
 * 网络状态检测 Composable
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const isRetrying = ref(false)
  const retryCount = ref(0)
  const maxRetries = ref(3)
  
  let retryTimers: number[] = []
  
  function handleOnline() {
    isOnline.value = true
    isRetrying.value = false
    retryCount.value = 0
    // 清除所有重试定时器
    retryTimers.forEach(timer => clearTimeout(timer))
    retryTimers = []
  }
  
  function handleOffline() {
    isOnline.value = false
  }
  
  /**
   * 带指数退避的重试
   */
  async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      onRetry?: (attempt: number, error: Error) => void
    } = {}
  ): Promise<T> {
    const {
      maxRetries: max = maxRetries.value,
      baseDelay = 1000,
      maxDelay = 10000,
      onRetry
    } = options
    
    let lastError: Error | undefined
    
    for (let attempt = 0; attempt <= max; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === max) {
          break
        }
        
        // 指数退避
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        
        onRetry?.(attempt + 1, lastError)
        
        isRetrying.value = true
        retryCount.value = attempt + 1
        
        await new Promise(resolve => {
          const timer = setTimeout(resolve, delay) as unknown as number
          retryTimers.push(timer)
        })
      }
    }
    
    isRetrying.value = false
    throw lastError || new Error('Retry failed')
  }
  
  /**
   * 检查网络状态
   */
  function checkOnline(): boolean {
    return navigator.onLine
  }
  
  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })
  
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    // 清除所有重试定时器
    retryTimers.forEach(timer => clearTimeout(timer))
  })
  
  return {
    isOnline,
    isRetrying,
    retryCount,
    checkOnline,
    retryWithBackoff
  }
}
