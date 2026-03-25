<template>
  <div class="object-groups">
    <div v-for="section in sections" :key="section.key" class="field-section">
      <div class="section-header">
        <h3 class="section-title">{{ section.title }}</h3>
        <p v-if="section.description" class="section-description">{{ section.description }}</p>
      </div>
      <div class="section-content">
        <!-- 简单字段组：使用表单布局 -->
        <div v-if="!section.isComplex" class="simple-fields-grid">
          <div v-for="item in section.fields" :key="item.key" class="field-row">
            <div class="field-label">
              <span class="label-text">{{ getFieldLabel(item.key, item.field) }}</span>
              <span v-if="item.field.required" class="required-mark">*</span>
            </div>
            <div class="field-value">
              <span v-if="mode === 'view'" class="value-text">{{ formatValue(item.value, item.field) }}</span>
              <FormField
                v-else
                :field="{ key: item.key, field: item.field, value: item.value } as ParsedField"
                :value="item.value"
                :error="errors[item.key]"
                @update="updateField(item.key, $event)"
              />
            </div>
          </div>
        </div>
        
        <!-- 复杂字段组：使用嵌套组件 -->
        <div v-else class="complex-fields">
          <div v-for="item in section.fields" :key="item.key" class="complex-field">
            <div v-if="item.field.type === 'object' && item.field.properties" class="nested-object">
              <ObjectGroups 
                :schema="createNestedSchema(item.field)" 
                :data="item.value || {}" 
                :mode="mode"
                @update="updateField(item.key, $event)"
              />
            </div>
            <div v-else-if="item.field.type === 'array'" class="nested-array">
              <div class="array-header">
                <span class="array-title">{{ item.field.title || formatLabel(item.key) }}</span>
                <span class="array-count">{{ (item.value || []).length }} 项</span>
              </div>
              <div v-for="(arrayItem, index) in (item.value || [])" :key="index" class="array-item">
                <div class="array-item-header">
                  <span class="item-index">#{{ index + 1 }}</span>
                </div>
                <div v-if="item.field.items?.type === 'object' && item.field.items.properties" class="array-item-content">
                  <ObjectGroups 
                    :schema="createNestedSchema(item.field.items)" 
                    :data="arrayItem" 
                    :mode="mode"
                    @update="(val) => updateArrayItem(item.key, index, val)"
                  />
                </div>
                <div v-else class="array-item-simple">
                  {{ formatValue(arrayItem, item.field.items || { type: 'string' }) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Schema, Field, DataObject } from '@/types'
import { groupFields, type FieldSection, type ParsedField, formatLabel, getDefaultValue } from '@/composables/useFieldGrouping'
import FormField from './FormField.vue'

const props = defineProps<{
  schema: Schema
  data: DataObject
  mode?: 'view' | 'edit'
}>()

const emit = defineEmits<{
  update: [data: DataObject]
}>()

const errors = ref<Record<string, string>>({})

const sections = computed<FieldSection[]>(() => {
  return groupFields(props.schema, props.data)
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

function updateField(key: string, value: any) {
  const section = sections.value.find(s => s.fields.some(f => f.key === key))
  if (section) {
    const field = section.fields.find(f => f.key === key)
    if (field) {
      field.value = value
      if (errors.value[key]) errors.value[key] = ''
      emitUpdate()
    }
  }
}

function updateArrayItem(fieldKey: string, index: number, value: any) {
  const section = sections.value.find(s => s.fields.some(f => f.key === fieldKey))
  if (section) {
    const field = section.fields.find(f => f.key === fieldKey)
    if (field && Array.isArray(field.value)) {
      field.value[index] = value
      emitUpdate()
    }
  }
}

function emitUpdate() {
  const data: DataObject = {}
  sections.value.forEach(section => {
    section.fields.forEach(field => {
      data[field.key] = field.value
    })
  })
  emit('update', data)
}
</script>

<style scoped>
.object-groups {
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

/* 简单字段网格布局 */
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
}

.value-text {
  display: block;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  min-height: 20px;
}

/* 复杂字段 */
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

/* 数组 */
.nested-array {
  width: 100%;
}

.array-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.array-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.array-count {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.array-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.array-item:last-child {
  margin-bottom: 0;
}

.array-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.item-index {
  font-size: 12px;
  font-weight: 600;
  color: #1890ff;
}

.array-item-content {
  padding-left: 16px;
}

.array-item-simple {
  font-size: 14px;
  color: #666;
  padding: 8px 0;
}

/* 编辑模式下的 FormField 样式调整 */
:deep(.form-field) {
  width: 100%;
}
</style>
