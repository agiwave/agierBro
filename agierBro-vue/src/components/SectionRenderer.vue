<template>
  <!-- 根据语义类型选择渲染组件（所有语义类型平级） -->
  <SectionNav v-if="semanticType === 'nav'" :data="data" />
  <TreeLayout v-else-if="semanticType === 'tree'" :data="data" />
  <TabsLayout v-else-if="semanticType === 'tabs'" :data="data" />

  <HeroSection v-else-if="semanticType === 'hero'" :data="data" />
  <StatsSection v-else-if="semanticType === 'stats'" :data="data" />
  <FeaturesSection v-else-if="semanticType === 'features'" :data="data" />
  <CtaSection v-else-if="semanticType === 'cta'" :data="data" />
  <FooterSection v-else-if="semanticType === 'footer'" :data="data" />
  <ContentSection v-else-if="semanticType === 'content'" :data="data" @itemClick="handleItemClick" />
  <ListSection v-else-if="semanticType === 'list'" :data="data" @itemClick="handleItemClick" @loadMore="handleLoadMore" />

  <!-- 默认：通用区块渲染 -->
  <SectionBlock v-else :data="data" :schema="dataSchema" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataObject, Schema, SemanticType } from '@/types'
import SectionNav from './sections/SectionNav.vue'
import TreeLayout from '@/components/TreeLayout.vue'
import TabsLayout from '@/components/TabsLayout.vue'
import HeroSection from './sections/HeroSection.vue'
import StatsSection from './sections/StatsSection.vue'
import FeaturesSection from './sections/FeaturesSection.vue'
import CtaSection from './sections/CtaSection.vue'
import FooterSection from './sections/FooterSection.vue'
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

// v6.0: 从 _schema.out 获取语义类型
const semanticType = computed<SemanticType | undefined>(() => {
  const schema = props.data._schema
  if (!schema || typeof schema !== 'object') return undefined
  
  // v6.0 格式：_schema: { in: {...}, out: { semantic: 'nav', ... } }
  const out = schema.out
  if (out && typeof out === 'object') {
    return (out as Schema).semantic
  }
  return undefined
})

// v6.0: 从 _schema.out 获取数据的 Schema
const dataSchema = computed<Schema | undefined>(() => {
  const schema = props.data._schema
  if (!schema || typeof schema !== 'object') return undefined
  
  // v6.0 格式：_schema: { in: {...}, out: { type: 'object', ... } }
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
