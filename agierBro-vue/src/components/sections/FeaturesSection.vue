<template>
  <section class="section section-features">
    <div class="section-header" v-if="data.title">
      <h2 class="section-title">{{ data.title }}</h2>
    </div>
    <div class="features-grid">
      <div v-for="(item, index) in data.items" :key="index" class="feature-card">
        <div class="feature-icon">{{ item.icon }}</div>
        <h3 class="feature-title">{{ item.title }}</h3>
        <p class="feature-description">{{ item.description }}</p>
        <a v-if="item.link" :href="item.link" class="feature-link">了解更多 →</a>
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
.section-features {
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--bg-color-elevated);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.feature-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 var(--spacing-sm);
}

.feature-description {
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-md);
}

.feature-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.feature-link:hover {
  text-decoration: underline;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .section-features {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .section-header {
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    font-size: var(--font-size-xl);
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .feature-card {
    padding: var(--spacing-md);
  }

  .feature-icon {
    font-size: 40px;
  }

  .feature-title {
    font-size: var(--font-size-md);
  }

  .feature-description {
    font-size: var(--font-size-xs);
  }
}
</style>
