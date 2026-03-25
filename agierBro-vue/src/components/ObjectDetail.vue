<template>
  <div class="object-detail">
    <div class="detail-header">
      <h1>{{ schema?.title || '详情' }}</h1>
      <div class="header-actions">
        <button v-if="mode === 'view'" class="btn-edit" @click="startEdit">编辑</button>
      </div>
    </div>
    <div class="detail-content">
      <div v-if="mode === 'view'" class="view-mode">
        <div v-for="item in fields" :key="item.key" class="detail-row">
          <div class="detail-label">{{ getFieldLabel(item.key, item.field) }}</div>
          <div class="detail-value">{{ formatValue(item.value, item.field) }}</div>
        </div>
        <div v-if="tools.length" class="action-buttons">
          <ToolButtons :tools="tools" :currentData="data" @executed="handleExecuted" />
        </div>
      </div>
      <ObjectForm v-else :schema="schema as Schema" :data="formData" @update="formData = $event" @submit="onSubmit" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Schema, DataObject, Tool, Field, ToolResponse } from '@/types'
import { useSchemaParser, type ParsedField } from '@/composables/useSchemaParser'
import ObjectForm from '@/components/ObjectForm.vue'
import ToolButtons from '@/components/ToolButtons.vue'
const props = defineProps<{ schema: Schema | null; data: DataObject; mode: 'view' | 'edit' }>()
const emit = defineEmits<{ submit: [data: DataObject]; toolExecuted: [result: ToolResponse] }>()
const { parseSchema } = useSchemaParser()
const formData = ref<DataObject>({ ...props.data })
const fields = computed<ParsedField[]>(() => {
  if (!props.schema || props.schema.type !== 'object') return []
  return parseSchema(props.schema, props.data)
})
const tools = computed<Tool[]>(() => {
  const s = props.schema as any
  return s.tools || []
})
watch(() => props.data, () => { formData.value = { ...props.data } }, { deep: true })
function getFieldLabel(key: string, field: Field): string {
  const labels: Record<string, string> = { id: 'ID', name: '姓名', email: '邮箱', phone: '电话', status: '状态', created_at: '创建时间' }
  return field.title || labels[key] || key.replace(/_/g, ' ')
}
function formatValue(value: any, field: Field): string {
  if (value == null) return ''
  if (field.type === 'boolean') return value ? '是' : '否'
  if (field.enum) { const item = field.enum.find(e => e.value === value); return item ? item.label : String(value) }
  if (field.format === 'date') return new Date(value).toLocaleDateString()
  return String(value)
}
function startEdit() { emit('toolExecuted', { success: true, navigateTo: '?mode=edit' }) }
function onSubmit(data: DataObject) { emit('submit', data) }
function handleExecuted(result: ToolResponse) { emit('toolExecuted', result) }
</script>
<style scoped>
.object-detail { background: #fff; margin: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
.detail-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e8e8e8; }
.detail-header h1 { font-size: 20px; margin: 0; }
.header-actions { display: flex; gap: 12px; }
.header-actions button { padding: 8px 16px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; }
.btn-edit { background: #1890ff; color: #fff; }
.btn-edit:hover { background: #40a9ff; }
.detail-content { padding: 24px; }
.view-mode .detail-row { display: flex; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
.view-mode .detail-row:last-child { border-bottom: none; }
.view-mode .detail-label { width: 150px; font-weight: 500; color: #666; font-size: 14px; }
.view-mode .detail-value { flex: 1; color: #333; font-size: 14px; }
.action-buttons { display: flex; gap: 12px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8e8e8; }
</style>
