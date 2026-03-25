# AgierBro 内置结构性 Schema（数据自我描述）

**版本:** 1.0.0  
**日期:** 2024-03-18  
**状态:** ✅ 已实现

---

## 设计理念

**核心思想:** `_schema` 是数据的"自我描述"，告诉 App"我是什么类型的数据"，而不是"如何渲染我"。

**类比 LLM Tool Calling:**
- LLM 需要 Tool Description 来理解工具用途
- App 需要 `_schema` 来理解数据结构类型

**内置 Schema 列表:**
- `@nav` = "这是一个导航数据结构"
- `@tree` = "这是一个树状菜单结构"
- `@tabs` = "这是一个标签页结构"
- `@link` = "这是一个跳转链接"
- `(无)` = "这是普通数据"

**App 理解后自主决定如何呈现，而不是被动执行 UI 指令。**

---

## 内置 Schema 列表

| Schema | 用途 | 数据结构 | 前端渲染 |
|-------|------|---------|---------|
| **@link** | 单个跳转链接 | `{ icon, title, url }` | 链接/按钮 |
| **@nav** | 顶部导航条 | `{ icon, title, links: [] }` | 导航栏 |
| **@tree** | 树状菜单 | `{ title, nodes: [] }` | 侧边栏树 + 内容区 |
| **@tabs** | 标签页切换 | `{ title, tabs: [] }` | 标签头 + 内容区 |
| **(无)** | 普通内容 | 任意对象/列表 | 自动渲染（ObjectList/ObjectDetail） |

**说明:**
- 前 4 个是**特殊结构**，需要明确标识
- **普通内容不需要标识**，前端自动根据数据结构渲染

---

## 1. @link（跳转链接）

**用途:** 单个跳转链接

**数据结构:**
```json
{
  "icon": "🏠",
  "title": "首页",
  "url": "/home",
  "_schema": "@link"
}
```

**字段说明:**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `icon` | string | ❌ | 图标（emoji 或 URL） |
| `title` | string | ❌ | 标题 |
| `url` | string | ✅ | 跳转地址 |
| `_schema` | "@link" | ✅ | Schema 标识 |

**前端行为:**
- 渲染为链接/按钮
- 点击跳转到 `url`

**测试 API:** `/api/link.json`

---

## 2. @nav（导航条）

**用途:** 顶部导航栏，包含多个链接

**数据结构:**
```json
{
  "icon": "📋",
  "title": "AgierBro",
  "links": [
    {
      "icon": "🏠",
      "title": "首页",
      "url": "/home"
    },
    {
      "icon": "📦",
      "title": "订单管理",
      "url": "/orders"
    },
    {
      "icon": "👤",
      "title": "个人中心",
      "url": "/uc"
    }
  ],
  "_schema": "@nav"
}
```

**字段说明:**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `icon` | string | ❌ | 品牌图标 |
| `title` | string | ❌ | 品牌名称 |
| `links` | array | ✅ | 链接列表 |
| `links[].icon` | string | ❌ | 链接图标 |
| `links[].title` | string | ❌ | 链接标题 |
| `links[].url` | string | ✅ | 链接地址 |
| `_schema` | "@nav" | ✅ | Schema 标识 |

**前端行为:**
- 渲染为顶部导航栏
- 显示品牌名称和图标
- 显示所有链接
- 点击链接跳转

**测试 API:** `/api/home.json`

---

## 3. @tree（树状菜单）

**用途:** 侧边栏树状菜单，点击节点加载内容

**数据结构:**
```json
{
  "title": "系统菜单",
  "nodes": [
    {
      "title": "首页",
      "icon": "🏠",
      "content": "/home"
    },
    {
      "title": "订单管理",
      "icon": "📦",
      "content": "/orders",
      "children": [
        {
          "title": "订单列表",
          "content": "/orders"
        }
      ]
    },
    {
      "title": "用户管理",
      "icon": "👤",
      "children": [
        {
          "title": "用户列表",
          "content": "/users"
        }
      ]
    }
  ],
  "_schema": "@tree"
}
```

**字段说明:**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `title` | string | ❌ | 菜单标题 |
| `nodes` | array | ✅ | 节点列表 |
| `nodes[].title` | string | ✅ | 节点标题 |
| `nodes[].icon` | string | ❌ | 节点图标 |
| `nodes[].content` | string/object | ❌ | 内容（URL 或对象） |
| `nodes[].children` | array | ❌ | 子节点（空数组表示可动态加载） |
| `_schema` | "@tree" | ✅ | Schema 标识 |

**前端行为:**
- 渲染为侧边栏树 + 内容区布局
- 点击节点加载内容
- `content` 是字符串 → 加载 URL 并渲染
- `content` 是对象 → 直接显示 JSON 数据
- `children` 为空数组 → 可动态加载子节点

**测试 API:** `/api/tree.json`

---

## 4. @tabs（标签页切换）

**用途:** 标签页切换，每个 tab 有独立内容

**数据结构:**
```json
{
  "icon": "📑",
  "title": "功能演示",
  "tabs": [
    {
      "title": "首页",
      "content": {
        "message": "欢迎使用 AgierBro"
      }
    },
    {
      "title": "订单",
      "content": "/orders"
    },
    {
      "title": "关于",
      "content": {
        "name": "AgierBro",
        "version": "1.0.0"
      }
    }
  ],
  "_schema": "@tabs"
}
```

**字段说明:**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `icon` | string | ❌ | 图标 |
| `title` | string | ❌ | 标题 |
| `tabs` | array | ✅ | 标签列表 |
| `tabs[].title` | string | ✅ | 标签标题 |
| `tabs[].content` | string/object | ✅ | 标签内容（URL 或对象） |
| `_schema` | "@tabs" | ✅ | Schema 标识 |

**前端行为:**
- 渲染为标签页切换组件
- 显示所有标签
- 点击标签切换内容
- `content` 是字符串 → 加载 URL 并使用 ObjectList 渲染
- `content` 是对象 → 显示 JSON 数据

**测试 API:** `/api/tabs.json`

---


## 前端识别规则

```typescript
// Entry.vue 识别逻辑
const isNav = computed(() => data.value?._schema === '@nav')
const isTree = computed(() => data.value?._schema === '@tree')
const isTabs = computed(() => data.value?._schema === '@tabs')
const isContent = computed(() => data.value?._schema === '@content')
const isLink = computed(() => data.value?._schema === '@link')
```

**渲染映射:**
```
@nav     → NavLayout.vue（顶部导航栏）
@tree    → TreeLayout.vue（侧边栏树 + 内容区）
@tabs    → TabsLayout.vue（标签页切换）
@content → ContentLayout.vue（内容容器）
@link    → 链接/按钮
```

---

## 扩展新内置 Schema

### 1. 定义 Schema 标识

```typescript
// types/index.ts
export type BuiltinSchema = 
  | '@link' 
  | '@nav' 
  | '@tree' 
  | '@tabs' 
  | '@content'
  | '@grid'    // 新增：网格布局
```

### 2. 创建布局组件

```vue
<!-- GridLayout.vue -->
<template>
  <div class="grid-layout">
    <div v-for="item in data.items" :key="item.id" class="grid-item">
      {{ item.title }}
    </div>
  </div>
</template>
```

### 3. 更新 Entry.vue

```typescript
const isGrid = computed(() => data.value?._schema === '@grid')
```

```vue
<GridLayout v-else-if="isGrid" :data="data" />
```

---

## 最佳实践

### 1. 选择合适的 Schema

| 场景 | 推荐 Schema |
|-----|-----------|
| 单个链接 | @link |
| 网站顶部导航 | @nav |
| 后台管理系统菜单 | @tree |
| 功能演示/多内容切换 | @tabs |
| 单页内容展示 | @content |
| 产品列表/卡片网格 | @grid（待实现） |

### 2. 内容 URL 规范

```json
{
  "content": "/orders"  // ✅ 相对路径，自动添加 /api/ 前缀
}
```

**前端处理:**
```typescript
// 确保 URL 以 /api/ 开头
let url = node.content
if (!url.startsWith('/api/')) {
  url = '/api' + (url.startsWith('/') ? url : '/' + url)
}
```

### 3. 动态加载子节点

```json
{
  "title": "权限管理",
  "children": []  // 空数组表示可动态加载
}
```

**前端行为:**
- 点击展开时触发 `expand` 事件
- 可调用 API 加载子节点

---

## 测试 API 列表

| 文件 | Schema | 说明 | 访问 |
|-----|--------|------|------|
| `/api/link.json` | @link | 单个链接 | /link |
| `/api/home.json` | @nav | 导航条（4 个链接） | /home |
| `/api/tree.json` | @tree | 树状菜单（4 个节点） | /tree |
| `/api/tabs.json` | @tabs | 标签页（3 个标签） | /tabs |
| `/api/content.json` | @content | 内容容器 | /content |

---

## 与自定义 Schema 的关系

**内置 Schema:**
- 固定标识符（`@nav`, `@tree` 等）
- 固定数据结构
- 前端直接识别并渲染对应布局

**自定义 Schema:**
- `_schema` 是对象
- 包含 `properties` 定义字段
- 前端根据 `properties` 渲染表单/详情

**两者可以共存:**
```json
{
  "_schema": "@nav",
  "title": "导航",
  "links": [
    {
      "_schema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "url": { "type": "string" }
        }
      },
      "title": "首页",
      "url": "/home"
    }
  ]
}
```

---

**最后更新:** 2024-03-18  
**状态:** ✅ 已实现并验证
