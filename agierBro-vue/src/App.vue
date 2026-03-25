<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import '@/styles/responsive.css'

const { initTheme } = useTheme()

onMounted(() => {
  // 初始化主题
  initTheme()
})
</script>

<style>
/* CSS 变量定义 */
:root {
  /* 主题色 */
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --primary-active: #096dd9;

  /* 圆角 */
  --border-radius: 4px;
  --border-radius-lg: 8px;
  --border-radius-sm: 2px;

  /* 亮色主题变量 */
  --bg-color: #f5f5f5;
  --bg-color-secondary: #fafafa;
  --bg-color-elevated: #ffffff;
  --text-color: #333333;
  --text-color-secondary: #666666;
  --text-color-placeholder: #999999;
  --border-color: #e8e8e8;
  --border-color-hover: #d9d9d9;
  --shadow-color: rgba(0, 0, 0, 0.08);
  --mask-color: rgba(0, 0, 0, 0.45);
}

/* 暗色主题变量 */
:root[data-theme="dark"] {
  --bg-color: #141414;
  --bg-color-secondary: #1f1f1f;
  --bg-color-elevated: #262626;
  --text-color: #e5e5e5;
  --text-color-secondary: #bfbfbf;
  --text-color-placeholder: #666666;
  --border-color: #303030;
  --border-color-hover: #434343;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --mask-color: rgba(0, 0, 0, 0.65);
}

/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}

#app {
  min-height: 100vh;
}

/* 通用样式 */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--primary-hover);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-color-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color-hover);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-color-placeholder);
}

/* 选中文本 */
::selection {
  background: var(--primary-color);
  color: #fff;
}
</style>
