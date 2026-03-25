<template>
  <nav class="bottom-nav">
    <a
      v-for="(item, index) in items"
      :key="index"
      :class="['nav-item', { active: activeIndex === index }]"
      @click="handleClick(item, index)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface NavItem {
  icon: string
  label: string
  url: string
}

const props = defineProps<{
  items: NavItem[]
}>()

const router = useRouter()
const activeIndex = ref(0)

function handleClick(item: NavItem, index: number) {
  activeIndex.value = index
  router.push(item.url)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-color-elevated);
  border-top: 1px solid var(--border-color);
  display: flex;
  padding-bottom: var(--safe-area-bottom, 0);
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-color-secondary);
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
  opacity: 0.7;
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-label {
  font-size: 11px;
  white-space: nowrap;
}

/* 桌面端隐藏 */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
</style>
