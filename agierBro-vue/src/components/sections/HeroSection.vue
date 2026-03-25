<template>
  <section class="section section-hero">
    <div class="hero-content">
      <div v-if="data.icon" class="hero-icon">{{ data.icon }}</div>
      <h1 v-if="data.title" class="hero-title">{{ data.title }}</h1>
      <h2 v-if="data.subtitle" class="hero-subtitle">{{ data.subtitle }}</h2>
      <p v-if="data.description" class="hero-description">{{ data.description }}</p>
      <div v-if="data.actions" class="hero-actions">
        <a
          v-for="(action, index) in data.actions"
          :key="index"
          :href="action.url"
          :class="['hero-action', action.variant || 'primary']"
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
.section-hero {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
  padding: 60px 24px;
}

.hero-content {
  max-width: 800px;
}

.hero-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 24px;
  opacity: 0.95;
}

.hero-description {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-action {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.hero-action.primary {
  background: #fff;
  color: #667eea;
}

.hero-action.primary:hover {
  background: #f5f5f5;
}

.hero-action.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.hero-action.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  .hero-subtitle {
    font-size: 20px;
  }
}
</style>
