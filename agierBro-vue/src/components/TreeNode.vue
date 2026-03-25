<template>
  <div class="tree-node">
    <div
      :class="['node-content', { active, 'has-children': hasChildren }]"
      :style="{ paddingLeft: depth * 16 + 8 + 'px' }"
      @click="handleClick"
    >
      <!-- 展开/折叠图标 -->
      <span v-if="hasChildren" class="node-expand" @click.stop="toggleExpand">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span v-else class="node-indent"></span>
      
      <!-- 图标 -->
      <span v-if="node.icon" class="node-icon">{{ node.icon }}</span>
      
      <!-- 标题 -->
      <span class="node-title">{{ node.title }}</span>
    </div>
    
    <!-- 子节点 -->
    <div v-if="expanded && hasChildren" class="node-children">
      <TreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :depth="depth + 1"
        :active="false"
        @select="$emit('select', $event)"
        @expand="$emit('expand', $event)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types'
const props = defineProps<{
  node: TreeNode
  depth: number
  active: boolean
}>()
const emit = defineEmits<{
  select: [node: TreeNode]
  expand: [node: TreeNode]
}>()
const expanded = ref(false)
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})
function handleClick() {
  console.log('TreeNode clicked:', props.node)
  emit('select', props.node)
}
function toggleExpand() {
  expanded.value = !expanded.value
  console.log('TreeNode expanded:', expanded.value, props.node)
  if (expanded.value && props.node.children && props.node.children.length === 0) {
    emit('expand', props.node)
  }
}
</script>
<style scoped>
.tree-node {
  user-select: none;
}
.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.node-content:hover {
  background: #f5f5f5;
}
.node-content.active {
  background: #e6f7ff;
  color: #1890ff;
}
.node-expand {
  width: 16px;
  font-size: 10px;
  color: #999;
  cursor: pointer;
}
.node-indent {
  width: 16px;
}
.node-icon {
  font-size: 16px;
}
.node-title {
  font-size: 14px;
  flex: 1;
}
.node-children {
  background: #fafafa;
}
</style>
