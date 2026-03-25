<template>
  <section class="section section-list">
    <div class="list-wrapper">
      <div v-if="data.icon" class="list-icon">{{ data.icon }}</div>
      <h2 v-if="data.title" class="list-title">{{ data.title }}</h2>
      <p v-if="data.subtitle" class="list-subtitle">{{ data.subtitle }}</p>

      <!-- 列表内容 -->
      <div v-if="data.items" class="list-items">
        <!-- 卡片式列表 -->
        <div
          v-for="(item, index) in data.items"
          :key="item.id || index"
          :class="['list-item', item.clickable !== false ? 'clickable' : '']"
          @click="handleItemClick(item)"
        >
          <!-- 左侧图标/图片 -->
          <div v-if="item.icon || item.image" class="item-media">
            <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
            <img v-if="item.image" :src="item.image" :alt="item.title || ''" />
          </div>

          <!-- 内容区域 -->
          <div class="item-content">
            <h3 v-if="item.title" class="item-title">{{ item.title }}</h3>
            <p v-if="item.description" class="item-description">{{ item.description }}</p>

            <!-- 元数据 -->
            <div v-if="item.meta" class="item-meta">
              <span
                v-for="(itemMeta, metaIndex) in Object.entries(item.meta || {})"
                :key="metaIndex"
                :class="['item-meta-item', getMetaClass(itemMeta[0])]"
              >
                <span class="meta-label">{{ formatMetaLabel(itemMeta[0]) }}:</span>
                <span class="meta-value">{{ formatMetaValue(itemMeta[1], itemMeta[0]) }}</span>
              </span>
            </div>

            <!-- 标签 -->
            <div v-if="item.tags" class="item-tags">
              <span
                v-for="(tag, tagIndex) in item.tags"
                :key="tagIndex"
                :class="['item-tag', tag.color || 'default']"
              >
                {{ tag.label || tag }}
              </span>
            </div>
          </div>

          <!-- 右侧操作/箭头 -->
          <div class="item-action">
            <span v-if="item.actionText" class="action-text">{{ item.actionText }}</span>
            <span v-else-if="item.clickable !== false" class="arrow-icon">›</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="data.emptyText" class="list-empty">
        <span class="empty-icon">{{ data.emptyIcon || '📭' }}</span>
        <p>{{ data.emptyText }}</p>
      </div>

      <!-- 加载更多 -->
      <div v-if="data.hasMore" class="list-more">
        <button class="btn-load-more" @click="handleLoadMore">
          {{ data.loadMoreText || '加载更多' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DataObject } from '@/types'

const emit = defineEmits<{
  itemClick: [item: DataObject]
  loadMore: []
}>()

const props = defineProps<{
  data: DataObject
}>()

function handleItemClick(item: DataObject) {
  if (item.clickable !== false) {
    emit('itemClick', item)
  }
}

function handleLoadMore() {
  emit('loadMore')
}

function getMetaClass(key: string): string {
  const dateKeys = ['date', 'time', 'createdAt', 'updatedAt', 'publishedAt']
  const statusKeys = ['status', 'state']
  const amountKeys = ['amount', 'price', 'cost']

  if (dateKeys.includes(key)) return 'meta-date'
  if (statusKeys.includes(key)) return 'meta-status'
  if (amountKeys.includes(key)) return 'meta-amount'
  return ''
}

function formatMetaLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatMetaValue(value: any, key: string): string {
  if (value == null) return ''

  // 日期格式化
  const dateKeys = ['date', 'time', 'createdAt', 'updatedAt', 'publishedAt']
  if (dateKeys.includes(key)) {
    try {
      return new Date(value).toLocaleDateString('zh-CN')
    } catch {
      return String(value)
    }
  }

  // 金额格式化
  const amountKeys = ['amount', 'price', 'cost']
  if (amountKeys.includes(key) && typeof value === 'number') {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // 状态格式化
  if (key === 'status' && typeof value === 'object') {
    return value.label || String(value)
  }

  return String(value)
}
</script>

<style scoped>
.section-list {
  padding: 60px 24px;
  background: #fafafa;
}

.list-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.list-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 12px;
}

.list-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
  text-align: center;
}

.list-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 40px;
  text-align: center;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.list-item.clickable {
  cursor: pointer;
}

.list-item.clickable:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.item-media {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.item-icon {
  font-size: 24px;
}

.item-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
}

.item-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
}

.meta-label {
  opacity: 0.8;
}

.meta-date {
  color: #666;
}

.meta-status {
  font-weight: 500;
}

.meta-amount {
  color: #fa541c;
  font-weight: 600;
}

.item-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.item-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: #f5f5f5;
  color: #666;
}

.item-tag.default {
  background: #f5f5f5;
  color: #666;
}

.item-tag.primary {
  background: #e6f7ff;
  color: #1890ff;
}

.item-tag.success {
  background: #f6ffed;
  color: #52c41a;
}

.item-tag.warning {
  background: #fffbe6;
  color: #faad14;
}

.item-tag.error {
  background: #fff2f0;
  color: #ff4d4f;
}

.item-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.arrow-icon {
  font-size: 24px;
  color: #ccc;
  transition: transform 0.3s;
}

.list-item.clickable:hover .arrow-icon {
  transform: translateX(4px);
  color: #1890ff;
}

.action-text {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.list-empty {
  text-align: center;
  padding: 60px 24px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.list-more {
  text-align: center;
  margin-top: 32px;
}

.btn-load-more {
  padding: 12px 32px;
  background: #fff;
  color: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-load-more:hover {
  background: #1890ff;
  color: #fff;
}

@media (max-width: 768px) {
  .section-list {
    padding: 40px 16px;
  }

  .list-item {
    padding: 16px;
  }

  .item-media {
    width: 40px;
    height: 40px;
  }

  .item-title {
    font-size: 15px;
  }

  .item-description {
    font-size: 13px;
  }
}
</style>
