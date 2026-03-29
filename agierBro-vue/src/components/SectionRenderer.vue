<template>
  <!-- v6.2: 简化语义类型映射 -->
  <!-- container: nav, tree, tabs -->
  <NavSection v-if="semanticGroup === 'container'" :data="data" :variant="(semanticType as any)" />
  
  <!-- content: hero, stats, features, content, cta, footer -->
  <ContentSection 
    v-else-if="semanticGroup === 'content'" 
    :data="data" 
    :variant="(semanticType as any)" 
  />
  
  <!-- list: list -->
  <ListSection v-else-if="semanticGroup === 'list'" :data="data" @itemClick="handleItemClick" @loadMore="handleLoadMore" />
  
  <!-- 默认：通用区块渲染 -->
  <SectionBlock v-else :data="data" :schema="dataSchema" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataObject, Schema, SemanticType } from '@/types'
import NavSection from './sections/NavSection.vue'
import ContentSection from './sections/ContentSection.vue'
import ListSection from './sections/ListSection.vue'
import SectionBlock from './sections/SectionBlock.vue'

const props = defineProps<{
  data: DataObject
}>()

const emit = defineEmits<{
  itemClick: [item: DataObject]
  loadMore: []
}>()

// v6.2: 从 _schema.out 获取语义类型
const semanticType = computed<SemanticType | undefined>(() => {
  const schema = props.data._schema
  if (!schema || typeof schema !== 'object') return undefined
  
  const out = schema.out
  if (out && typeof out === 'object') {
    return (out as Schema).semantic
  }
  return undefined
})

// v6.2: 语义类型分组（简化为 3 组）
const semanticGroup = computed<'container' | 'content' | 'list' | null>(() => {
  const type = semanticType.value
  if (!type) return null
  
  // container 组：导航类
  if (['nav', 'tree', 'tabs'].includes(type)) return 'container'
  
  // content 组：内容类
  if (['hero', 'stats', 'features', 'content', 'cta', 'footer'].includes(type)) return 'content'
  
  // list 组：列表类
  if (type === 'list') return 'list'
  
  return null
})

// v6.0: 从 _schema.out 获取数据的 Schema
const dataSchema = computed<Schema | undefined>(() => {
  const schema = props.data._schema
  if (!schema || typeof schema !== 'object') return undefined
  
  const out = schema.out
  if (out && typeof out === 'object' && (out as Schema).type === 'object') {
    return out as Schema
  }
  return undefined
})

function handleItemClick(item: DataObject) {
  emit('itemClick', item)
}

function handleLoadMore() {
  emit('loadMore')
}
</script>
