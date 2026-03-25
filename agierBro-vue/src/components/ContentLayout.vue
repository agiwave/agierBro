<template>
  <div class="content-layout">
    <div class="content-card">
      <div v-if="data.title" class="content-header">
        <span v-if="data.icon" class="content-icon">{{ data.icon }}</span>
        <h2>{{ data.title }}</h2>
      </div>
      <div class="content-body">
        <!-- 对象数据 -->
        <div v-if="contentData" class="data-view">
          <pre>{{ JSON.stringify(contentData, null, 2) }}</pre>
        </div>
        <!-- 默认提示 -->
        <div v-else class="empty-view">
          <p>加载中...</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DataObject } from '@/types'
const props = defineProps<{ data: DataObject }>()
const contentData = ref<Record<string, any> | null>(null)
onMounted(async () => {
  // content 是字符串（URL）→ fetch 数据
  if (typeof props.data.content === 'string') {
    const url = props.data.content.replace('.json', '')
    try {
      const response = await fetch(url + '.json')
      if (response.ok) {
        contentData.value = await response.json()
      }
    } catch (e) {
      console.error('Load content error:', e)
    }
  }
  // content 是对象 → 显示数据
  else if (props.data.content) {
    contentData.value = props.data.content
  }
})
</script>
<style scoped>
.content-layout {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 24px;
}
.content-card {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}
.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}
.content-icon {
  font-size: 24px;
}
.content-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}
.content-body {
  padding: 24px;
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
  min-height: 300px;
}
</style>
