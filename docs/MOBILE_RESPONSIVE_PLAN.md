# 移动端适配改进计划

**版本:** v0.8.0
**日期:** 2026-03-25

---

## 一、现状分析

### 1.1 现有响应式支持

| 组件 | 响应式状态 | 断点 |
|-----|-----------|------|
| TreeLayout | ✅ 基础支持 | 768px |
| NavLayout | ✅ 基础支持 | 768px |
| FileUploader | ✅ 基础支持 | 768px |
| HeroSection | ✅ 基础支持 | 768px |
| ContentSection | ✅ 基础支持 | 768px |
| ListSection | ✅ 基础支持 | 768px |
| StatsSection | ✅ 基础支持 | 768px |
| ListEnhanced | ✅ 基础支持 | 768px |
| Entry.vue | ❌ 无支持 | - |
| App.vue | ❌ 无支持 | - |

### 1.2 存在的问题

1. **断点单一** - 仅支持 768px，缺少多断点支持
2. **组件不全** - 核心组件缺少响应式
3. **触摸优化不足** - 缺少触摸手势支持
4. **安全区域** - 未适配 iPhone 刘海屏
5. **字体适配** - 未根据屏幕大小调整

---

## 二、改进目标

### 2.1 响应式断点

```css
/* 多断点支持 */
:root {
  --breakpoint-xs: 375px;   /* 小手机 */
  --breakpoint-sm: 576px;   /* 大手机 */
  --breakpoint-md: 768px;   /* 平板 */
  --breakpoint-lg: 1024px;  /* 小屏电脑 */
  --breakpoint-xl: 1440px;  /* 大屏电脑 */
}
```

### 2.2 适配目标

| 设备类型 | 屏幕宽度 | 适配目标 |
|---------|---------|---------|
| 小手机 | 320-414px | ✅ 内容可读、操作可用 |
| 大手机 | 414-576px | ✅ 布局优化、体验良好 |
| 平板 | 576-1024px | ✅ 两栏布局、信息丰富 |
| 桌面 | 1024px+ | ✅ 多栏布局、完整功能 |

### 2.3 核心改进

- [ ] 全局响应式样式系统
- [ ] 核心组件移动端优化
- [ ] 触摸手势支持
- [ ] 安全区域适配
- [ ] 字体大小自适应

---

## 三、实施方案

### 3.1 全局响应式系统

#### 任务 1.1: CSS 变量系统

```css
/* src/styles/variables.css */
:root {
  /* 断点 */
  --breakpoint-xs: 375px;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;

  /* 间距 - 移动端更小 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字体大小 - 响应式 */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;

  /* 移动端优化 */
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);
  --safe-area-left: env(safe-area-inset-left);
  --safe-area-right: env(safe-area-inset-right);
}

/* 响应式字体 */
@media (max-width: 576px) {
  :root {
    --font-size-sm: 13px;
    --font-size-md: 15px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
  }
}
```

**预计工时:** 2 小时

---

#### 任务 1.2: 全局样式增强

```css
/* src/App.vue */
<style>
/* 基础设置 */
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* 允许表单输入 */
input, textarea, [contenteditable] {
  -webkit-user-select: auto;
  user-select: auto;
}

/* 安全区域适配 */
body {
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
}

/* 响应式容器 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

@media (max-width: 576px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
}

/* 响应式图片 */
img {
  max-width: 100%;
  height: auto;
}

/* 触摸优化 */
.touch-feedback {
  transition: transform 0.1s, opacity 0.1s;
}

.touch-feedback:active {
  transform: scale(0.98);
  opacity: 0.8;
}
</style>
```

**预计工时:** 2 小时

---

### 3.2 核心组件移动端优化

#### 任务 2.1: Entry.vue 响应式

```vue
<style scoped>
.entry-page {
  min-height: 100vh;
  padding: var(--spacing-md);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .entry-page {
    padding: var(--spacing-sm);
  }
  
  .loading-state, .error-state, .empty-state {
    padding: var(--spacing-lg);
  }
  
  .spinner {
    width: 32px;
    height: 32px;
  }
  
  .error-icon, .empty-icon {
    font-size: 36px;
  }
  
  h2 {
    font-size: var(--font-size-lg);
  }
  
  p {
    font-size: var(--font-size-sm);
  }
}
</style>
```

**预计工时:** 1 小时

---

#### 任务 2.2: SectionList 响应式

```vue
<style scoped>
.section-list {
  width: 100%;
}

.section-item {
  width: 100%;
  margin-bottom: var(--spacing-md);
}

/* 移动端减小间距 */
@media (max-width: 576px) {
  .section-item {
    margin-bottom: var(--spacing-sm);
  }
}
</style>
```

**预计工时:** 30 分钟

---

#### 任务 2.3: SchemaRenderer 响应式

```vue
<style scoped>
.form-mode {
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* 移动端全宽表单 */
@media (max-width: 576px) {
  .form-mode {
    max-width: 100%;
    padding: var(--spacing-md);
  }
  
  .form-title {
    font-size: var(--font-size-lg);
  }
  
  .form-description {
    font-size: var(--font-size-sm);
  }
}

/* 查看模式响应式 */
.simple-fields-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 576px) {
  .simple-fields-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>
```

**预计工时:** 1 小时

---

#### 任务 2.4: ObjectForm 响应式

```vue
<style scoped>
.form-simple {
  gap: var(--spacing-lg);
}

.form-actions {
  flex-direction: row;
  gap: var(--spacing-md);
}

/* 移动端按钮堆叠 */
@media (max-width: 576px) {
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    padding: 12px 20px;
  }
  
  .form-simple {
    gap: var(--spacing-md);
  }
}
</style>
```

**预计工时:** 30 分钟

---

#### 任务 2.5: ListRenderer 响应式

```vue
<style scoped>
/* 卡片布局响应式 */
.list-cards {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

@media (max-width: 576px) {
  .list-cards {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .card {
    padding: var(--spacing-md);
  }
}

/* 表格滚动 */
.list-table {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* 移动端按钮优化 */
@media (max-width: 576px) {
  .btn {
    padding: 14px 20px; /* 更大的点击区域 */
    font-size: var(--font-size-md);
  }
}
</style>
```

**预计工时:** 1 小时

---

#### 任务 2.6: ListEnhanced 响应式

```vue
<style scoped>
.list-toolbar {
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.search-box {
  flex: 1;
  min-width: 200px;
}

/* 移动端工具栏堆叠 */
@media (max-width: 576px) {
  .list-toolbar {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
    max-width: none;
    min-width: auto;
  }
  
  .toolbar-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-box {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
}

/* 分页优化 */
@media (max-width: 576px) {
  .pagination {
    flex-direction: column;
    align-items: center;
  }
  
  .page-numbers {
    display: none; /* 隐藏页码，只显示上下页 */
  }
}
</style>
```

**预计工时:** 1.5 小时

---

#### 任务 2.7: FileUploader 响应式

```vue
<style scoped>
.upload-area {
  padding: var(--spacing-xl);
}

/* 移动端减小上传区域 */
@media (max-width: 576px) {
  .upload-area {
    padding: var(--spacing-lg);
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .upload-text {
    font-size: var(--font-size-sm);
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
```

**预计工时:** 30 分钟

---

#### 任务 2.8: ThemeSwitcher 响应式

```vue
<style scoped>
.theme-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: auto;
  margin-top: 0;
  border-radius: 16px 16px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.theme-menu.show {
  transform: translateY(0);
}

/* 移动端底部弹窗 */
@media (max-width: 576px) {
  .theme-menu {
    max-width: 100%;
    min-width: auto;
  }
  
  .mode-btn {
    padding: 14px 16px; /* 更大的点击区域 */
  }
  
  .color-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
```

**预计工时:** 1 小时

---

### 3.3 触摸手势支持

#### 任务 3.1: 触摸指令

```typescript
// src/directives/touch.ts
export interface TouchOptions {
  onTap?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export const vTouch = {
  mounted(el: HTMLElement, options: TouchOptions) {
    let startX = 0
    let startY = 0
    let startTime = 0

    el.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startTime = Date.now()
    })

    el.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const diffX = endX - startX
      const diffY = endY - startY
      const diffTime = Date.now() - startTime
      const threshold = options.threshold || 50

      // 点击判断
      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && diffTime < 200) {
        options.onTap?.()
        return
      }

      // 滑动判断
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          diffX > 0 ? options.onSwipeRight?.() : options.onSwipeLeft?.()
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          diffY > 0 ? options.onSwipeDown?.() : options.onSwipeUp?.()
        }
      }
    })
  }
}
```

**预计工时:** 2 小时

---

#### 任务 3.2: 下拉刷新

```typescript
// src/composables/usePullToRefresh.ts
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const isPulling = ref(false)

  function handleTouchStart(e: TouchEvent) {
    if (window.scrollY === 0) {
      isPulling.value = true
      pullDistance.value = 0
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isPulling.value) return
    pullDistance.value = e.touches[0].clientY * 0.3
  }

  async function handleTouchEnd() {
    if (!isPulling.value) return
    isPulling.value = false

    if (pullDistance.value > 80) {
      isRefreshing.value = true
      await onRefresh()
      isRefreshing.value = false
    }
    pullDistance.value = 0
  }

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
```

**预计工时:** 3 小时

---

### 3.4 移动端导航优化

#### 任务 4.1: 底部导航栏组件

```vue
<!-- components/BottomNav.vue -->
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
  padding-bottom: var(--safe-area-bottom);
  z-index: 100;
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
  transition: color 0.3s;
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 11px;
}

/* 桌面端隐藏 */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
</style>
```

**预计工时:** 2 小时

---

#### 任务 4.2: 移动端汉堡菜单

```vue
<!-- components/HamburgerMenu.vue -->
<template>
  <div class="hamburger-menu">
    <button class="hamburger-btn" @click="toggleMenu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <Teleport to="body">
      <Transition name="slide">
        <div v-if="isOpen" class="menu-overlay" @click="closeMenu">
          <nav class="mobile-menu" @click.stop>
            <a
              v-for="(link, index) in links"
              :key="index"
              :href="link.url"
              class="menu-link"
              @click="closeMenu"
            >
              {{ link.title }}
            </a>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  links: Array<{ title: string; url: string }>
}>()

const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}
</script>

<style scoped>
.hamburger-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger-btn span {
  width: 24px;
  height: 2px;
  background: var(--text-color);
  transition: all 0.3s;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  background: var(--bg-color-elevated);
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + var(--safe-area-top));
}

.menu-link {
  display: block;
  padding: var(--spacing-md) 0;
  color: var(--text-color);
  text-decoration: none;
  font-size: var(--font-size-lg);
  border-bottom: 1px solid var(--border-color);
}

/* 移动端显示 */
@media (max-width: 768px) {
  .hamburger-btn {
    display: flex;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

**预计工时:** 2 小时

---

## 四、时间估算

| 任务 | 工时 |
|-----|------|
| 全局响应式系统 | 4 小时 |
| 核心组件优化 | 7 小时 |
| 触摸手势支持 | 5 小时 |
| 移动端导航 | 4 小时 |
| 测试与调优 | 4 小时 |
| **总计** | **24 小时 (3 个工作日)** |

---

## 五、验收标准

### 5.1 功能验收

- [ ] 所有页面在 320px 宽度下可用
- [ ] 所有表单在移动端可操作
- [ ] 所有列表在移动端可读
- [ ] 触摸反馈明显
- [ ] 下拉刷新可用

### 5.2 性能验收

- [ ] 移动端首屏加载 < 3s
- [ ] 触摸响应 < 100ms
- [ ] 滚动流畅 60fps

### 5.3 体验验收

- [ ] 点击区域 ≥ 44px
- [ ] 字体大小 ≥ 14px
- [ ] 对比度符合 WCAG 标准
- [ ] 安全区域正确适配

---

## 六、测试设备

| 设备 | 屏幕宽度 | 优先级 |
|-----|---------|-------|
| iPhone SE | 320px | ⭐⭐⭐ |
| iPhone 12 | 390px | ⭐⭐⭐ |
| iPhone 12 Pro Max | 428px | ⭐⭐ |
| iPad | 768px | ⭐⭐ |
| Desktop | 1440px | ⭐⭐ |

---

## 七、优先级

### P0 (必须)

1. 全局响应式样式系统
2. Entry.vue 响应式
3. 核心组件移动端优化
4. 触摸反馈优化

### P1 (重要)

1. 触摸手势支持
2. 底部导航栏
3. 安全区域适配

### P2 (可选)

1. 下拉刷新
2. 汉堡菜单
3. 动画优化

---

**计划制定:** AI Assistant
**执行周期:** 3-5 个工作日
