<template>
  <div class="entry-page">
    <Toast v-model="toast.visible" :message="toast.message" level="info" :duration="3000" />
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadData">重试</button>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!data" class="empty-state">
      <div class="empty-icon">📭</div>
      <h2>暂无数据</h2>
      <p>API: {{ apiUrl }}</p>
    </div>
    
    <!-- 数据加载成功 -->
    <div v-else class="content-wrapper">
      <!-- 后台首页：有 menu 字段的对象 -->
      <DashboardLayout
        v-if="isDashboard"
        :data="data"
      />

      <!-- Section 列表：items 数组且每个元素都有独立的 _schema -->
      <SectionList
        v-else-if="isSectionList"
        :items="(data.items || []) as DataObject[]"
      />

      <!-- 列表数据：使用统一 ListRenderer -->
      <ListRenderer
        v-else-if="isItemList"
        :schema="schema"
        :data="data as DataObject"
        @itemClick="handleItemClick"
      />

      <!-- 详情/表单数据：使用统一 SchemaRenderer -->
      <SchemaRenderer
        v-else-if="data && schema"
        :schema="schema"
        :data="data"
        :mode="mode"
        @submit="handleSubmit"
        @toolExecuted="handleToolExecuted"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Schema, DataObject, Tool, ToolResponse } from '@/types'
import { extractSchema } from '@/services/api'
import { getUrlApiMapping } from '@/router'
import ListRenderer from '@/components/ListRenderer.vue'
import SchemaRenderer from '@/components/SchemaRenderer.vue'
import SectionList from '@/components/SectionList.vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import ToolButtons from '@/components/ToolButtons.vue'
import Toast from '@/components/Toast.vue'
import NavLayout from '@/components/NavLayout.vue'
import TreeLayout from '@/components/TreeLayout.vue'
import TabsLayout from '@/components/TabsLayout.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const apiUrl = ref('')
const schema = ref<Schema | null>(null)
const data = ref<DataObject | null>(null)
const formData = ref<DataObject>({})
const toast = ref({ visible: false, message: '', level: 'info' })
const mode = ref<'view' | 'edit'>('view')

// 后台首页识别：有 menu 字段的对象（如 /editor, /reviewer）
const isDashboard = computed(() => {
  return data.value?.menu && Array.isArray(data.value.menu)
})

// Section 列表识别：items 数组且每个元素都有独立的 _schema（用于页面区块）
const isSectionList = computed(() => {
  const items = data.value?.items
  if (!items || items.length === 0) return false
  // 所有元素都有 _schema 字段，说明是 Section 列表
  return items.every((item: any) => item._schema)
})

// 普通列表识别：items 数组但元素没有独立 _schema（用于数据列表）
const isItemList = computed(() => {
  const items = data.value?.items
  if (!items || items.length === 0) return false
  // 元素没有 _schema 字段，说明是普通数据列表
  return !items.every((item: any) => item._schema)
})

const tools = computed<Tool[]>(() => {
  const s = schema.value as any
  return s?.tools || []
})

function computeApiUrl(): string {
  return getUrlApiMapping(route.path)
}

async function loadData() {
  loading.value = true
  error.value = ''
  data.value = null
  schema.value = null
  mode.value = 'view'

  try {
    apiUrl.value = computeApiUrl()
    const result = await fetchPageDataByUrl(apiUrl.value)
    data.value = result
    schema.value = extractSchema(result)
    formData.value = { ...result }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
}

async function fetchPageDataByUrl(url: string): Promise<DataObject> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`)
  return response.json()
}

async function handleToolExecuted(result: ToolResponse) {
  console.log('Tool executed:', result)
  
  // 处理 actions
  if (result.actions) {
    for (const action of result.actions) {
      if (action.type === 'navigate' && action.target) {
        router.push(action.target)
      } else if (action.type === 'reload') {
        await loadData()
      } else if (action.type === 'back') {
        router.back()
      } else if (action.type === 'message') {
        toast.value = {
          visible: true,
          message: action.message || '',
          level: action.level || 'info'
        }
      }
    }
  }
  
  // 向后兼容：处理旧字段
  if (result.navigateTo) router.push(result.navigateTo)
  if (result.reload) await loadData()
  if (result.message && !result.actions) {
    toast.value = {
      visible: true,
      message: result.message,
      level: result.success ? 'success' : 'error'
    }
  }
}

async function handleSubmit() {
  console.log('Submit:', formData.value)
  toast.value = { visible: true, message: '保存成功', level: 'success' }
}

function handleItemClick(url: string) {
  router.push(url)
}

onMounted(loadData)
watch(() => route.fullPath, loadData)
</script>
<style scoped>
.entry-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
  text-align: center;
  padding: var(--spacing-lg);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8e8e8;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 48px;
}

.error-state h2, .empty-state h2 {
  color: var(--text-color);
  margin: 0;
}

.error-state p, .empty-state p {
  color: var(--text-color-secondary);
  max-width: 600px;
}

.btn-retry {
  padding: 12px 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.2s;
  min-height: 44px;
}

.btn-retry:hover {
  background: var(--primary-hover);
}

.content-wrapper {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .entry-page {
    padding: var(--spacing-xs);
  }

  .loading-state, .error-state, .empty-state {
    padding: var(--spacing-md);
  }

  .spinner {
    width: 32px;
    height: 32px;
  }

  .error-icon, .empty-icon {
    font-size: 36px;
  }

  .error-state h2, .empty-state h2 {
    font-size: var(--font-size-lg);
  }

  .error-state p, .empty-state p {
    font-size: var(--font-size-sm);
  }

  .content-wrapper {
    padding: var(--spacing-xs);
  }
}
</style>
