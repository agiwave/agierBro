<template>
  <div class="object-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-simple">
        <template v-for="item in fields" :key="item.key">
          <FormField 
            :field="item" 
            :value="item.value" 
            :error="errors[item.key]" 
            @update="updateField(item.key, $event)" 
          />
        </template>
      </div>
      <div v-if="showActions" class="form-actions">
        <button type="button" class="btn btn-secondary" @click="handleReset">重置</button>
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Schema, DataObject, Field } from '@/types'
import { useFormValidator } from '@/composables/useFormValidator'
import FormField from './FormField.vue'

const props = defineProps<{ 
  schema: Schema
  data: DataObject
  showActions?: boolean 
}>()

const emit = defineEmits<{ 
  submit: [data: DataObject]
  reset: []
  update: [data: DataObject] 
}>()

const { validate, validateSingleField } = useFormValidator()

// 解析字段
const fields = computed(() => {
  const properties = props.schema.properties || {}
  return Object.entries(properties).map(([key, field]) => ({
    key,
    field,
    value: props.data[key] !== undefined ? props.data[key] : getDefaultValue(field)
  }))
})

const errors = ref<Record<string, string>>({})

function getDefaultValue(field: Field): any {
  if (field.default !== undefined) return field.default
  switch (field.type) {
    case 'string':
    case 'date':
    case 'date-time':
      return ''
    case 'number':
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

function updateField(key: string, value: any) {
  const field = fields.value.find(f => f.key === key)
  if (field) {
    field.value = value
    // 实时验证
    if (errors.value[key]) {
      const error = validateSingleField(props.schema, key, value)
      if (!error) {
        errors.value[key] = ''
      }
    }
    emitUpdate()
  }
}

function emitUpdate() {
  const data: DataObject = {}
  fields.value.forEach(f => data[f.key] = f.value)
  emit('update', data)
}

function handleSubmit() {
  const formData: DataObject = {}
  fields.value.forEach(f => formData[f.key] = f.value)

  const result = validate(props.schema, formData)
  if (!result.valid) {
    errors.value = result.errors
    return
  }

  errors.value = {}
  emit('submit', formData)
}

function handleReset() {
  errors.value = {}
  emit('reset')
}

defineExpose({
  validate: () => {
    const formData: DataObject = {}
    fields.value.forEach(f => formData[f.key] = f.value)
    const result = validate(props.schema, formData)
    errors.value = result.errors
    return result.valid
  }
})
</script>

<style scoped>
.object-form { width: 100%; }
.form-simple { display: flex; flex-direction: column; gap: 16px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8e8e8; }
.btn { padding: 10px 24px; border-radius: 4px; font-size: 14px; cursor: pointer; border: none; }
.btn-primary { background: #1890ff; color: #fff; }
.btn-primary:hover { background: #40a9ff; }
.btn-secondary { background: #fff; color: #666; border: 1px solid #d9d9d9; }
.btn-secondary:hover { border-color: #1890ff; color: #1890ff; }
</style>
