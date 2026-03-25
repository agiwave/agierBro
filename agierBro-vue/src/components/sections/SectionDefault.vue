<template>
  <section class="section section-default">
    <div class="default-content">
      <pre>{{ data }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DataObject } from '@/types'

defineProps<{
  data: DataObject
}>()
</script>

<style scoped>
.section-default {
  padding: 40px 24px;
  background: #f5f5f5;
}

.default-content {
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
}

.default-content pre {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  border: 1px solid #e8e8e8;
}
</style>
