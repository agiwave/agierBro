<template>
  <div class="theme-switcher">
    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="handleToggle" :title="`切换到${isDarkTheme ? '亮色' : '暗色'}模式`">
      <span v-if="isDarkTheme" class="theme-icon">☀️</span>
      <span v-else class="theme-icon">🌙</span>
    </button>

    <!-- 主题菜单（可选） -->
    <div v-if="showMenu" class="theme-menu">
      <div class="menu-section">
        <span class="menu-label">主题模式</span>
        <div class="menu-options">
          <button
            :class="['mode-btn', { active: themeMode === 'light' }]"
            @click="setThemeMode('light')"
          >
            ☀️ 亮色
          </button>
          <button
            :class="['mode-btn', { active: themeMode === 'dark' }]"
            @click="setThemeMode('dark')"
          >
            🌙 暗色
          </button>
          <button
            :class="['mode-btn', { active: themeMode === 'system' }]"
            @click="setThemeMode('system')"
          >
            💻 系统
          </button>
        </div>
      </div>

      <div v-if="showColorPicker" class="menu-section">
        <span class="menu-label">主题色</span>
        <div class="color-options">
          <button
            v-for="color in presetColors"
            :key="color"
            class="color-btn"
            :style="{ background: color }"
            @click="setPrimaryColor(color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const props = defineProps<{
  showMenu?: boolean
  showColorPicker?: boolean
}>()

const { initTheme, toggleTheme, isDark, getThemeMode, setThemeMode, setPrimaryColor } = useTheme()

const themeMode = ref<'light' | 'dark' | 'system'>('light')
const isDarkTheme = computed(() => isDark())

const presetColors = [
  '#1890ff', // 蓝色
  '#52c41a', // 绿色
  '#fa541c', // 橙色
  '#722ed1', // 紫色
  '#eb2f96', // 粉色
  '#13c2c2'  // 青色
]

onMounted(() => {
  initTheme()
  themeMode.value = getThemeMode()
})

function handleToggle() {
  const next = toggleTheme()
  themeMode.value = next
}
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
}

.theme-toggle {
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: #f5f5f5;
  border-color: #1890ff;
}

.theme-icon {
  display: block;
}

/* 主题菜单 */
.theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  z-index: 1000;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-btn {
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: all 0.3s;
}

.mode-btn:hover {
  background: #e8e8e8;
}

.mode-btn.active {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn:active {
  border-color: #333;
}

/* 暗色主题适配 */
:root[data-theme="dark"] .theme-menu {
  background: #1f1f1f;
  border-color: #303030;
}

:root[data-theme="dark"] .mode-btn {
  background: #2b2b2b;
  color: #ccc;
}

:root[data-theme="dark"] .mode-btn:hover {
  background: #3a3a3a;
}

:root[data-theme="dark"] .mode-btn.active {
  background: #111a2c;
  border-color: #177ddc;
  color: #177ddc;
}
</style>
