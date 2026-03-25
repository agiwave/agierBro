<template>
  <section class="section section-cta">
    <div class="cta-content">
      <h2 v-if="data.title" class="cta-title">{{ data.title }}</h2>
      <p v-if="data.description" class="cta-description">{{ data.description }}</p>
      <div v-if="data.actions" class="cta-actions">
        <a
          v-for="(action, index) in data.actions"
          :key="index"
          :href="action.url"
          :class="['cta-action', action.variant || 'primary']"
        >
          {{ action.title }}
        </a>
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
.section-cta {
  background: linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%);
  color: #fff;
  padding: 80px 24px;
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px;
}

.cta-description {
  font-size: 18px;
  color: #e8e8e8;
  margin: 0 0 40px;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-action {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.cta-action.primary {
  background: #0071e3;
  color: #fff;
}

.cta-action.primary:hover {
  background: #0077ed;
}

.cta-action.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cta-action.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
