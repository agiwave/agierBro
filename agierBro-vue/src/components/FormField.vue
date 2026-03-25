<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label class="field-label">
      {{ formatLabel(field.key, field.field) }}
    </label>
    <div v-if="field.field.type === 'object' && field.field.properties" class="nested-object">
      <template v-for="(nestedField, key) in field.field.properties" :key="key">
        <FormField
          :field="{ key, field: nestedField, value: (field.value || {})[key] }"
          :value="(field.value || {})[key]"
          @update="(val) => updateNestedField(key as string, val)"
        />
      </template>
    </div>
    <div v-else-if="field.field.type === 'array'" class="array-field">
      <div v-for="(item, index) in (field.value || [])" :key="index" class="array-item">
        <span class="array-item-index">{{ index + 1 }}.</span>
        <span class="array-item-value">{{ formatValue(item, field.field.items) }}</span>
      </div>
      <button type="button" class="btn-add-item" @click="addItem">+ 添加</button>
    </div>
    <select v-else-if="field.field.enum" :value="field.value" class="field-input" @change="handleSelect($event)">
      <option value="">请选择</option>
      <option v-for="opt in field.field.enum" :key="opt.value" :value="opt.value" :disabled="opt.disabled">{{ opt.label }}</option>
    </select>
    <label v-else-if="field.field.type === 'boolean'" class="field-checkbox">
      <input type="checkbox" :checked="field.value" @change="handleCheckbox($event)" />
      <span>{{ field.value ? '是' : '否' }}</span>
    </label>
    <input
      v-else-if="field.field.type === 'number' || field.field.type === 'integer'"
      type="number"
      :value="field.value"
      class="field-input"
      :placeholder="field.field.description"
      @input="handleInput($event)"
    />
    <input
      v-else
      :type="getInputType()"
      :value="field.value ?? ''"
      class="field-input"
      :placeholder="field.field.description"
      @input="handleInput($event)"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Field } from '@/types'
import type { ParsedField } from '@/composables/useSchemaParser'
const props = defineProps<{ field: ParsedField; value: any; error?: string }>()
const emit = defineEmits<{ update: [value: any] }>()
function formatLabel(key: string, field?: Field): string {
  if (field?.title) return field.title
  return key.replace(/_/g, ' ')
}
function getInputType(): string {
  const f = props.field.field
  if (f.format === 'email') return 'email'
  if (f.format === 'date') return 'date'
  if (f.format === 'date-time') return 'datetime-local'
  return 'text'
}
function formatValue(value: any, items?: Field): string {
  if (value == null) return ''
  if (items?.enum) { const item = items.enum.find(e => e.value === value); return item ? item.label : String(value) }
  return String(value)
}
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', target.value)
}
function handleSelect(event: Event) {
  const t = event.target as HTMLSelectElement
  emit('update', t.value === '' ? null : (props.field.field.type === 'number' ? Number(t.value) : t.value))
}
function handleCheckbox(event: Event) {
  emit('update', (event.target as HTMLInputElement).checked)
}
function updateNestedField(key: string, value: any) {
  emit('update', { ...(props.field.value || {}), [key]: value })
}
function addItem() {
  emit('update', [...(props.field.value || []), props.field.field.items?.default ?? ''])
}
</script>
<style scoped>
.form-field { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-weight: 500; color: #333; font-size: 14px; }
.field-input { padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 14px; }
.field-input:focus { outline: none; border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2); }
.field-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.field-checkbox input { width: 16px; height: 16px; }
.field-error { color: #ff4d4f; font-size: 12px; }
.has-error .field-input { border-color: #ff4d4f; }
.nested-object { margin-left: 16px; padding-left: 16px; border-left: 2px solid #e8e8e8; display: flex; flex-direction: column; gap: 16px; }
.array-field { display: flex; flex-direction: column; gap: 8px; }
.array-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f5f5f5; border-radius: 4px; }
.array-item-index { font-weight: 500; color: #666; min-width: 24px; }
.btn-add-item { padding: 8px 16px; background: #fff; border: 1px dashed #d9d9d9; border-radius: 4px; color: #666; cursor: pointer; }
.btn-add-item:hover { border-color: #1890ff; color: #1890ff; }
</style>
