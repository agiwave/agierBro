<template>
  <div class="section-list">
    <div v-for="(item, index) in items" :key="index" class="section-item">
      <SectionRenderer :data="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DataObject } from '@/types'
import SectionRenderer from './SectionRenderer.vue'

defineProps<{
  items: DataObject[]
}>()
</script>

<style scoped>
.section-list {
  min-height: 100vh;
}

.section-item {
  width: 100%;
}
</style>
