<template>
  <div class="dashboard-layout">
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ data?.title || '后台管理' }}</h1>
      <p v-if="data?.description" class="dashboard-description">{{ data.description }}</p>
    </div>

    <!-- 统计卡片 -->
    <div v-if="hasStats" class="stats-grid">
      <div v-for="(value, key) in statsData" :key="key" class="stat-card">
        <div class="stat-value">{{ formatValue(value) }}</div>
        <div class="stat-label">{{ formatLabel(key) }}</div>
      </div>
    </div>

    <!-- 菜单网格 -->
    <div v-if="hasMenu" class="menu-grid">
      <a
        v-for="(item, index) in menuItems"
        :key="index"
        :href="item.url"
        class="menu-card"
        @click.prevent="handleClick(item)"
      >
        <div v-if="item.icon" class="menu-icon">{{ item.icon }}</div>
        <div class="menu-content">
          <h3 class="menu-title">{{ item.title }}</h3>
          <p v-if="item.description" class="menu-description">{{ item.description }}</p>
        </div>
        <div class="menu-arrow">→</div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DataObject } from '@/types'

const props = defineProps<{
  data: DataObject
}>()

const router = useRouter()

// 检查是否有统计数据
const hasStats = computed(() => {
  const statsKeys = ['my_stats', 'quick_stats', 'stats']
  return statsKeys.some(key => props.data?.[key])
})

// 获取统计数据
const statsData = computed(() => {
  const statsKeys = ['my_stats', 'quick_stats', 'stats']
  for (const key of statsKeys) {
    if (props.data?.[key]) return props.data[key]
  }
  return {}
})

// 检查是否有菜单
const hasMenu = computed(() => {
  return props.data?.menu && Array.isArray(props.data.menu)
})

// 获取菜单项
const menuItems = computed(() => {
  return props.data?.menu || []
})

// 格式化标签
function formatLabel(key: string | number): string {
  return String(key)
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// 格式化值
function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value)
}

// 处理菜单点击
function handleClick(item: any) {
  if (item.url) {
    router.push(item.url)
  }
}
</script>

<style scoped>
.dashboard-layout {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px;
}

.dashboard-description {
  font-size: 16px;
  color: #86868b;
  margin: 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #0071e3;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #86868b;
}

/* 菜单网格 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.menu-icon {
  font-size: 36px;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px;
}

.menu-description {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.menu-arrow {
  font-size: 20px;
  color: #0071e3;
}
</style>
