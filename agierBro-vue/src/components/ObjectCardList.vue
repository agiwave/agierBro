<template>
  <div class="object-card-list">
    <div v-for="(item, index) in items" :key="index" class="element-card" :class="{ active: isActive(item) }" @click="handleItemClick(item)">
      <div v-for="(value, key) in visibleFields(item)" :key="key" class="element-field">
        <span class="element-label">{{ formatLabel(key) }}</span>
        <span class="element-value">{{ formatValue(value, getField(key)) }}</span>
      </div>
    </div>
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
// 获取可见字段定义
const visibleFieldDefs = computed(() => {
  if (!props.itemSchema?.properties) return {}
  const visible: Record<string, Field> = {}
  for (const [key, field] of Object.entries(props.itemSchema.properties)) {
    if (field.visible !== false) visible[key] = field
  }
  return visible
})
// 获取可见字段值
function visibleFields(item: DataObject): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, field] of Object.entries(visibleFieldDefs.value)) {
    if (item[key] != null || field.default != null) result[key] = item[key]
  }
  return result
}
// 获取字段定义
function getField(key: string): Field | undefined {
  return visibleFieldDefs.value[key]
}
// 格式化标签
function formatLabel(key: string): string {
  const field = getField(key)
  if (field?.title) return field.title
  return key.replace(/_/g, ' ')
}
// 格式化值
function formatValue(value: any, field?: Field): string {
  if (value == null) return ''
  if (field?.enum) { const item = field.enum.find(e => e.value === value); return item ? item.label : String(value) }
  return String(value)
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
.object-card-list { display: flex; gap: 12px; flex-wrap: wrap; }
.element-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.3s; min-width: 200px; }
.element-card:hover { border-color: #1890ff; box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2); }
.element-card.active { border-color: #1890ff; background: #e6f7ff; }
.element-field { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.element-field:last-child { margin-bottom: 0; }
.element-label { color: #666; font-size: 12px; }
.element-value { color: #333; font-size: 14px; font-weight: 500; }
</style>
