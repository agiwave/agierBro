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

    <!-- 数据加载成功 -->
    <div v-else class="content-wrapper">
      <!-- 后台首页：有 menu 字段的对象 -->
      <DashboardLayout
        v-if="isDashboard"
        :data="pageData"
      />

      <!-- Section 列表：items 数组且每个元素都有独立的 _schema -->
      <SectionList
        v-else-if="isSectionList"
        :items="(pageData.items || []) as DataObject[]"
      />

      <!-- 列表数据：使用统一 ListRenderer -->
      <ListRenderer
        v-else-if="isItemList"
        :schema="outSchema"
        :data="pageData as DataObject"
        @itemClick="handleItemClick"
        @toolExecuted="handleToolExecuted"
      />

      <!-- 详情/表单数据：使用统一 SchemaRenderer -->
      <SchemaRenderer
        v-else-if="pageData && currentSchema"
        :schema="currentSchema"
        :data="displayData"
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
import type { Schema, DataObject, ToolDescriptor, ToolResponse, PageDescriptor } from '@/types'
import { extractOutSchema, extractInSchema, fetchPageData, needsInput, executeTool } from '@/services/api'
import { getUrlApiMapping } from '@/router'
import { useAppStore } from '@/stores/app'
import ListRenderer from '@/components/ListRenderer.vue'
import SchemaRenderer from '@/components/SchemaRenderer.vue'
import SectionList from '@/components/SectionList.vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
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

// 后台首页识别：有 menu 字段的对象
const isDashboard = computed(() => {
  return pageData.value?.menu && Array.isArray(pageData.value.menu)
})

// Section 列表识别
const isSectionList = computed(() => {
  const items = pageData.value?.items
  if (!items || items.length === 0) return false
  return items.every((item: any) => item._schema)
})

// 普通列表识别
const isItemList = computed(() => {
  const items = pageData.value?.items
  if (!items || items.length === 0) return false
  return !items.every((item: any) => item._schema)
})

// 当前使用的 Schema
// - 如果是数据工具（无输入），使用 outSchema 展示数据
// - 如果是表单工具（有输入），使用 inSchema 呈现表单
const currentSchema = computed<Schema | null>(() => {
  if (mode.value === 'edit') {
    return inSchema.value
  }
  return outSchema.value
})

// 展示的数据
// - 如果是表单模式，展示空数据或默认值（等待用户输入）
// - 如果是数据模式，展示实际数据
const displayData = computed<DataObject>(() => {
  if (mode.value === 'edit') {
    return formData.value
  }
  return pageData.value as DataObject
})

function computeApiUrl(): string {
  return getUrlApiMapping(route.path)
}

/**
 * 加载数据
 *
 * 一切皆工具描述架构：
 * - 每个接口返回的都是工具的描述
 * - in: 输入参数（有值=需要表单，无值=直接展示数据）
 * - out: 输出数据结构
 *
 * 前端判断逻辑：
 * - 有 in 且包含 required 字段 → 呈现表单（edit 模式）
 * - 无 in 或 in 为空 → 展示数据（view 模式）
 *
 * 统一路由规则：
 * - / → /api/index.json
 * - /xxx/yyy/zzz → /api/xxx/yyy/zzz.json
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
    
    // 统一路由规则：直接使用 route.path
    // / → index
    // /users → users
    // /users/001 → users/001
    // /users/001/edit → users/001/edit
    const apiPath = route.path === '/' ? 'index' : route.path.replace(/^\//, '')
    
    const result = await fetchPageData(apiPath)
    pageData.value = result
    outSchema.value = extractOutSchema(result)
    inSchema.value = extractInSchema(result)
    
    // 判断是否需要输入
    if (needsInput(result)) {
      mode.value = 'edit'   // 需要输入，呈现表单
      // 初始化表单数据
      if (inSchema.value?.properties) {
        Object.keys(inSchema.value.properties).forEach(key => {
          const prop = inSchema.value!.properties[key]
          formData.value[key] = prop.default !== undefined ? prop.default : ''
        })
      }
    } else {
      mode.value = 'view'  // 无需输入，展示数据
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
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
        appStore.showToast(action.message || '', action.level || 'info')
      }
    }
  }

  // 向后兼容
  if (result.navigateTo) router.push(result.navigateTo)
  if (result.reload) await loadData()
  if (result.message && !result.actions) {
    appStore.showToast(result.message, result.success ? 'success' : 'error')
  }
}

async function handleSubmit() {
  console.log('Submit:', formData.value)
  
  // 一切皆工具描述架构下，提交表单就是调用工具
  // 工具信息从 pageData 中获取
  if (pageData.value) {
    const tool: ToolDescriptor = {
      _schema: pageData.value._schema,
      protocol: 'http',
      method: 'POST',
      url: apiUrl.value.replace('/api/', '/api/').replace('.json', '.json'),
      tools: pageData.value._tools
    }
    
    const result = await executeTool(tool, formData.value)
    await handleToolExecuted(result)
  } else {
    appStore.showSuccess('保存成功')
  }
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
