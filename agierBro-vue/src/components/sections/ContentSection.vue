<template>
  <section :class="['section', `section-${variant}`]">
    <!-- 头部区域 -->
    <div v-if="showHeader" class="section-header">
      <div v-if="data.icon" class="section-icon">{{ data.icon }}</div>
      <h1 v-if="data.title && isHero" class="section-title-hero">{{ data.title }}</h1>
      <h2 v-else-if="data.title" class="section-title">{{ data.title }}</h2>
      <p v-if="data.subtitle" class="section-subtitle">{{ data.subtitle }}</p>
      <p v-if="data.description" class="section-description">{{ data.description }}</p>
      <div v-if="data.html" v-html="data.html" class="section-html"></div>
      <div v-if="data.media" class="section-media">
        <img v-if="data.media.type === 'image'" :src="data.media.url" :alt="data.media.alt" />
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="data.content" class="section-content">
      <p v-for="(para, index) in getContentArray(data.content)" :key="index">{{ para }}</p>
    </div>

    <!-- 网格项目（stats/features） -->
    <div v-if="data.items" :class="gridClass">
      <div v-for="(item, index) in data.items" :key="index" :class="itemClass">
        <div v-if="item.number" class="stat-number">{{ item.number }}</div>
        <div v-if="item.label" class="stat-label">{{ item.label }}</div>
        <div v-if="item.icon" class="feature-icon">{{ item.icon }}</div>
        <h3 v-if="item.title" class="feature-title">{{ item.title }}</h3>
        <p v-if="item.description" class="feature-description">{{ item.description }}</p>
        <a v-if="item.link" :href="item.link" class="feature-link">了解更多 →</a>
      </div>
    </div>

    <!-- 行动按钮 -->
    <div v-if="data.actions" class="section-actions">
      <a
        v-for="(action, index) in data.actions"
        :key="index"
        :href="action.url"
        :class="['section-action', action.variant || 'primary']"
      >
        {{ action.title }}
      </a>
    </div>

    <!-- 页脚文本 -->
    <div v-if="data.text" class="section-text">{{ data.text }}</div>

    <!-- 链接列表 -->
    <div v-if="data.links" class="section-links">
      <a v-for="(link, index) in data.links" :key="index" :href="link.url" class="section-link">
        {{ link.title }}
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataObject } from '@/types'

const props = defineProps<{
  data: DataObject
  variant?: 'hero' | 'stats' | 'features' | 'content' | 'cta' | 'footer' | 'default'
}>()

const isHero = computed(() => props.variant === 'hero')

const showHeader = computed(() => {
  return props.data.icon || props.data.title || props.data.subtitle || 
         props.data.description || props.data.html || props.data.media
})

const gridClass = computed(() => {
  if (props.variant === 'stats') return 'section-grid stats-grid'
  if (props.variant === 'features') return 'section-grid features-grid'
  return 'section-grid'
})

const itemClass = computed(() => {
  if (props.variant === 'stats') return 'stat-item'
  if (props.variant === 'features') return 'feature-card'
  return 'grid-item'
})

function getContentArray(content: any): string[] {
  if (Array.isArray(content)) return content
  if (typeof content === 'string') return [content]
  return []
}
</script>

<style scoped>
.section {
  width: 100%;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.section-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-lg);
}

.section-title-hero {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 var(--spacing-md);
}

.section-subtitle {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-color-secondary);
  margin: 0 0 var(--spacing-md);
}

.section-description {
  font-size: var(--font-size-lg);
  color: var(--text-color-secondary);
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
}

.section-html {
  text-align: left;
  max-width: 800px;
  margin: var(--spacing-lg) auto;
}

.section-media img {
  max-width: 100%;
  border-radius: var(--border-radius-lg);
  margin-top: var(--spacing-lg);
}

.section-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.section-content p {
  margin-bottom: var(--spacing-md);
  line-height: 1.8;
}

/* 网格布局 */
.section-grid {
  display: grid;
  gap: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  background: var(--bg-color-secondary);
  padding: var(--spacing-2xl) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
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

.features-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  background: var(--bg-color-elevated);
}

.feature-card {
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 40px;
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
}

.feature-link {
  display: inline-block;
  margin-top: var(--spacing-sm);
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

/* 行动按钮 */
.section-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-xl);
}

.section-action {
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
  min-height: 44px;
}

.section-action.primary {
  background: var(--primary-color);
  color: #fff;
}

.section-action.primary:hover {
  background: var(--primary-hover);
}

.section-action.secondary {
  background: var(--bg-color-secondary);
  color: var(--text-color);
}

.section-action.secondary:hover {
  background: var(--border-color);
}

/* 文本和链接 */
.section-text {
  text-align: center;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}

.section-links {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.section-link {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.section-link:hover {
  text-decoration: underline;
}

/* Hero 变体 */
.section-hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
  padding: 80px 24px;
}

.section-hero .section-title-hero,
.section-hero .section-subtitle,
.section-hero .section-description {
  color: #fff;
}

/* Footer 变体 */
.section-footer {
  background: var(--bg-color-secondary);
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .section-title-hero {
    font-size: 32px;
  }

  .section-title {
    font-size: var(--font-size-xl);
  }

  .stats-grid,
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .stat-number {
    font-size: 32px;
  }

  .section-actions {
    flex-direction: column;
    align-items: center;
  }

  .section-action {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
}
</style>
