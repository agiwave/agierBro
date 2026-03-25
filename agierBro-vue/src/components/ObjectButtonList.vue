<template>
  <div class="object-button-list">
    <button v-for="(item, index) in items" :key="index" class="element-btn" :class="{ active: isActive(item) }" @click="handleItemClick(item)">
      {{ getDisplayText(item) }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Field, DataObject } from '@/types'
const props = defineProps<{ items: DataObject[]; itemSchema: Field; addressPattern?: string }>()
const emit = defineEmits<{ itemClick: [url: string] }>()
const router = useRouter()
const route = useRoute()
// 获取可见字段
const visibleFields = computed(() => {
  if (!props.itemSchema?.properties) return {}
  const visible: Record<string, Field> = {}
  for (const [key, field] of Object.entries(props.itemSchema.properties)) {
    if (field.visible !== false) visible[key] = field
  }
  return visible
})
// 获取显示文本
function getDisplayText(item: DataObject): string {
  const visible = visibleFields.value
  if (visible.label && item.label) return String(item.label)
  const firstKey = Object.keys(visible)[0]
  return firstKey ? String(item[firstKey]) : ''
}
// 判断是否激活
function isActive(item: DataObject): boolean {
  return (item as any).active === true
}
// 获取元素地址
function getElementUrl(item: DataObject): string {
  const addressPattern = props.addressPattern || props.itemSchema?._address
  if (addressPattern) {
    let url = addressPattern
    for (const [key, value] of Object.entries(item)) {
      url = url.replace(`{${key}}`, String(value))
    }
    return url.replace('.json', '')
  }
  return route.path
}
// 处理点击
function handleItemClick(item: DataObject) {
  const url = getElementUrl(item)
  emit('itemClick', url)
  router.push(url)
}
</script>
<style scoped>
.object-button-list { display: flex; gap: 8px; flex-wrap: wrap; }
.element-btn { padding: 8px 16px; background: #fff; border: 1px solid #d9d9d9; border-radius: 4px; color: #666; cursor: pointer; transition: all 0.3s; font-size: 14px; }
.element-btn:hover { border-color: #1890ff; color: #1890ff; }
.element-btn.active { background: #1890ff; border-color: #1890ff; color: #fff; }
</style>
