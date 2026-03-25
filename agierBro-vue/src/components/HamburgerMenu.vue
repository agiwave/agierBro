<template>
  <div class="hamburger-menu">
    <button class="hamburger-btn" @click="toggleMenu" :aria-label="t('toggleMenu')">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" class="menu-overlay" @click="closeMenu"></div>
      </Transition>

      <Transition name="slide">
        <nav v-if="isOpen" class="mobile-menu" @click.stop>
          <div class="menu-header">
            <span class="menu-title">{{ title || t('menu') }}</span>
            <button class="menu-close" @click="closeMenu" :aria-label="t('close')">×</button>
          </div>

          <div class="menu-content">
            <a
              v-for="(link, index) in links"
              :key="index"
              :href="link.url"
              class="menu-link"
              @click="handleLinkClick(link)"
            >
              <span v-if="link.icon" class="menu-icon">{{ link.icon }}</span>
              {{ link.title }}
            </a>
          </div>

          <!-- 底部额外内容 -->
          <div v-if="$slots.footer" class="menu-footer">
            <slot name="footer"></slot>
          </div>
        </nav>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Link {
  title: string
  url: string
  icon?: string
  onClick?: () => void
}

const props = defineProps<{
  links: Link[]
  title?: string
}>()

const emit = defineEmits<{
  linkClick: [link: Link]
}>()

const router = useRouter()
const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function handleLinkClick(link: Link) {
  emit('linkClick', link)
  
  if (link.onClick) {
    link.onClick()
  } else {
    router.push(link.url)
  }
  
  closeMenu()
}

// 简单的国际化
function t(key: string): string {
  const translations: Record<string, string> = {
    toggleMenu: '切换菜单',
    menu: '菜单',
    close: '关闭'
  }
  return translations[key] || key
}

// 暴露方法
defineExpose({
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false },
  toggle: toggleMenu
})
</script>

<style scoped>
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 101;
}

.hamburger-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-color);
  transition: all 0.3s;
  border-radius: 1px;
}

/* 打开动画 */
.hamburger-btn.open span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger-btn.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.open span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  background: var(--bg-color-elevated);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + var(--safe-area-top, 0));
  border-bottom: 1px solid var(--border-color);
}

.menu-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-color);
}

.menu-close {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.menu-close:hover {
  background: var(--bg-color-secondary);
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-color);
  text-decoration: none;
  font-size: var(--font-size-md);
  transition: background 0.2s, color 0.2s;
  min-height: 48px;
}

.menu-link:hover {
  background: var(--bg-color-secondary);
  color: var(--primary-color);
}

.menu-link:active {
  background: var(--bg-color-secondary);
}

.menu-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.menu-footer {
  padding: var(--spacing-lg);
  padding-bottom: calc(var(--spacing-lg) + var(--safe-area-bottom, 0));
  border-top: 1px solid var(--border-color);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* 移动端显示 */
@media (max-width: 768px) {
  .hamburger-btn {
    display: flex;
  }
}
</style>
