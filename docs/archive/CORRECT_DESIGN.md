# AgierBro 正确设计方案

**日期:** 2026-03-24  
**核心原则:** 一切皆 Schema，特殊结构可预定义

---

## 设计原则

### 1. 特殊结构预定义 Schema

某些数据结构有复杂交互逻辑，App 需要特殊处理：

| 类型 | 交互逻辑 | 预定义 Schema |
|-----|---------|--------------|
| `@nav` | 导航链接列表 | ✅ |
| `@tree` | 节点选择→内容切换 | ✅ |
| `@tabs` | 标签切换→内容切换 | ✅ |

**为什么可以预定义？**
- 交互逻辑固定（节点选择、内容切换）
- UI 模式固定（导航栏、树形、标签页）
- 不是业务逻辑，是通用 UI 模式

### 2. 普通对象 Schema 驱动

除特殊结构外，所有渲染由 Schema 决定：

```
数据 + Schema → SchemaRenderer → UI
```

**无需预定义：**
- Hero 区域
- 统计数据
- 功能卡片
- 页脚
- 任何业务对象

### 3. 列表布局自动选择

根据可见字段数自动选择布局：

| 字段数 | 布局 | 组件 |
|-------|------|------|
| 1 | 按钮 | ListRenderer (button) |
| 2-4 | 卡片 | ListRenderer (card) |
| > 4 | 表格 | ListRenderer (table) |

---

## 首页正确设计

### 数据结构

```json
{
  "items": [
    {
      "_schema": "@nav",
      "title": "导航栏",
      "links": [...]
    },
    {
      "_schema": {
        "type": "object",
        "title": "Hero 区域",
        "properties": {...}
      },
      "title": "论文评审系统",
      "subtitle": "...",
      "actions": [...]
    },
    {
      "_schema": {
        "type": "object",
        "title": "统计数据",
        "properties": {...}
      },
      "items": [...]
    }
  ],
  "_schema": {
    "type": "object",
    "title": "首页",
    "properties": {
      "items": {
        "type": "array",
        "title": "页面区块"
      }
    }
  }
}
```

### 渲染逻辑

```
Entry.vue
  ↓
isSectionList? (items 且每个元素有 _schema)
  ↓
SectionList
  ↓ 遍历 items
SectionRenderer (每个 item)
  ↓ 判断 _schema 类型
  ├── @nav → NavLayout
  ├── @tree → TreeLayout
  ├── @tabs → TabsLayout
  └── object → SectionBlock → SchemaRenderer
```

---

## 组件体系

### 特殊布局组件（3 个）

| 组件 | 用途 | Schema |
|-----|------|--------|
| NavLayout | 导航栏 | `@nav` |
| TreeLayout | 树形菜单 | `@tree` |
| TabsLayout | 标签页 | `@tabs` |

**特点：**
- 预定义 UI 样式
- 固定交互逻辑
- 不关心业务内容

### 通用渲染组件（3 个）

| 组件 | 用途 |
|-----|------|
| ListRenderer | 列表渲染（表格/卡片/按钮） |
| SchemaRenderer | 详情/表单渲染 |
| SectionBlock | 通用区块渲染 |

**特点：**
- 完全 Schema 驱动
- 无预定义样式
- 适用于任何业务对象

---

## 关键区别

### ❌ 错误设计（之前）

```json
{
  "_type": "hero",    // 硬编码类型
  "title": "..."
}
```

```typescript
// 需要为每个 _type 创建组件
SectionHero.vue
SectionStats.vue
SectionFeatures.vue
```

**问题：**
- 违背通用化原则
- 每新增类型都要写组件
- 无法复用

### ✅ 正确设计（现在）

```json
{
  "_schema": {         // Schema 定义结构
    "type": "object",
    "title": "Hero 区域",
    "properties": {...}
  },
  "title": "...",
  "subtitle": "..."
}
```

```typescript
// 通用组件渲染所有对象
SectionBlock → SchemaRenderer
```

**优点：**
- 完全通用
- 无需新增组件
- Schema 定义一切

---

## 特殊 vs 通用 边界

### 可以预定义（特殊）

| 条件 | 示例 |
|-----|------|
| 交互逻辑固定 | @nav（链接跳转） |
| UI 模式固定 | @tree（树形展开） |
| 通用 UI 组件 | @tabs（标签切换） |
| 无业务含义 | 不关心具体内容 |

### 必须 Schema 驱动（通用）

| 条件 | 示例 |
|-----|------|
| 业务相关 | Hero、Stats、Features |
| 样式可变 | 不同页面不同布局 |
| 字段不定 | 每个对象字段不同 |
| 需要扩展 | 随时添加新类型 |

---

## 验证清单

### 特殊结构（预定义）

- [ ] `@nav` - NavLayout 渲染
- [ ] `@tree` - TreeLayout 渲染
- [ ] `@tabs` - TabsLayout 渲染

### 通用对象（Schema 驱动）

- [ ] Hero 区域 - SchemaRenderer 渲染
- [ ] 统计数据 - SchemaRenderer 渲染
- [ ] 功能卡片 - SchemaRenderer 渲染
- [ ] 页脚信息 - SchemaRenderer 渲染

### 列表布局

- [ ] 1 个字段 → 按钮布局
- [ ] 2-4 个字段 → 卡片布局
- [ ] > 4 个字段 → 表格布局

---

## 总结

### 核心思想

> **特殊结构预定义，通用对象 Schema 驱动**

### 关键平衡

| 方面 | 预定义 | Schema 驱动 |
|-----|--------|------------|
| 特殊交互 | ✅ @nav/@tree/@tabs | ❌ |
| 业务对象 | ❌ | ✅ 所有 |
| 列表布局 | ❌ | ✅ 自动选择 |

### 最终目标

**App 完全通用，不关心业务，只关心结构和交互模式**

---

**许可:** MIT
