<template>
  <div class="tree-layout">
    <!-- 侧边栏树 -->
    <aside class="tree-sidebar">
      <div class="tree-header">{{ data?.title || '菜单' }}</div>
      <div class="tree-nodes">
        <TreeNode
          v-for="(node, index) in nodes"
          :key="index"
          :node="node"
          :depth="0"
          :active="activeNode === node"
          @select="handleSelect(node)"
          @expand="handleExpand(node)"
        />
      </div>
    </aside>

    <!-- 内容区域 -->
    <main class="tree-main">
      <div class="tree-content">
        <!-- 列表数据（包含 items）→ 使用 ObjectList 渲染 -->
        <ObjectList
          v-if="contentData?.items"
          :schema="contentData._schema || {}"
          :data="contentData"
        />
        <!-- 对象数据 -->
        <div v-else-if="contentData" class="data-view">
          <h3 v-if="contentData.title">{{ contentData.title }}</h3>
          <pre v-else>{{ JSON.stringify(contentData, null, 2) }}</pre>
        </div>
        <!-- 默认提示 -->
        <div v-else class="empty-view">
          <p>请选择一个节点</p>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataObject } from '@/types'
import ObjectList from './ObjectList.vue'
import TreeNode from './TreeNode.vue'
const props = defineProps<{ data: DataObject | null }>()
const activeNode = ref<any>(null)
const contentUrl = ref<string>('')
const contentData = ref<Record<string, any> | null>(null)
const nodes = computed(() => props.data?.nodes || [])
async function handleSelect(node: any) {
  console.log('Select node:', node)
  activeNode.value = node
  // content 是字符串（URL）→ fetch 数据
  if (typeof node.content === 'string') {
    let url = node.content
    // 确保 URL 以 /api/ 开头
    if (!url.startsWith('/api/')) {
      url = '/api' + (url.startsWith('/') ? url : '/' + url)
    }
    url = url.replace('.json', '')
    console.log('Fetch URL:', url + '.json')
    contentUrl.value = url
    contentData.value = null
    try {
      const response = await fetch(url + '.json')
      console.log('Response status:', response.status)
      if (response.ok) {
        contentData.value = await response.json()
        console.log('Content data:', contentData.value)
      }
    } catch (e) {
      console.error('Load content error:', e)
    }
  }
  // content 是对象 → 显示数据
  else if (node.content) {
    contentUrl.value = ''
    contentData.value = node.content
  }
}
function handleExpand(node: any) {
  // 空数组表示可动态加载，这里可以触发 API 加载子节点
  if (node.children && node.children.length === 0 && !node._loaded) {
    console.log('Expand node, load children:', node)
    // TODO: 调用 API 加载子节点
    node._loaded = true
  }
}
// 初始化：选择第一个节点
if (nodes.value.length > 0 && nodes.value[0].content) {
  handleSelect(nodes.value[0])
}
</script>
<style scoped>
.tree-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}
.tree-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}
.tree-header {
  padding: 20px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}
.tree-nodes {
  flex: 1;
  padding: 8px 0;
  overflow: auto;
}
.tree-main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
.tree-content {
  background: #fff;
  border-radius: 8px;
  min-height: 500px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.data-view, .empty-view {
  padding: 24px;
}
.data-view pre {
  margin: 0;
  font-size: 12px;
  color: #666;
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
}
.empty-view {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  min-height: 500px;
}
@media (max-width: 768px) {
  .tree-sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }
  .tree-layout {
    flex-direction: column;
  }
  .tree-main {
    padding: 16px;
  }
}
</style>
