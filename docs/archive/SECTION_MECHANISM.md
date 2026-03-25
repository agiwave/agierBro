# Section 机制

**通用页面区块渲染机制**

---

## 概述

Section 机制是一种通用的页面区块渲染方案，用于构建由多个区块组成的复合页面（如首页）。

**核心思想：**
- 页面由多个 Section 组成
- 每个 Section 通过 `_schema` 类型标识
- 使用组件注册系统动态加载
- 完全通用，无硬编码

---

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    Entry.vue (统一入口)                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  判断数据类型         │
              │  - isNav?            │
              │  - isSectionList?    │
              │  - isItemList?       │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  SectionList         │
              │  (遍历 items)        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  SectionRenderer     │
              │  (动态组件)          │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  注册表查找组件       │
              │  - @hero → SectionHero    │
              │  - @stats → SectionStats  │
              └──────────────────────┘
```

---

## 核心组件

### 1. SectionRenderer

**动态组件渲染器**

```vue
<template>
  <component :is="component" :data="data" />
</template>

<script setup>
const component = computed(() => {
  const schema = props.data._schema
  // 从注册表获取组件
  return getSectionComponent(schema) || SectionDefault
})
</script>
```

### 2. SectionList

**Section 列表容器**

```vue
<template>
  <div class="section-list">
    <SectionRenderer
      v-for="(item, index) in items"
      :key="index"
      :data="item"
    />
  </div>
</template>
```

### 3. 组件注册系统

```typescript
// useSectionRegistry.ts
const sectionRegistry = new Map<string, any>()

export function registerSections(sections: Record<string, any>) {
  Object.entries(sections).forEach(([type, component]) => {
    sectionRegistry.set(type, component)
  })
}

export function getSectionComponent(type: string): any {
  return sectionRegistry.get(type) || null
}
```

---

## 内置 Section 类型

| 类型 | 组件 | 说明 |
|-----|------|------|
| `@nav` | SectionNav | 导航栏 |
| `@hero` | SectionHero | 主视觉区域 |
| `@stats` | SectionStats | 数据统计 |
| `@features` | SectionFeatures | 功能特性 |
| `@cta` | SectionCta | 行动号召 |
| `@footer` | SectionFooter | 页脚 |
| `@content` | SectionContent | 内容展示 |
| `@list` | SectionList | 列表展示 |

---

## 使用指南

### 后端 API

返回包含 `items` 数组的数据：

```json
{
  "items": [
    {
      "_schema": "@nav",
      "title": "网站名称",
      "links": [
        { "title": "首页", "url": "/" },
        { "title": "关于", "url": "/about" }
      ]
    },
    {
      "_schema": "@hero",
      "title": "欢迎标题",
      "subtitle": "副标题",
      "description": "描述文字",
      "actions": [
        { "title": "开始", "url": "/start", "variant": "primary" }
      ]
    },
    {
      "_schema": "@stats",
      "items": [
        { "number": "10,000+", "label": "用户" },
        { "number": "99.9%", "label": "可用性" }
      ]
    }
  ]
}
```

### 前端注册

在 `main.ts` 中注册 Section 组件：

```typescript
import { registerSections } from './composables/useSectionRegistry'
import { SectionNav, SectionHero, ... } from './components/sections'

registerSections({
  '@nav': SectionNav,
  '@hero': SectionHero,
  '@stats': SectionStats,
  // ...
})
```

### 自定义 Section

1. **创建组件**

```vue
<!-- SectionCustom.vue -->
<template>
  <section class="section section-custom">
    <h2>{{ data.title }}</h2>
    <div v-for="item in data.items" :key="item.id">
      {{ item.name }}
    </div>
  </section>
</template>

<script setup>
defineProps<{ data: any }>()
</script>
```

2. **注册组件**

```typescript
registerSections({
  '@custom': SectionCustom
})
```

3. **API 使用**

```json
{
  "items": [
    {
      "_schema": "@custom",
      "title": "自定义区块",
      "items": [{ "id": 1, "name": "项目 1" }]
    }
  ]
}
```

---

## 识别逻辑

Entry.vue 自动识别 Section 列表：

```typescript
// Section 列表：items 数组且每个元素都有 _schema
const isSectionList = computed(() => {
  const items = data.value?.items
  if (!items || items.length === 0) return false
  return items.every((item: any) => item._schema)
})

// 普通列表：items 数组但元素没有 _schema
const isItemList = computed(() => {
  const items = data.value?.items
  if (!items || items.length === 0) return false
  return !items.every((item: any) => item._schema)
})
```

---

## 示例：完整首页

### API 响应 (`/api/index.json`)

```json
{
  "items": [
    {
      "_schema": "@nav",
      "icon": "📑",
      "title": "论文评审系统",
      "links": [
        { "icon": "🏠", "title": "首页", "url": "/" },
        { "icon": "👤", "title": "登录", "url": "/auth/login" }
      ]
    },
    {
      "_schema": "@hero",
      "title": "论文评审系统",
      "subtitle": "高效、专业、智能的学术评审平台",
      "description": "连接编辑与评审专家，简化论文评审流程",
      "actions": [
        { "title": "立即登录", "url": "/auth/login", "variant": "primary" },
        { "title": "免费注册", "url": "/auth/register", "variant": "secondary" }
      ]
    },
    {
      "_schema": "@stats",
      "items": [
        { "number": "10,000+", "label": "注册论文" },
        { "number": "500+", "label": "评审专家" },
        { "number": "98%", "label": "按时完成率" }
      ]
    },
    {
      "_schema": "@features",
      "title": "核心功能",
      "items": [
        {
          "icon": "📄",
          "title": "论文管理",
          "description": "便捷的论文提交、跟踪和管理系统",
          "link": { "title": "编辑后台 →", "url": "/editor" }
        }
      ]
    },
    {
      "_schema": "@footer",
      "copyright": "© 2024 论文评审系统",
      "links": [
        { "title": "关于我们", "url": "/about" }
      ]
    }
  ]
}
```

### 渲染结果

```
┌─────────────────────────────────────┐
│ [导航栏] 论文评审系统    首页 登录   │
├─────────────────────────────────────┤
│ [Hero]                              │
│ 论文评审系统                         │
│ 高效、专业、智能的学术评审平台       │
│ [立即登录] [免费注册]               │
├─────────────────────────────────────┤
│ [Stats]                             │
│ 10,000+   500+   98%                │
│ 注册论文  评审专家 按时完成率        │
├─────────────────────────────────────┤
│ [Features] 核心功能                 │
│ ┌─────────┐ ┌─────────┐            │
│ │ 📄      │ │ ...     │            │
│ │ 论文管理 │ │         │            │
│ └─────────┘ └─────────┘            │
├─────────────────────────────────────┤
│ [Footer] © 2024 论文评审系统  关于我们│
└─────────────────────────────────────┘
```

---

## 优势

### 1. 完全通用

- 无硬编码组件
- 通过注册表动态加载
- 支持自定义扩展

### 2. 业务无关

- 前端不关心业务逻辑
- 后端定义页面结构
- 通过 `_schema` 解耦

### 3. 易于维护

- 组件职责单一
- 新增 Section 无需修改核心代码
- 类型安全（可选）

---

## 最佳实践

### 1. Section 设计原则

- **单一职责**：每个 Section 只负责一种展示
- **数据驱动**：通过 `data` prop 传递数据
- **样式隔离**：使用 `scoped` 样式
- **响应式**：支持移动端

### 2. 命名规范

- 组件名：`SectionXxx.vue`
- Schema 类型：`@xxx`
- 样式前缀：`.section-xxx`

### 3. 性能优化

```typescript
// 懒加载 Section 组件
const SectionLarge = defineAsyncComponent(() =>
  import('./SectionLarge.vue')
)

registerSections({
  '@large': SectionLarge
})
```

---

## 迁移指南

### 从 HomePage.vue 迁移

**之前：**
```vue
<!-- HomePage.vue - 硬编码 -->
<component
  v-for="(item, index) in items"
  :is="getComponent(item._schema)"
  :data="item"
/>

function getComponent(schema) {
  return {
    '@nav': NavLayout,
    '@hero': HeroSection,
    // ... 硬编码
  }[schema]
}
```

**现在：**
```vue
<!-- SectionList.vue - 通用 -->
<SectionRenderer
  v-for="(item, index) in items"
  :data="item"
/>

<!-- 组件在 main.ts 注册 -->
registerSections({
  '@nav': SectionNav,
  '@hero': SectionHero,
  // ...
})
```

---

**许可:** MIT
