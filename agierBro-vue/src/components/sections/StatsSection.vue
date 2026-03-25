<template>
  <section class="section section-stats">
    <div class="stats-grid">
      <div v-for="(item, index) in data.items" :key="index" class="stat-item">
        <div class="stat-number">{{ item.number }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
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
.section-stats {
  background: #f5f5f7;
  padding: 60px 24px;
}

.stats-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #86868b;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
</style>
