<template>
  <div class="file-uploader" :class="{ 'is-dragover': isDragover, 'has-error': error }">
    <!-- 文件列表 -->
    <div v-if="fileList.length" class="file-list">
      <div v-for="(file, index) in fileList" :key="file.id || index" class="file-item">
        <div class="file-info">
          <span class="file-icon">{{ getFileIcon(file.type || '') }}</span>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span v-if="file.size" class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
        <div class="file-actions">
          <!-- 下载链接 -->
          <a v-if="file.url" :href="file.url" :download="file.name" class="file-action" title="下载">
            📥
          </a>
          <!-- 预览 -->
          <a v-if="canPreview(file.type)" :href="file.url || file.preview" target="_blank" class="file-action" title="预览">
            👁️
          </a>
          <!-- 删除 -->
          <button type="button" class="file-action btn-delete" @click="removeFile(index)" title="删除">
            🗑️
          </button>
        </div>
        <!-- 上传进度 -->
        <div v-if="file.uploading" class="upload-progress">
          <div class="progress-bar" :style="{ width: `${file.progress || 0}%` }"></div>
          <span class="progress-text">{{ file.progress || 0 }}%</span>
        </div>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="upload-area"
      @click="triggerSelect"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="maxFiles !== 1"
        class="file-input"
        @change="handleFileSelect"
      />
      <div class="upload-placeholder">
        <span class="upload-icon">📁</span>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p v-if="accept" class="upload-hint">支持格式：{{ formatAccept(accept) }}</p>
        <p v-if="maxSize" class="upload-hint">最大文件大小：{{ formatFileSize(maxSize) }}</p>
      </div>
    </div>

    <!-- 错误信息 -->
    <span v-if="error" class="uploader-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface FileInfo {
  id?: string
  name: string
  size?: number
  type?: string
  url?: string
  preview?: string
  uploading?: boolean
  progress?: number
}

const props = defineProps<{
  modelValue?: FileInfo | FileInfo[] | string | string[]
  accept?: string
  maxSize?: number
  maxFiles?: number
  uploadUrl?: string
  downloadUrl?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FileInfo | FileInfo[] | string | string[]]
  'change': [files: FileInfo | FileInfo[]]
  'upload': [file: FileInfo]
}>()

const fileList = ref<FileInfo[]>([])
const isDragover = ref(false)
const fileInput = ref<HTMLInputElement>()

// 初始化
watch(() => props.modelValue, (value) => {
  if (value) {
    if (Array.isArray(value)) {
      fileList.value = value.map(v => typeof v === 'string' ? { name: v, url: v } : v)
    } else if (typeof value === 'string') {
      fileList.value = [{ name: value, url: value }]
    } else {
      fileList.value = [value]
    }
  } else {
    fileList.value = []
  }
}, { immediate: true })

function triggerSelect() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFiles(files)
  target.value = ''
}

function handleDragover() {
  isDragover.value = true
}

function handleDragleave() {
  isDragover.value = false
}

function handleDrop(event: DragEvent) {
  isDragover.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  handleFiles(files)
}

async function handleFiles(files: File[]) {
  // 验证文件数量
  if (props.maxFiles && fileList.value.length + files.length > props.maxFiles) {
    emit('update:modelValue', props.modelValue || [])
    return
  }

  for (const file of files) {
    // 验证文件大小
    if (props.maxSize && file.size > props.maxSize) {
      continue
    }

    // 验证文件类型
    if (props.accept && !matchType(file.type, props.accept)) {
      continue
    }

    const fileInfo: FileInfo = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploading: true,
      progress: 0
    }

    // 创建预览 URL
    if (file.type.startsWith('image/')) {
      fileInfo.preview = URL.createObjectURL(file)
    }

    fileList.value.push(fileInfo)

    // 如果有上传地址，执行上传
    if (props.uploadUrl) {
      await uploadFile(file, fileInfo)
    } else {
      // 否则直接使用本地文件
      fileInfo.url = fileInfo.preview
      fileInfo.uploading = false
      fileInfo.progress = 100
      emitChange()
    }
  }
}

async function uploadFile(file: File, fileInfo: FileInfo) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        fileInfo.progress = Math.round((event.loaded / event.total) * 100)
      }
    }

    xhr.onload = () => {
      fileInfo.uploading = false
      fileInfo.progress = 100
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          fileInfo.url = response.url || (props.downloadUrl || '') + '/' + response.id
          emitChange()
        } catch {
          fileInfo.url = props.downloadUrl || ''
          emitChange()
        }
      }
    }

    xhr.onerror = () => {
      fileInfo.uploading = false
      fileInfo.progress = 0
    }

    xhr.open('POST', props.uploadUrl || '', true)
    xhr.send(formData)
  } catch (error) {
    fileInfo.uploading = false
    console.error('Upload error:', error)
  }
}

function removeFile(index: number) {
  fileList.value.splice(index, 1)
  emitChange()
}

function emitChange() {
  const value = props.maxFiles === 1 
    ? (fileList.value[0] || null)
    : fileList.value
  
  emit('update:modelValue', value)
  emit('change', value)
}

function canPreview(type?: string): boolean {
  if (!type) return false
  return type.startsWith('image/') || type === 'application/pdf'
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️'
  if (type === 'application/pdf') return '📄'
  if (type.includes('word')) return '📝'
  if (type.includes('excel')) return '📊'
  if (type.includes('powerpoint')) return '📊'
  if (type.includes('zip') || type.includes('rar')) return '📦'
  return '📁'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

function formatAccept(accept: string): string {
  return accept
    .split(',')
    .map(a => a.trim().replace('.', '').toUpperCase())
    .join(', ')
}

function matchType(mimeType: string, accept: string): boolean {
  const accepts = accept.split(',').map(a => a.trim())
  for (const pattern of accepts) {
    if (pattern === mimeType) return true
    if (pattern === 'image/*' && mimeType.startsWith('image/')) return true
    if (pattern === 'video/*' && mimeType.startsWith('video/')) return true
    if (pattern === 'audio/*' && mimeType.startsWith('audio/')) return true
    if (pattern.startsWith('.') && mimeType.endsWith(pattern.slice(1))) return true
  }
  return false
}

function generateId(): string {
  return 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
}

defineExpose({
  clear: () => {
    fileList.value = []
    emitChange()
  },
  getFiles: () => fileList.value
})
</script>

<style scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.file-action {
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s;
}

.file-action:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-delete:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e8e8e8;
  border-radius: 2px;
  overflow: hidden;
  transition: width 0.3s;
}

.progress-bar {
  background: #1890ff;
}

.progress-text {
  font-size: 12px;
  color: #999;
  min-width: 35px;
}

.upload-area {
  position: relative;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #1890ff;
  background: #e6f7ff;
}

.upload-area.is-dragover {
  border-color: #1890ff;
  background: #e6f7ff;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.5;
}

.upload-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.has-error .upload-area {
  border-color: #ff4d4f;
}

.uploader-error {
  color: #ff4d4f;
  font-size: 12px;
}

@media (max-width: 768px) {
  .upload-area {
    padding: 24px 16px;
  }

  .upload-icon {
    font-size: 36px;
  }
}
</style>
