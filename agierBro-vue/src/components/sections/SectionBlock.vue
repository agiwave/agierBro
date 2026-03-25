<template>
  <section class="section section-block">
    <div class="block-content">
      <SchemaRenderer v-if="schema" :schema="schema" :data="data" mode="view" />
      <div v-else class="block-content">
        <pre>{{ data }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DataObject, Schema } from '@/types'
import SchemaRenderer from '@/components/SchemaRenderer.vue'

defineProps<{
  data: DataObject
  schema?: Schema
}>()
</script>

<style scoped>
.section-block {
  padding: 60px 24px;
  width: 100%;
}

.section-block:nth-child(odd) {
  background: #fafafa;
}

.section-block:nth-child(even) {
  background: #fff;
}

.block-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
