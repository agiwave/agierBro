# 移动端使用指南

**版本:** v0.6.2
**日期:** 2026-03-25

---

## 一、快速开始

### 1.1 响应式已自动生效

所有组件已自动支持移动端，无需额外配置。

```vue
<!-- 自动适配手机、平板、桌面 -->
<template>
  <Entry />
</template>
```

### 1.2 触摸手势

```vue
<template>
  <!-- 点击 -->
  <div v-touch="{ onTap: handleTap }">
    点击我
  </div>

  <!-- 滑动 -->
  <div v-touch="{ 
    onSwipeLeft: next,
    onSwipeRight: prev
  }">
    滑动切换
  </div>

  <!-- 长按 -->
  <button v-longpress="showMenu">
    长按菜单
  </button>
</template>

<script setup>
function handleTap() {
  console.log(' tapped!')
}

function next() {
  console.log('swiped left')
}

function prev() {
  console.log('swiped right')
}

function showMenu() {
  console.log('long pressed')
}
</script>
```

### 1.3 底部导航

```vue
<template>
  <!-- 仅在移动端显示 -->
  <BottomNav 
    v-if="isMobile"
    :items="[
      { icon: '🏠', label: '首页', url: '/' },
      { icon: '📋', label: '列表', url: '/list' },
      { icon: '👤', label: '我的', url: '/profile' }
    ]"
  />
</template>

<script setup>
import { computed } from 'vue'
import BottomNav from '@/components/BottomNav.vue'

const isMobile = computed(() => window.innerWidth < 768)
</script>
```

---

## 二、响应式断点

| 断点 | 屏幕宽度 | 设备类型 |
|-----|---------|---------|
| XS | < 375px | 小手机 |
| SM | 375-576px | 大手机 |
| MD | 576-768px | 小平板 |
| LG | 768-1024px | 大平板/小电脑 |
| XL | > 1024px | 桌面电脑 |

---

## 三、移动端优化特性

### 3.1 触摸优化

- ✅ 点击区域最小 44px
- ✅ 触摸反馈动画
- ✅ 防止误触
- ✅ 滑动流畅

### 3.2 字体适配

```css
/* 自动根据屏幕调整 */
--font-size-xs: 11-12px
--font-size-sm: 13-14px
--font-size-md: 15-16px
--font-size-lg: 17-18px
--font-size-xl: 22-24px
```

### 3.3 间距适配

```css
/* 移动端更小间距 */
--spacing-md: 12px  (桌面 16px)
--spacing-lg: 16px  (桌面 24px)
--spacing-xl: 24px  (桌面 32px)
```

### 3.4 安全区域

```css
/* 自动适配 iPhone 刘海屏 */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## 四、组件移动端行为

### 4.1 表单组件

**桌面端:**
- 双列布局
- 横向按钮

**移动端:**
- 单列布局
- 全宽按钮
- 更大输入框 (防止 iOS 缩放)

### 4.2 列表组件

**桌面端:**
- 表格布局 (> 4 字段)
- 卡片布局 (2-4 字段)

**移动端:**
- 表格可横向滚动
- 卡片单列显示
- 更大点击区域

### 4.3 Section 组件

**桌面端:**
- 完整内容显示
- 多列网格

**移动端:**
- 单列显示
- 缩小字体和间距
- 内容自适应

---

## 五、最佳实践

### 5.1 避免固定宽度

```vue
<!-- ❌ 不好 -->
<div style="width: 500px">

<!-- ✅ 好 -->
<div class="container">
```

### 5.2 使用 CSS 变量

```vue
<!-- ❌ 不好 -->
<div style="padding: 24px">

<!-- ✅ 好 -->
<div :style="{ padding: 'var(--spacing-lg)' }">
```

### 5.3 响应式图片

```vue
<!-- ✅ 自动适配 -->
<img src="image.jpg" alt="" />

<style scoped>
img {
  max-width: 100%;
  height: auto;
}
</style>
```

### 5.4 触摸友好

```vue
<!-- ✅ 添加触摸反馈 -->
<button class="touch-feedback">
  点击我
</button>
```

---

## 六、测试设备

| 设备 | 屏幕宽度 | 测试状态 |
|-----|---------|---------|
| iPhone SE | 320px | ✅ |
| iPhone 12 | 390px | ✅ |
| iPhone 12 Pro Max | 428px | ✅ |
| iPad | 768px | ✅ |
| Desktop | 1440px | ✅ |

---

## 七、常见问题

### Q1: 如何禁用移动端？

```vue
<template>
  <div class="desktop-only">
    仅在桌面显示
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}
</style>
```

### Q2: 如何检测移动设备？

```typescript
import { ref, onMounted } from 'vue'

export function useDeviceType() {
  const isMobile = ref(false)

  onMounted(() => {
    isMobile.value = window.innerWidth < 768
    
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth < 768
    })
  })

  return { isMobile }
}
```

### Q3: 如何优化移动端性能？

1. 使用 `will-change` 属性
2. 避免大量 DOM 操作
3. 使用虚拟滚动
4. 图片懒加载

---

## 八、更新日志

### v0.6.2 (2026-03-25)

- ✅ 全局响应式样式系统
- ✅ 触摸手势指令
- ✅ 底部导航组件
- ✅ 核心组件移动端优化
- ✅ 安全区域适配

---

**相关文档:**
- [移动端适配计划](./MOBILE_RESPONSIVE_PLAN.md)
- [响应式样式](../agierBro-vue/src/styles/responsive.css)
