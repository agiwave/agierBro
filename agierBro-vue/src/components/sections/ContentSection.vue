<template>
  <section class="section section-content">
    <div class="content-wrapper">
      <div v-if="data.icon" class="content-icon">{{ data.icon }}</div>
      <h2 v-if="data.title" class="content-title">{{ data.title }}</h2>
      <p v-if="data.subtitle" class="content-subtitle">{{ data.subtitle }}</p>

      <!-- 内容主体：支持 HTML 或纯文本 -->
      <div v-if="data.html" class="content-body html-content" v-html="data.html"></div>
      <div v-else-if="data.content" class="content-body text-content">
        <template v-if="Array.isArray(data.content)">
          <p v-for="(paragraph, index) in data.content" :key="index">{{ paragraph }}</p>
        </template>
        <template v-else>
          <p>{{ data.content }}</p>
        </template>
      </div>

      <!-- 可选的媒体区域 -->
      <div v-if="data.media" class="content-media">
        <img v-if="data.media.type === 'image'" :src="data.media.url" :alt="data.media.alt" />
        <video v-else-if="data.media.type === 'video'" :src="data.media.url" controls></video>
        <iframe v-else-if="data.media.type === 'embed'" :src="data.media.url" frameborder="0" allowfullscreen></iframe>
      </div>

      <!-- 可选的操作按钮 -->
      <div v-if="data.actions" class="content-actions">
        <a
          v-for="(action, index) in data.actions"
          :key="index"
          :href="action.url"
          :class="['content-action', action.variant || 'primary']"
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
.section-content {
  padding: 60px 24px;
  background: #fff;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.content-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.content-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px;
}

.content-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0 0 32px;
}

.content-body {
  margin-bottom: 32px;
}

.html-content {
  text-align: left;
  line-height: 1.8;
  color: #444;
}

.html-content :deep(h1),
.html-content :deep(h2),
.html-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  color: #222;
}

.html-content :deep(p) {
  margin-bottom: 16px;
}

.html-content :deep(ul),
.html-content :deep(ol) {
  margin-left: 24px;
  margin-bottom: 16px;
}

.text-content {
  text-align: left;
  line-height: 1.8;
  color: #444;
  font-size: 16px;
}

.text-content p {
  margin-bottom: 16px;
}

.content-media {
  margin: 32px 0;
  border-radius: 12px;
  overflow: hidden;
}

.content-media img,
.content-media video,
.content-media iframe {
  width: 100%;
  height: auto;
  display: block;
}

.content-media iframe {
  aspect-ratio: 16 / 9;
}

.content-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.content-action {
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.content-action.primary {
  background: #1890ff;
  color: #fff;
}

.content-action.primary:hover {
  background: #40a9ff;
}

.content-action.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #d9d9d9;
}

.content-action.secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

@media (max-width: 768px) {
  .section-content {
    padding: 40px 16px;
  }

  .content-title {
    font-size: 24px;
  }

  .content-subtitle {
    font-size: 16px;
  }
}
</style>
