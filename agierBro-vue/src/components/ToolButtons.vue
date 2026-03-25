<template>
  <div class="tool-buttons">
    <template v-for="tool in tools" :key="tool.name">
      <Teleport to="body">
        <div v-if="showConfirm === tool.name" class="confirm-overlay" @click="cancelConfirm">
          <div class="confirm-dialog" @click.stop>
            <div class="confirm-content"><p>{{ getConfirmMessage(tool) }}</p></div>
            <div class="confirm-actions">
              <button class="btn btn-cancel" @click="cancelConfirm">取消</button>
              <button class="btn" @click="confirmTool(tool)">确认</button>
            </div>
          </div>
        </div>
      </Teleport>
      <button 
        class="btn btn-primary" 
        :class="getButtonClass(tool)"
        @click="handleClick(tool)"
      >
        {{ tool.name }}
      </button>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { Tool, ToolResponse } from '@/types'
import { useToolExecutor } from '@/composables/useToolExecutor'

const props = defineProps<{ 
  tools: Tool[]
  formData?: Record<string, any>
  currentData?: Record<string, any> 
}>()

const emit = defineEmits<{ executed: [result: ToolResponse] }>()
const { execute } = useToolExecutor()

const showConfirm = ref<string | null>(null)
const pendingTool = ref<Tool | null>(null)

function getButtonClass(tool: Tool): string {
  if (tool.protocol === 'navigate') return 'btn-secondary'
  return ''
}

function getConfirmMessage(tool: Tool): string {
  return `确认执行"${tool.name}"？`
}

function handleClick(tool: Tool) {
  if (tool.parameters) {
    showConfirm.value = tool.name
    pendingTool.value = tool
    return
  }
  executeTool(tool)
}

function confirmTool(tool: Tool) {
  showConfirm.value = null
  executeTool(tool)
}

function cancelConfirm() {
  showConfirm.value = null
  pendingTool.value = null
}

async function executeTool(tool: Tool) {
  const args: Record<string, any> = {}

  if (tool.parameters?.properties) {
    for (const key of Object.keys(tool.parameters.properties)) {
      if (props.formData?.[key] !== undefined) args[key] = props.formData[key]
      else if (props.currentData?.[key] !== undefined) args[key] = props.currentData[key]
    }
  }

  const result = await execute(tool, args, { formData: props.formData, currentData: props.currentData })
  const response: ToolResponse = {
    success: result.success,
    data: result.data,
    message: result.message,
    actions: result.actions,
    error: result.error,
    navigateTo: result.navigateTo,
    reload: result.reload
  }
  emit('executed', response)
}
</script>
<style scoped>
.tool-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
.btn { padding: 10px 20px; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; }
.btn-primary { background: #1890ff; color: #fff; }
.btn-primary:hover { background: #40a9ff; }
.confirm-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.confirm-dialog { background: #fff; border-radius: 8px; padding: 24px; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.confirm-content { margin-bottom: 24px; font-size: 14px; color: #333; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 12px; }
.confirm-actions .btn { min-width: 80px; }
.btn-cancel { background: #fff; color: #666; border: 1px solid #d9d9d9; }
.btn-cancel:hover { border-color: #1890ff; color: #1890ff; }
</style>
