<template>
  <div class="entry-page">
    <GlobalToast />

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
    <div v-else-if="!pageData" class="empty-state">
      <div class="empty-icon">📭</div>
      <h2>暂无数据</h2>
      <p>API: {{ apiUrl }}</p>
    </div>

    <!-- 数据加载成功 - v6.2: 简化渲染逻辑 -->
    <div v-else class="content-wrapper">
      <!-- 统一使用 SectionRenderer -->
      <SectionRenderer 
        v-if="pageData" 
        :data="pageData" 
        @itemClick="handleItemClick"
      />
      
      <!-- Tools 操作按钮（如果有） -->
      <div v-if="tools.length" class="tool-section">
        <ToolButtons :tools="tools" :currentData="pageData" @executed="handleToolExecuted" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Schema, DataObject, Tool, ToolResponse, PageDescriptor } from '@/types'
import { extractOutSchema, extractInSchema, fetchPageData, needsInput, executeTool } from '@/services/api'
import { getUrlApiMapping } from '@/router'
import { useAppStore } from '@/stores/app'
import SectionRenderer from '@/components/SectionRenderer.vue'
import ToolButtons from '@/components/ToolButtons.vue'
import GlobalToast from '@/components/GlobalToast.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const loading = ref(true)
const error = ref('')
const apiUrl = ref('')
const outSchema = ref<Schema | null>(null)
const inSchema = ref<Schema | null>(null)
const pageData = ref<PageDescriptor | null>(null)
const formData = ref<DataObject>({})
const mode = ref<'view' | 'edit'>('view')

// v6.2: 简化 - 移除多层判断，统一使用 SectionRenderer

// 当前使用的 Schema
const currentSchema = computed<Schema | null>(() => {
  if (mode.value === 'edit') {
    return inSchema.value
  }
  return outSchema.value
})

// 展示的数据
const displayData = computed<DataObject>(() => {
  if (mode.value === 'edit') {
    return formData.value
  }
  return pageData.value as DataObject
})

// 获取 tools
const tools = computed<Tool[]>(() => {
  const pageTools = pageData.value?._tools
  if (!pageTools) return []
  // v6.0: _tools 是 ToolDescriptor 数组，需要转换
  return pageTools as unknown as Tool[]
})

function computeApiUrl(): string {
  return getUrlApiMapping(route.path)
}

/**
 * 加载数据 - v6.2: 简化逻辑
 */
async function loadData() {
  loading.value = true
  error.value = ''
  pageData.value = null
  outSchema.value = null
  inSchema.value = null
  mode.value = 'view'
  formData.value = {}

  try {
    apiUrl.value = computeApiUrl()
    const apiPath = route.path === '/' ? 'index' : route.path.replace(/^\//, '')
    
    const result = await fetchPageData(apiPath)
    pageData.value = result
    outSchema.value = extractOutSchema(result)
    inSchema.value = extractInSchema(result)
    
    // 判断是否需要输入
    if (needsInput(result)) {
      mode.value = 'edit'
      if (inSchema.value?.properties) {
        Object.keys(inSchema.value.properties).forEach(key => {
          const prop = inSchema.value!.properties[key]
          formData.value[key] = prop.default !== undefined ? prop.default : ''
        })
      }
    } else {
      mode.value = 'view'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
}

async function handleToolExecuted(result: ToolResponse) {
  if (result.actions) {
    for (const action of result.actions) {
      if (action.type === 'navigate' && action.target) {
        router.push(action.target)
      } else if (action.type === 'reload') {
        await loadData()
      } else if (action.type === 'back') {
        router.back()
      } else if (action.type === 'message') {
        appStore.showToast(action.message || '', action.level || 'info')
      }
    }
  }
  if (result.navigateTo) router.push(result.navigateTo)
  if (result.reload) await loadData()
  if (result.message && !result.actions) {
    appStore.showToast(result.message, result.success ? 'success' : 'error')
  }
}

async function handleSubmit() {
  if (pageData.value) {
    const result = await executeTool({
      _schema: pageData.value._schema,
      protocol: 'http',
      method: 'POST',
      url: apiUrl.value
    } as any, formData.value)
    await handleToolExecuted(result)
  } else {
    appStore.showSuccess('保存成功')
  }
}

function handleItemClick(item: DataObject) {
  // 从 item 中获取 url
  const url = (item as any).url || (item as any).target
  if (url) {
    router.push(url)
  }
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

.tool-section {
  margin-top: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
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
