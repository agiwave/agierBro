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
  padding: 80px 24px;
  background: #fff;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #f5f5f7;
  border-radius: 18px;
  padding: 32px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px;
}

.feature-description {
  font-size: 15px;
  color: #86868b;
  line-height: 1.6;
  margin: 0 0 20px;
}

.feature-link {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.feature-link:hover {
  text-decoration: underline;
}
</style>
