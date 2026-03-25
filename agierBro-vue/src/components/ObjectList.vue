<template>
  <div class="object-list">
    <!-- 遍历所有 array 类型的字段 -->
    <div v-for="(field, fieldName) in arrayFields" :key="fieldName" class="array-section">
      <!-- 字段标题（可选） -->
      <div v-if="field.title" class="array-title">{{ field.title }}</div>
      
      <!-- 根据可见属性数量选择组件 -->
      <ObjectTable
        v-if="getVisibleCount(field.items) > 4"
        :items="getArrayData(fieldName)"
        :itemSchema="field.items!"
        :addressPattern="field.items?._address"
        @itemClick="handleItemClick"
      />
      <ObjectCardList
        v-else-if="getVisibleCount(field.items) > 1"
        :items="getArrayData(fieldName)"
        :itemSchema="field.items!"
        :addressPattern="field.items?._address"
        @itemClick="handleItemClick"
      />
      <ObjectButtonList
        v-else
        :items="getArrayData(fieldName)"
        :itemSchema="field.items!"
        :addressPattern="field.items?._address"
        @itemClick="handleItemClick"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Schema, Field, DataObject } from '@/types'
import ObjectTable from './ObjectTable.vue'
import ObjectCardList from './ObjectCardList.vue'
import ObjectButtonList from './ObjectButtonList.vue'
const props = defineProps<{ schema: Schema | null; data: DataObject }>()
const router = useRouter()
// 获取所有 array 类型的字段
const arrayFields = computed(() => {
  if (!props.schema?.properties) return {}
  const arrays: Record<string, Field> = {}
  for (const [key, field] of Object.entries(props.schema.properties)) {
    if (field.type === 'array') arrays[key] = field
  }
  return arrays
})
// 获取数组数据
function getArrayData(fieldName: string): DataObject[] {
  return (props.data as any)[fieldName] || []
}
// 判断字段是否可见
function isFieldVisible(field?: Field): boolean {
  if (!field) return false
  return field.visible !== false
}
// 获取可见属性数量
function getVisibleCount(itemSchema?: Field): number {
  if (!itemSchema?.properties) return 0
  return Object.entries(itemSchema.properties).filter(
    ([_, field]) => isFieldVisible(field)
  ).length
}
// 处理点击
function handleItemClick(url: string) {
  router.push(url)
}
</script>
<style scoped>
.object-list { padding: 24px; }
.array-section { margin-bottom: 24px; }
.array-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 16px; }
</style>
