<template>
  <div class="object-form">
    <form @submit.prevent="handleSubmit">
      <div v-if="layoutMode === 'simple'" class="form-simple">
        <template v-for="item in flatFields" :key="item.key">
          <FormField :field="item" :value="item.value" :error="errors[item.key]" @update="updateField(item.key, $event)" />
        </template>
      </div>
      <div v-else-if="layoutMode === 'advanced'" class="form-advanced">
        <div class="basic-fields"><h3>基本信息</h3>
          <template v-for="item in basicFields" :key="item.key">
            <FormField :field="item" :value="item.value" :error="errors[item.key]" @update="updateField(item.key, $event)" />
          </template>
        </div>
        <div class="advanced-fields"><details><summary>高级选项</summary>
          <template v-for="item in advancedFields" :key="item.key">
            <FormField :field="item" :value="item.value" :error="errors[item.key]" @update="updateField(item.key, $event)" />
          </template>
        </details></div>
      </div>
      <div v-else-if="layoutMode === 'tabs'" class="form-tabs">
        <div class="tabs-header">
          <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div class="tabs-content">
          <div v-for="tab in tabs" :key="tab.key" v-show="activeTab === tab.key">
            <template v-for="key in tab.fields" :key="key">
              <FormField :field="getField(key)!" :value="getFieldValue(key)" :error="errors[key]" @update="updateField(key, $event)" />
            </template>
          </div>
        </div>
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
import type { Schema, DataObject } from '@/types'
import { useSchemaParser, type ParsedField } from '@/composables/useSchemaParser'
import { determineUILayout, getFieldsWithDefaults, generateTabsConfig, type UILayoutMode } from '@/composables/useUIStrategy'
import FormField from './FormField.vue'
const props = defineProps<{ schema: Schema; data: DataObject; showActions?: boolean }>()
const emit = defineEmits<{ submit: [data: DataObject]; reset: []; update: [data: DataObject] }>()
const { parseSchema } = useSchemaParser()
const fields = ref<ParsedField[]>([])
const errors = ref<Record<string, string>>({})
const layoutMode = ref<UILayoutMode>('simple')
const activeTab = ref('basic')
const tabs = ref<Array<{ key: string; label: string; fields: string[] }>>([])
function initForm() {
  const schemaProps = (props.schema as any).properties
  if (!schemaProps) return
  fields.value = parseSchema(props.schema, props.data)
  errors.value = {}
  layoutMode.value = determineUILayout(schemaProps, props.data)
  if (layoutMode.value === 'tabs') tabs.value = generateTabsConfig(schemaProps)
}
watch(() => props.data, initForm, { deep: true })
initForm()
const flatFields = computed(() => fields.value)
const basicFields = computed(() => { const schemaProps = (props.schema as any).properties || {}; const f = getFieldsWithDefaults(schemaProps); return fields.value.filter(x => !f.includes(x.key)) })
const advancedFields = computed(() => { const schemaProps = (props.schema as any).properties || {}; const f = getFieldsWithDefaults(schemaProps); return fields.value.filter(x => f.includes(x.key)) })
function getField(key: string): ParsedField | undefined { return fields.value.find(f => f.key === key) }
function getFieldValue(key: string): any { return getField(key)?.value }
function updateField(key: string, value: any) { const f = fields.value.find(x => x.key === key); if (f) { f.value = value; if (errors.value[key]) errors.value[key] = ''; emitUpdate() } }
function emitUpdate() { const data: DataObject = {}; fields.value.forEach(f => data[f.key] = f.value); emit('update', data) }
function handleSubmit() { const data: DataObject = {}; fields.value.forEach(f => data[f.key] = f.value); emit('submit', data) }
function handleReset() { initForm(); emit('reset') }
defineExpose({ validate: () => true })
</script>
<style scoped>
.object-form { width: 100%; }
.form-simple { display: flex; flex-direction: column; gap: 16px; }
.form-advanced .basic-fields { margin-bottom: 24px; }
.form-advanced .basic-fields h3 { font-size: 16px; margin: 0 0 16px; color: #333; }
.form-advanced .advanced-fields details { border: 1px solid #e8e8e8; border-radius: 4px; padding: 16px; }
.form-advanced .advanced-fields summary { cursor: pointer; font-weight: 500; color: #666; }
.form-tabs { width: 100%; }
.tabs-header { display: flex; gap: 8px; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.tab-btn { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: #666; font-size: 14px; }
.tab-btn:hover { color: #1890ff; }
.tab-btn.active { color: #1890ff; border-bottom-color: #1890ff; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8e8e8; }
.btn { padding: 10px 24px; border-radius: 4px; font-size: 14px; cursor: pointer; border: none; }
.btn-primary { background: #1890ff; color: #fff; }
.btn-primary:hover { background: #40a9ff; }
.btn-secondary { background: #fff; color: #666; border: 1px solid #d9d9d9; }
.btn-secondary:hover { border-color: #1890ff; color: #1890ff; }
</style>
