<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-fallback">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{{ title || '出错了' }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div v-if="errorDetails" class="error-details">
        <pre>{{ errorDetails }}</pre>
      </div>
      <div class="error-actions">
        <button v-if="showRetry" class="btn btn-retry" @click="handleRetry">
          重试
        </button>
        <button v-if="showReset" class="btn btn-reset" @click="handleReset">
          重置
        </button>
        <slot name="actions"></slot>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { handleError, type AppError } from '@/services/errorHandler'

const props = defineProps<{
  title?: string
  showRetry?: boolean
  showReset?: boolean
  onError?: (error: Error) => void
}>()

const emit = defineEmits<{
  error: [error: Error]
  reset: []
}>()

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

const errorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
  const error = event instanceof ErrorEvent ? event.error : event.reason

  // 调用全局错误处理
  handleError(error)

  // 更新组件状态
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  errorDetails.value = import.meta.env.DEV ? error.stack || '' : ''

  // 触发回调
  emit('error', error)
  props.onError?.(error)
}

function handleRetry() {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  // 触发重试逻辑（由父组件处理）
  emit('reset')
}

function handleReset() {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  emit('reset')
}

// 监听错误事件
onMounted(() => {
  window.addEventListener('error', errorHandler as EventListener)
  window.addEventListener('unhandledrejection', errorHandler as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('error', errorHandler as EventListener)
  window.removeEventListener('unhandledrejection', errorHandler as EventListener)
})

// 暴露重置方法
defineExpose({
  reset: () => {
    hasError.value = false
    errorMessage.value = ''
    errorDetails.value = ''
  }
})
</script>

<style scoped>
.error-boundary {
  min-height: inherit;
}

.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: var(--spacing-xl);
  text-align: center;
  background: var(--bg-color-elevated);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.error-title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-xl);
  color: var(--text-color);
}

.error-message {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--text-color-secondary);
  max-width: 400px;
}

.error-details {
  margin: 0 0 var(--spacing-md);
  padding: var(--spacing-md);
  background: #f5f5f5;
  border-radius: var(--border-radius);
  max-width: 500px;
  max-height: 200px;
  overflow: auto;
  font-size: var(--font-size-sm);
  font-family: monospace;
  color: #666;
  text-align: left;
}

.error-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.btn-retry {
  background: var(--primary-color);
  color: #fff;
}

.btn-retry:hover {
  background: var(--primary-hover);
}

.btn-reset {
  background: #fff;
  color: var(--text-color);
  border: 1px solid #d9d9d9;
}

.btn-reset:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 移动端优化 */
@media (max-width: 576px) {
  .error-fallback {
    padding: var(--spacing-lg);
  }

  .error-icon {
    font-size: 36px;
  }

  .error-title {
    font-size: var(--font-size-lg);
  }

  .error-message {
    font-size: var(--font-size-sm);
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
  }
}
</style>
