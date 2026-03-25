<template>
  <div class="tabs-layout">
    <!-- 标签头 -->
    <div class="tabs-header">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab', { active: activeIndex === index }]"
        @click="selectTab(index)"
      >
        {{ tab.title }}
      </div>
    </div>

    <!-- 内容区 -->
    <div class="tabs-content">
      <!-- 列表数据（包含 items）→ 使用 ObjectList 渲染 -->
      <ObjectList
        v-if="contentData?.items"
        :schema="contentData._schema || {}"
        :data="contentData"
      />
      <!-- 对象数据 -->
      <div v-else-if="contentData" class="data-view">
        <h3 v-if="contentData.title">{{ contentData.title }}</h3>
        <pre>{{ JSON.stringify(contentData, null, 2) }}</pre>
      </div>
      <!-- 默认提示 -->
      <div v-else class="empty-view">
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataObject } from '@/types'
import ObjectList from './ObjectList.vue'
const props = defineProps<{ data: DataObject | null }>()
const activeIndex = ref(0)
const contentData = ref<Record<string, any> | null>(null)
const tabs = computed(() => props.data?.tabs || [])
async function selectTab(index: number) {
  console.log('Select tab:', index)
  activeIndex.value = index
  const tab = tabs.value[index]
  console.log('Tab content:', tab.content)
  // content 是字符串（URL）→ fetch 数据
  if (typeof tab.content === 'string') {
    // 确保 URL 以 /api/ 开头
    let url = tab.content
    if (!url.startsWith('/api/')) {
      url = '/api' + (url.startsWith('/') ? url : '/' + url)
    }
    url = url.replace('.json', '')
    console.log('Fetch URL:', url + '.json')
    try {
      const response = await fetch(url + '.json')
      console.log('Response status:', response.status)
      if (response.ok) {
        contentData.value = await response.json()
        console.log('Content data:', contentData.value)
      }
    } catch (e) {
      console.error('Load tab content error:', e)
    }
  }
  // content 是对象 → 显示数据
  else if (tab.content) {
    contentData.value = tab.content
  }
}
// 初始化：选择第一个 tab
if (tabs.value.length > 0) {
  selectTab(0)
}
</script>
<style scoped>
.tabs-layout {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}
.tabs-header {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}
.tab {
  padding: 16px 24px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.tab:hover {
  color: #1890ff;
  background: #f5f5f5;
}
.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: 500;
}
.tabs-content {
  padding: 24px;
  min-height: 400px;
}
.data-view h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #333;
}
.data-view pre {
  margin: 0;
  font-size: 12px;
  color: #666;
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
}
.empty-view {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  min-height: 400px;
}
.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.list-item {
  background: #fafafa;
  border-radius: 4px;
  padding: 16px;
}
.list-item pre {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
