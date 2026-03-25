<template>
  <div class="list-renderer">
    <!-- 表格布局：字段数 > 4 -->
    <div v-if="layout === 'table'" class="list-table">
      <table class="table">
        <thead>
          <tr>
            <th v-for="col in visibleColumns" :key="col.key">
              {{ col.title }}
            </th>
            <th v-if="hasTools" class="th-tools">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in items"
            :key="item.id || index"
            class="table-row"
            @click="handleItemClick(item)"
          >
            <td v-for="col in visibleColumns" :key="col.key">
              {{ formatValue(item[col.key], col.field) }}
            </td>
            <td v-if="hasTools" class="td-tools" @click.stop>
              <ToolButtons
                :tools="getItemTools(item)"
                :currentData="item"
                @executed="handleToolExecuted"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 卡片布局：字段数 2-4 -->
    <div v-else-if="layout === 'card'" class="list-cards">
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        class="card"
        @click="handleItemClick(item)"
      >
        <div v-for="col in visibleColumns" :key="col.key" class="card-field">
          <span class="card-label">{{ col.title }}</span>
          <span class="card-value">{{ formatValue(item[col.key], col.field) }}</span>
        </div>
        <div v-if="hasTools" class="card-tools" @click.stop>
          <ToolButtons
            :tools="getItemTools(item)"
            :currentData="item"
            @executed="handleToolExecuted"
          />
        </div>
      </div>
    </div>

    <!-- 按钮布局：字段数 = 1 -->
    <div v-else-if="layout === 'button'" class="list-buttons">
      <button
        v-for="(item, index) in items"
        :key="item.id || index"
        class="btn"
        @click="handleItemClick(item)"
      >
        {{ formatValue(item[visibleColumns[0]?.key], visibleColumns[0]?.field) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Schema, DataObject, Field, Tool, ToolResponse } from '@/types'
import ToolButtons from './ToolButtons.vue'

const props = defineProps<{
  schema: Schema | null
  data: DataObject
}>()

const emit = defineEmits<{
  itemClick: [url: string]
  toolExecuted: [result: ToolResponse]
}>()

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

// 获取可见字段
const visibleColumns = computed<Array<{ key: string; field: Field; title: string }>>(() => {
  const properties = itemSchema.value?.properties || {}
  return Object.entries(properties)
    .filter(([_, field]) => field.visible !== false)
    .map(([key, field]) => ({
      key,
      field,
      title: field.title || formatLabel(key)
    }))
})

// 根据可见字段数量决定布局
const layout = computed<'table' | 'card' | 'button'>(() => {
  const count = visibleColumns.value.length
  if (count === 1) return 'button'
  if (count <= 4) return 'card'
  return 'table'
})

// 检查是否有 tools
const hasTools = computed(() => {
  return items.value.some(item => item._tools && item._tools.length > 0)
})

// 获取 item 的 tools
function getItemTools(item: DataObject): Tool[] {
  return item._tools || []
}

// 处理 tool 执行
function handleToolExecuted(result: ToolResponse) {
  emit('toolExecuted', result)
}

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

function handleItemClick(item: DataObject) {
  // 从 Schema 获取地址
  const propsSchema = props.schema?.properties?.items as any
  const address = propsSchema?.items?._address
  if (address) {
    // 替换占位符
    let url = address
    Object.entries(item).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value))
    })
    // 移除 .json 后缀
    url = url.replace('.json', '')
    emit('itemClick', url)
  }
}
</script>

<style scoped>
.list-renderer {
  width: 100%;
}

/* 表格布局 */
.list-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.table th, .table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.table td {
  color: #666;
  font-size: 14px;
}

.table-row {
  cursor: pointer;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f5f5f5;
}

/* 卡片布局 */
.list-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  font-weight: 500;
}

/* 按钮布局 */
.list-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 16px 24px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #f5f5f5;
}

/* Tools 操作列 */
.th-tools, .td-tools {
  width: 1%;
  white-space: nowrap;
  padding: 8px 12px;
}

.th-tools {
  text-align: center;
}

.td-tools {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 卡片工具按钮 */
.card-tools {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .table {
    font-size: 13px;
  }

  .table th, .table td {
    padding: 10px 12px;
  }

  .table th {
    font-size: 13px;
    white-space: nowrap;
  }

  .list-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card {
    padding: 14px;
    border-radius: 8px;
  }

  .card-field {
    gap: 4px;
    margin-bottom: 10px;
  }

  .card-label {
    font-size: 11px;
  }

  .card-value {
    font-size: 14px;
  }

  .list-buttons {
    gap: 10px;
  }

  .btn {
    padding: 14px 18px;
    font-size: 14px;
    min-height: 44px;
  }
}
</style>
