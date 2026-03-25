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
  background: var(--bg-color-secondary);
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.stats-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
}

/* 移动端优化 */
@media (max-width: 576px) {
  .section-stats {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .stat-number {
    font-size: 32px;
  }

  .stat-label {
    font-size: var(--font-size-xs);
  }
}
</style>
