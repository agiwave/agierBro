<template>
  <Teleport to="body">
    <transition name="toast">
      <div v-if="visible" :class="['toast-container', level]">
        <span class="toast-icon">{{ icon }}</span>
        <span class="toast-message">{{ message }}</span>
        <button class="toast-close" @click="close">×</button>
      </div>
    </transition>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
export type ToastLevel = 'success' | 'error' | 'warning' | 'info'
const props = defineProps<{
  modelValue: boolean
  message: string
  level?: ToastLevel
  duration?: number
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()
const visible = ref(props.modelValue)
const icon: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.duration) {
    setTimeout(() => {
      visible.value = false
      emit('update:modelValue', false)
    }, props.duration)
  }
})
function close() {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}
</script>
<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  min-width: 300px;
}
.toast-container.success { background: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a; }
.toast-container.error { background: #fff2f0; border: 1px solid #ffccc7; color: #ff4d4f; }
.toast-container.warning { background: #fffbe6; border: 1px solid #ffe58f; color: #faad14; }
.toast-container.info { background: #e6f7ff; border: 1px solid #91d5ff; color: #1890ff; }
.toast-icon { font-size: 20px; }
.toast-message { flex: 1; font-size: 14px; }
.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
}
.toast-close:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from { transform: translateX(100%); opacity: 0; }
.toast-leave-to { transform: translateX(100%); opacity: 0; }
</style>
