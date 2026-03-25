<template>
  <div class="object-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="(prop, key) in visibleProps" :key="key">
            {{ formatLabel(key, prop) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index" :class="{ active: isActive(item) }" @click="handleItemClick(item)">
          <td v-for="(prop, key) in visibleProps" :key="key">
            {{ formatValue(item[key], prop) }}
          </td>
        </tr>
      </tbody>
    </table>
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
// 获取可见属性
const visibleProps = computed(() => {
  if (!props.itemSchema?.properties) return {}
  const visible: Record<string, Field> = {}
  for (const [key, field] of Object.entries(props.itemSchema.properties)) {
    if (field.visible !== false) visible[key] = field
  }
  return visible
})
// 格式化标签（优先使用 field.title）
function formatLabel(key: string, field?: Field): string {
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
.object-table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; }
.data-table thead { background: #fafafa; }
.data-table th { padding: 12px 16px; text-align: left; font-weight: 600; color: #333; font-size: 14px; border-bottom: 2px solid #e8e8e8; }
.data-table tbody tr { border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: all 0.3s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #fafafa; }
.data-table tbody tr.active { background: #e6f7ff; }
.data-table td { padding: 12px 16px; color: #333; font-size: 14px; }
</style>
