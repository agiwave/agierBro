<template>
  <div class="schema-renderer">
    <div v-if="mode === 'view'" class="view-mode">
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
    
    <!-- 编辑模式 -->
    <div v-else class="edit-mode">
      <ObjectForm
        :schema="schema"
        :data="formData"
        :showActions="false"
        @update="handleUpdate"
        @submit="handleSubmit"
      />
      <div class="form-actions">
        <button class="btn btn-secondary" @click="handleReset">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">保存</button>
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
</style>
