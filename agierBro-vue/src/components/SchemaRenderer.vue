<template>
  <div class="schema-renderer">
    <!-- 表单模式：有 tools 且是表单类型页面 -->
    <div v-if="isFormMode" class="form-mode">
      <div v-if="schema.title" class="form-header">
        <h2 class="form-title">{{ schema.title }}</h2>
        <p v-if="schema.description" class="form-description">{{ schema.description }}</p>
      </div>
      <ObjectForm
        :schema="schema"
        :data="formData"
        :showActions="false"
        @update="handleUpdate"
        @submit="handleFormSubmit"
      />
      <!-- Tools 操作按钮 -->
      <div v-if="tools.length" class="tool-section">
        <ToolButtons :tools="tools" :formData="formData" :currentData="data" @executed="handleToolExecuted" />
      </div>
    </div>
    
    <!-- 查看模式：分组渲染字段 -->
    <div v-else class="view-mode">
      <!-- 查看模式：分组渲染字段 -->
      <div v-for="section in sections" :key="section.key" class="field-section">
        <div class="section-header" v-if="section.title">
          <h3 class="section-title">{{ section.title }}</h3>
          <p v-if="section.description" class="section-description">{{ section.description }}</p>
        </div>
        <div class="section-content">
          <!-- 简单字段：网格布局 -->
          <div v-if="!section.isComplex" class="simple-fields-grid">
            <div v-for="item in section.fields" :key="item.key" class="field-row">
              <div class="field-label">
                <span>{{ getFieldLabel(item.key, item.field) }}</span>
                <span v-if="item.field.required" class="required-mark">*</span>
              </div>
              <div class="field-value">{{ formatValue(item.value, item.field) }}</div>
            </div>
          </div>
          <!-- 复杂字段：嵌套渲染 -->
          <div v-else class="complex-fields">
            <div v-for="item in section.fields" :key="item.key" class="complex-field">
              <div v-if="item.field.type === 'object' && item.field.properties" class="nested-object">
                <SchemaRenderer
                  :schema="createNestedSchema(item.field)"
                  :data="item.value || {}"
                  mode="view"
                />
              </div>
              <div v-else-if="item.field.type === 'array'" class="nested-array">
                <ListRenderer
                  :schema="createNestedSchema(item.field)"
                  :data="{ items: item.value || [] }"
                  @itemClick="() => {}"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tools 操作按钮 -->
      <div v-if="tools.length" class="tool-section">
        <ToolButtons :tools="tools" :currentData="data" @executed="handleToolExecuted" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Schema, DataObject, Field, Tool, ToolResponse } from '@/types'
import { groupFields, type FieldSection, type ParsedField, formatLabel, getDefaultValue } from '@/composables/useFieldGrouping'
import ObjectForm from './ObjectForm.vue'
import ListRenderer from './ListRenderer.vue'
import ToolButtons from './ToolButtons.vue'

const props = defineProps<{
  schema: Schema
  data: DataObject
  mode?: 'view' | 'edit'
}>()

const emit = defineEmits<{
  submit: [data: DataObject]
  toolExecuted: [result: ToolResponse]
}>()

const formData = ref<DataObject>({ ...props.data })
const mode = ref<'view' | 'edit'>(props.mode || 'view')

// 判断是否为表单模式：有 tools 且没有复杂数据（用于登录/注册等表单页面）
const isFormMode = computed(() => {
  const hasTools = tools.value.length > 0
  const hasItems = props.data.items && Array.isArray(props.data.items)
  const hasMenu = props.data.menu && Array.isArray(props.data.menu)
  // 有 tools 且不是 Section 列表或 Dashboard，则是表单模式
  return hasTools && !hasItems && !hasMenu
})

const sections = computed<FieldSection[]>(() => {
  return groupFields(props.schema, props.data)
})

const tools = computed<Tool[]>(() => {
  return props.schema.tools || []
})

watch(() => props.data, () => {
  formData.value = { ...props.data }
  mode.value = props.mode || 'view'
}, { deep: true })

watch(() => props.mode, (newMode) => {
  mode.value = newMode || 'view'
})

function createNestedSchema(field: Field): Schema {
  return {
    type: 'object',
    properties: field.properties || {},
    order: field.properties ? Object.keys(field.properties) : []
  } as Schema
}

function getFieldLabel(key: string, field: Field): string {
  return field.title || formatLabel(key)
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

function handleUpdate(data: DataObject) {
  formData.value = data
}

function handleSubmit() {
  emit('submit', formData.value)
}

function handleFormSubmit() {
  // 表单模式下的提交，触发第一个 tool
  if (tools.value.length > 0) {
    // 表单模式由 ToolButtons 处理工具执行
  }
}

function handleReset() {
  formData.value = { ...props.data }
  mode.value = 'view'
}

function handleToolExecuted(result: ToolResponse) {
  emit('toolExecuted', result)
}

// 暴露方法供外部调用
defineExpose({
  setMode: (m: 'view' | 'edit') => { mode.value = m }
})
</script>

<style scoped>
.schema-renderer {
  width: 100%;
}

/* 表单模式 */
.form-mode {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.form-description {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.tool-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 查看模式 */
.view-mode {
  width: 100%;
}

.field-section {
  margin-bottom: 32px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.field-section:last-child {
  margin-bottom: 0;
}

.section-header {
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-description {
  margin: 8px 0 0;
  font-size: 13px;
  color: #666;
}

.section-content {
  padding: 24px;
}

.simple-fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.required-mark {
  color: #ff4d4f;
}

.field-value {
  flex: 1;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  min-height: 20px;
}

.complex-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.complex-field {
  width: 100%;
}

.nested-object {
  padding-left: 16px;
  border-left: 2px solid #1890ff;
}

/* 编辑模式 */
.edit-mode {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.tool-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .form-mode {
    max-width: 100%;
    padding: 16px;
    border-radius: 8px;
  }

  .form-title {
    font-size: 20px;
  }

  .form-description {
    font-size: 13px;
  }

  .tool-section {
    flex-direction: column;
  }

  .tool-section :deep(.btn) {
    width: 100%;
  }

  .field-section {
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .section-header {
    padding: 12px 16px;
  }

  .section-title {
    font-size: 15px;
  }

  .section-description {
    font-size: 12px;
  }

  .section-content {
    padding: 16px;
  }

  .simple-fields-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .field-label {
    font-size: 13px;
  }

  .field-value {
    font-size: 14px;
  }

  .nested-object {
    padding-left: 12px;
    border-left-width: 1px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .btn {
    width: 100%;
    padding: 12px 20px;
    min-height: 44px;
  }
}
</style>
