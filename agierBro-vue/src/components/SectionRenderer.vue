<template>
  <!-- 根据语义类型选择渲染组件（所有语义类型平级） -->
  <NavLayout v-if="semanticType === 'nav'" :data="data" />
  <TreeLayout v-else-if="semanticType === 'tree'" :data="data" />
  <TabsLayout v-else-if="semanticType === 'tabs'" :data="data" />

  <HeroSection v-else-if="semanticType === 'hero'" :data="data" />
  <StatsSection v-else-if="semanticType === 'stats'" :data="data" />
  <FeaturesSection v-else-if="semanticType === 'features'" :data="data" />
  <CtaSection v-else-if="semanticType === 'cta'" :data="data" />
  <FooterSection v-else-if="semanticType === 'footer'" :data="data" />

  <!-- 默认：通用区块渲染 -->
  <SectionBlock v-else :data="data" :schema="dataSchema" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataObject, Schema, SemanticType } from '@/types'
import NavLayout from '@/components/NavLayout.vue'
import TreeLayout from '@/components/TreeLayout.vue'
import TabsLayout from '@/components/TabsLayout.vue'
import HeroSection from './sections/HeroSection.vue'
import StatsSection from './sections/StatsSection.vue'
import FeaturesSection from './sections/FeaturesSection.vue'
import CtaSection from './sections/CtaSection.vue'
import FooterSection from './sections/FooterSection.vue'
import SectionBlock from './sections/SectionBlock.vue'

const props = defineProps<{
  data: DataObject
}>()

// 获取语义类型（统一处理，所有类型平级）
const semanticType = computed<SemanticType | undefined>(() => {
  const schema = props.data._schema
  if (typeof schema === 'string') {
    // 兼容旧格式：_schema: "nav"
    return schema as SemanticType
  }
  if (schema && typeof schema === 'object') {
    // 标准格式：_schema: { type: 'object', semantic: 'nav' }
    return (schema as Schema).semantic
  }
  return undefined
})

// 获取数据的 Schema（用于通用区块渲染）
const dataSchema = computed<Schema | undefined>(() => {
  const schema = props.data._schema
  if (schema && typeof schema === 'object' && schema.type === 'object') {
    return schema as Schema
  }
  return undefined
})
</script>
