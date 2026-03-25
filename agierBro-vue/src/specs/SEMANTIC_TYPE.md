# AgierBro 语义类型规范

**版本:** 3.1  
**最后更新:** 2026-03-24

---

## 概述

**Semantic Type（语义类型）** 用于标识数据或字段的用途，前端根据语义类型选择合适的渲染方式。

### 设计原则

1. **统一语义类型** - Builtin Schema 和 Semantic Type 统一为一个体系
2. **分层设计** - 根据渲染方式分为特殊交互、区块渲染、字段渲染
3. **可扩展** - 易于添加新的语义类型

---

## 语义类型体系

```typescript
type SemanticType =
  // ========== 特殊交互（需要前端特殊处理） ==========
  // 这些类型有固定的交互逻辑和 UI 模式
  | '@nav'        // 导航（链接跳转）
  | '@tree'       // 树形（节点展开/收起）
  | '@tabs'       // 标签页（内容切换）
  
  // ========== 页面区块（通用 Section 渲染） ==========
  // 这些类型用于页面区块，有预定义的 Section 组件
  | 'hero'        // Hero 区域
  | 'stats'       // 统计数据
  | 'features'    // 功能列表
  | 'cta'         // 行动号召
  | 'footer'      // 页脚
  | 'navigation'  // 导航数据
  | 'content'     // 内容区块
  | 'list'        // 列表区块
  
  // ========== 字段语义（字段级渲染优化） ==========
  // 这些类型用于字段，提示前端优化显示
  | 'id'          // 标识符
  | 'title'       // 标题
  | 'name'        // 名称
  | 'description' // 描述
  | 'status'      // 状态
  | 'amount'      // 金额
  | 'date'        // 日期
  | 'time'        // 时间
  | 'email'       // 邮箱
  | 'phone'       // 电话
  | 'url'         // 链接
  | 'image'       // 图片
  | 'file'        // 文件
  | 'user'        // 用户
  | 'category'    // 分类
  | 'tag'         // 标签
  | 'action'      // 操作按钮
  | 'link'        // 链接
```

---

## 分层设计

### Layer 1: 特殊交互语义

**特点:**
- 有固定交互逻辑
- UI 模式固定
- 前端特殊处理

| 语义类型 | 交互 | 组件 |
|---------|------|------|
| `@nav` | 导航链接跳转 | NavLayout |
| `@tree` | 节点展开/收起 | TreeLayout |
| `@tabs` | 标签内容切换 | TabsLayout |

**数据示例:**
```json
{
  "_schema": "@nav",
  "title": "导航栏",
  "links": [
    { "title": "首页", "url": "/" }
  ]
}
```

---

### Layer 2: 页面区块语义

**特点:**
- 用于页面区块
- 有预定义 Section 组件
- 通用渲染逻辑

| 语义类型 | 用途 | 组件 |
|---------|------|------|
| `hero` | Hero 区域 | HeroSection |
| `stats` | 统计数据 | StatsSection |
| `features` | 功能列表 | FeaturesSection |
| `cta` | 行动号召 | CtaSection |
| `footer` | 页脚 | FooterSection |
| `navigation` | 导航数据 | NavSection |
| `content` | 内容区块 | ContentSection |
| `list` | 列表区块 | ListSection |

**数据示例:**
```json
{
  "_schema": {
    "type": "object",
    "semantic": "hero"
  },
  "title": "论文评审系统",
  "subtitle": "高效、专业、智能的学术评审平台",
  "actions": [...]
}
```

---

### Layer 3: 字段语义

**特点:**
- 用于字段级别
- 提示前端优化显示
- 不影响整体结构

| 语义类型 | 渲染优化 |
|---------|---------|
| `id` | 等宽字体 |
| `title` | 加粗显示 |
| `status` | 状态标签 |
| `amount` | 货币格式化 |
| `email` | 邮件链接 |
| `phone` | 电话链接 |
| `date` | 日期格式化 |
| `url` | 超链接 |
| `image` | 图片显示 |
| `file` | 文件下载 |

**数据示例:**
```json
{
  "_schema": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "semantic": "email"
      },
      "status": {
        "type": "string",
        "semantic": "status"
      },
      "amount": {
        "type": "number",
        "semantic": "amount"
      }
    }
  }
}
```

---

## 渲染决策树

```
数据加载
    ↓
获取 _schema.semantic
    ↓
判断语义类型层级
    ├── 特殊交互 (@nav/@tree/@tabs)
    │   └── 特殊组件 (NavLayout/TreeLayout/TabsLayout)
    │
    ├── 页面区块 (hero/stats/features...)
    │   └── Section 组件 (HeroSection/StatsSection...)
    │
    └── 无/字段语义
        └── 通用渲染 (SectionBlock/SchemaRenderer)
```

---

## 使用指南

### 1. 特殊交互场景

```json
{
  "_schema": "@nav",
  "title": "导航栏",
  "links": [...]
}
```

**说明:** 使用 `@nav` 标识导航结构，前端使用 NavLayout 渲染

---

### 2. 页面区块场景

```json
{
  "items": [
    {
      "_schema": {
        "type": "object",
        "semantic": "hero"
      },
      "title": "Hero 区域",
      "actions": [...]
    },
    {
      "_schema": {
        "type": "object",
        "semantic": "stats"
      },
      "items": [...]
    }
  ]
}
```

**说明:** 使用 `hero`/`stats` 等标识区块类型，前端选择对应 Section 组件

---

### 3. 字段语义场景

```json
{
  "_schema": {
    "type": "object",
    "properties": {
      "user_email": {
        "type": "string",
        "semantic": "email"
      },
      "order_amount": {
        "type": "number",
        "semantic": "amount"
      },
      "order_status": {
        "type": "string",
        "semantic": "status"
      }
    }
  }
}
```

**说明:** 使用字段语义提示前端优化显示

---

## 扩展示例

### 添加新的区块语义类型

1. **定义语义类型**

```typescript
type SemanticType = 
  | 'hero'
  | 'testimonial'  // 新增：用户评价
```

2. **创建 Section 组件**

```vue
<!-- TestimonialSection.vue -->
<template>
  <section class="section section-testimonial">
    <div v-for="item in data.items" :key="item.id">
      {{ item.content }}
    </div>
  </section>
</template>
```

3. **更新 SectionRenderer**

```typescript
<TestimonialSection v-else-if="semanticType === 'testimonial'" :data="data" />
```

---

## 语义类型对比

### 之前（分离设计）

```typescript
// Builtin Schema
type BuiltinSchema = '@nav' | '@tree' | '@tabs'

// Semantic Type
type SemanticType = 'hero' | 'stats' | 'features'
```

**问题:**
- 两套体系，容易混淆
- 无法统一扩展
- 文档分散

### 现在（统一设计）

```typescript
// 统一的 Semantic Type
type SemanticType =
  | '@nav' | '@tree' | '@tabs'     // 特殊交互
  | 'hero' | 'stats' | 'features'  // 页面区块
  | 'id' | 'title' | 'status'      // 字段语义
```

**优点:**
- 统一体系，清晰明了
- 易于扩展
- 文档集中

---

## 完整示例

### 首页数据结构

```json
{
  "items": [
    {
      "_schema": "@nav",
      "icon": "📑",
      "title": "论文评审系统",
      "links": [
        { "title": "首页", "url": "/" },
        { "title": "编辑后台", "url": "/editor" }
      ]
    },
    {
      "_schema": {
        "type": "object",
        "semantic": "hero"
      },
      "icon": "🎓",
      "title": "论文评审系统",
      "subtitle": "高效、专业、智能的学术评审平台",
      "actions": [
        { "title": "立即登录", "url": "/auth/login" }
      ]
    },
    {
      "_schema": {
        "type": "object",
        "semantic": "stats"
      },
      "items": [
        { "number": "10,000+", "label": "注册论文" },
        { "number": "500+", "label": "评审专家" }
      ]
    }
  ],
  "_schema": {
    "type": "object",
    "title": "首页"
  }
}
```

---

## 总结

### 核心思想

> **统一语义类型，分层设计，前端根据语义选择渲染**

### 三层语义

| 层级 | 语义类型 | 渲染方式 |
|-----|---------|---------|
| 特殊交互 | @nav/@tree/@tabs | 特殊组件 |
| 页面区块 | hero/stats/features... | Section 组件 |
| 字段语义 | id/title/status... | 字段优化 |

### 优势

- ✅ **统一体系** - 所有语义类型在一个地方定义
- ✅ **分层清晰** - 根据渲染方式分层
- ✅ **易于扩展** - 添加新语义类型简单
- ✅ **文档集中** - 所有语义相关文档在 specs/

---

**许可:** MIT
