<template>
  <div class="list-enhanced">
    <!-- 工具栏：搜索、筛选、操作 -->
    <div class="list-toolbar">
      <!-- 搜索框 -->
      <div v-if="searchable" class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="searchPlaceholder || '搜索...'"
          @input="handleSearch"
        />
        <span class="search-icon">🔍</span>
        <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
      </div>

      <!-- 筛选器 -->
      <div v-if="filters && filters.length" class="filter-box">
        <select v-for="filter in filters" :key="filter.key" v-model="filterValues[filter.key]" class="filter-select" @change="handleFilterChange">
          <option value="">{{ filter.placeholder || `全部${filter.title}` }}</option>
          <option v-for="option in filter.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 右侧操作 -->
      <div class="toolbar-actions">
        <!-- 刷新按钮 -->
        <button class="btn-icon" @click="handleRefresh" title="刷新">🔄</button>
        <!-- 视图切换 -->
        <div v-if="viewSwitchable" class="view-switcher">
          <button :class="['view-btn', { active: currentView === 'table' }]" @click="currentView = 'table'" title="表格">📊</button>
          <button :class="['view-btn', { active: currentView === 'card' }]" @click="currentView = 'card'" title="卡片">📇</button>
        </div>
      </div>
    </div>

    <!-- 列表内容 -->
    <div class="list-content">
      <!-- 表格视图 -->
      <div v-if="currentView === 'table'" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key" :class="{ sortable: col.sortable }" @click="handleSort(col)">
                <span>{{ col.title }}</span>
                <span v-if="col.sortable" class="sort-icon">
                  {{ getSortIcon(col.key) }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in paginatedItems"
              :key="item.id || index"
              class="table-row"
              @click="handleItemClick(item)"
            >
              <td v-for="col in columns" :key="col.key">
                {{ formatValue(item[col.key], col.field) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 卡片视图 -->
      <div v-else class="cards-wrapper">
        <div
          v-for="(item, index) in paginatedItems"
          :key="item.id || index"
          class="card"
          @click="handleItemClick(item)"
        >
          <div v-for="col in columns" :key="col.key" class="card-field">
            <span class="card-label">{{ col.title }}</span>
            <span class="card-value">{{ formatValue(item[col.key], col.field) }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredItems.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>{{ emptyText || '暂无数据' }}</p>
      </div>
    </div>

    <!-- 分页器 -->
    <div v-if="paginable && totalItems > pageSize" class="pagination">
      <div class="pagination-info">
        显示 {{ startIndex + 1 }} - {{ endIndex }} 条，共 {{ totalItems }} 条
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(1)">
          首页
        </button>
        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          上一页
        </button>

        <!-- 页码 -->
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          下一页
        </button>
        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
          末页
        </button>
      </div>

      <!-- 每页条数选择 -->
      <div class="page-size-selector">
        <span>每页显示：</span>
        <select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }} 条
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Schema, DataObject, Field } from '@/types'

export interface Column {
  key: string
  title: string
  field: Field
  sortable?: boolean
  width?: string
}

export interface FilterOption {
  key: string
  title: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

const props = withDefaults(defineProps<{
  schema: Schema | null
  data: DataObject
  searchable?: boolean
  searchPlaceholder?: string
  filters?: FilterOption[]
  paginable?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  viewSwitchable?: boolean
  emptyText?: string
}>(), {
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  itemClick: [url: string]
  refresh: []
}>()

// 搜索
const searchQuery = ref('')
const isSearching = ref(false)

// 排序
const sortField = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 分页
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize || 10)
const pageSizeOptions = props.pageSizeOptions || [10, 20, 50, 100]

// 视图
const currentView = ref<'table' | 'card'>('table')

// 筛选值
const filterValues = ref<Record<string, string>>({})

// 获取 items
const items = computed<DataObject[]>(() => props.data?.items || [])

// 获取 item 的 Schema
const itemSchema = computed<Schema | null>(() => {
  const propsSchema = props.schema?.properties?.items as any
  if (propsSchema?.items?.properties) {
    return {
      type: 'object',
      properties: propsSchema.items.properties
    }
  }
  return null
})

// 获取列
const columns = computed<Column[]>(() => {
  const properties = itemSchema.value?.properties || {}
  return Object.entries(properties)
    .filter(([_, field]) => field.visible !== false)
    .map(([key, field]) => ({
      key,
      title: field.title || formatLabel(key),
      field,
      sortable: field.type === 'string' || field.type === 'number' || field.type === 'date'
    }))
})

// 过滤后的数据
const filteredItems = computed<DataObject[]>(() => {
  let result = [...items.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return Object.values(item).some(value => {
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    })
  }

  // 筛选器
  for (const [key, value] of Object.entries(filterValues.value)) {
    if (value) {
      result = result.filter(item => String(item[key]) === value)
    }
  }

  // 排序
  if (sortField.value) {
    result.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      if (aVal === bVal) return 0
      const order = sortOrder.value === 'asc' ? 1 : -1
      return aVal > bVal ? order : -order
    })
  }

  return result
})

// 总数
const totalItems = computed(() => filteredItems.value.length)

// 总页数
const totalPages = computed(() => Math.ceil(totalItems.value / currentPageSize.value))

// 分页后的数据
const paginatedItems = computed(() => {
  if (!props.paginable) return filteredItems.value
  const start = (currentPage.value - 1) * currentPageSize.value
  const end = start + currentPageSize.value
  return filteredItems.value.slice(start, end)
})

// 起始和结束索引
const startIndex = computed(() => (currentPage.value - 1) * currentPageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + currentPageSize.value, totalItems.value))

// 可见的页码
const visiblePages = computed<number[]>(() => {
  const pages: number[] = []
  const current = currentPage.value
  const total = totalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // 省略号
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    }
  }

  return pages.filter(p => p !== -1)
})

// 搜索处理
function handleSearch() {
  currentPage.value = 1
  isSearching.value = !!searchQuery.value
}

function clearSearch() {
  searchQuery.value = ''
  handleSearch()
}

// 筛选处理
function handleFilterChange() {
  currentPage.value = 1
}

// 排序处理
function handleSort(col: Column) {
  if (!col.sortable) return
  if (sortField.value === col.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = col.key
    sortOrder.value = 'asc'
  }
}

function getSortIcon(key: string): string {
  if (sortField.value !== key) return '⇅'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// 分页处理
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function handlePageSizeChange() {
  currentPage.value = 1
}

// 刷新
function handleRefresh() {
  emit('refresh')
}

// 工具函数
function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
}

function formatValue(value: any, field: Field): string {
  if (value == null || value === '') return '—'
  if (field.type === 'boolean') return value ? '是' : '否'
  if (field.enum) {
    const item = field.enum.find(e => e.value === value)
    return item ? item.label : String(value)
  }
  if (field.format === 'date' || field.format === 'date-time') {
    try {
      return new Date(value).toLocaleString('zh-CN')
    } catch {
      return String(value)
    }
  }
  if (field.type === 'number' || field.type === 'integer') {
    return value.toLocaleString()
  }
  return String(value)
}

// 处理点击
function handleItemClick(item: DataObject) {
  const propsSchema = props.schema?.properties?.items as any
  const address = propsSchema?.items?._address
  if (address) {
    let url = address
    Object.entries(item).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value))
    })
    url = url.replace('.json', '')
    emit('itemClick', url)
  }
}

// 暴露方法
defineExpose({
  refresh: () => {
    currentPage.value = 1
    searchQuery.value = ''
    sortField.value = ''
    filterValues.value = {}
  },
  setSearch: (query: string) => {
    searchQuery.value = query
    handleSearch()
  },
  setFilter: (key: string, value: string) => {
    filterValues.value[key] = value
    handleFilterChange()
  }
})
</script>

<style scoped>
.list-enhanced {
  width: 100%;
}

/* 工具栏 */
.list-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #999;
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 14px;
  padding: 4px;
}

.search-clear:hover {
  color: #666;
}

.filter-box {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1890ff;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.btn-icon {
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #e8e8e8;
}

.view-switcher {
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 12px;
  background: #fff;
  border: none;
  border-right: 1px solid #d9d9d9;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: #f5f5f5;
}

.view-btn.active {
  background: #1890ff;
  color: #fff;
}

/* 列表内容 */
.list-content {
  min-height: 200px;
}

/* 表格 */
.table-wrapper {
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.3s;
}

.data-table th:hover {
  background: #f0f0f0;
}

.data-table .sort-icon {
  margin-left: 4px;
  color: #999;
  font-size: 12px;
}

.data-table tbody tr {
  cursor: pointer;
  transition: background 0.2s;
}

.data-table tbody tr:hover {
  background: #f5f5f5;
}

/* 卡片 */
.cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.card-field:last-child {
  margin-bottom: 0;
}

.card-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.card-value {
  font-size: 14px;
  color: #333;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-btn {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #1890ff;
}

@media (max-width: 768px) {
  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .toolbar-actions {
    justify-content: flex-end;
  }

  .pagination {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
