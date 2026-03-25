<template>
  <Teleport to="body">
    <transition name="toast-fade">
      <div v-if="isVisible" class="toast-container" :class="`toast-${level}`">
        <div class="toast-icon">{{ icon }}</div>
        <div class="toast-message">{{ message }}</div>
        <button v-if="closable" class="toast-close" @click="close">×</button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  closable?: boolean
}>()

const appStore = useAppStore()

const isVisible = computed(() => appStore.toast.visible)
const message = computed(() => appStore.toast.message)
const level = computed(() => appStore.toast.level)

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

const icon = computed(() => iconMap[level.value] || 'ℹ')

function close() {
  appStore.hideToast()
}

// 监听 toast 变化，自动关闭
watch(
  () => appStore.toast.visible,
  (visible) => {
    if (visible && appStore.toast.duration > 0) {
      setTimeout(() => {
        appStore.hideToast()
      }, appStore.toast.duration)
    }
  }
)
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 200px;
  max-width: 500px;
}

.toast-success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.toast-error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.toast-warning {
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.toast-info {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  color: #52c41a;
}

.toast-error .toast-icon {
  color: #ff4d4f;
}

.toast-warning .toast-icon {
  color: #faad14;
}

.toast-info .toast-icon {
  color: #1890ff;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
  word-break: break-word;
}

.toast-close {
  padding: 0;
  background: transparent;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #333;
}

/* 动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 移动端优化 */
@media (max-width: 576px) {
  .toast-container {
    top: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    min-width: auto;
    max-width: none;
  }

  .toast-fade-enter-from,
  .toast-fade-leave-to {
    transform: translateY(-20px);
  }
}
</style>
