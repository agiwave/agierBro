# AgierBro 通用渲染机制重新设计

**日期:** 2026-03-24  
**问题:** Section 机制违背了通用化原则  
**目标:** 回归通用机制本质

---

## 核心设计原则

### 原则 1: 一切皆 Schema

```
Server 返回数据 → 包含 _schema → App 根据 Schema 渲染
```

**不应该有：**
- ❌ 特殊的 Section 组件（SectionHero, SectionStats 等）
- ❌ 硬编码的 Section 类型识别
- ❌ Section 注册机制

**应该有：**
- ✅ 统一的 SchemaRenderer
- ✅ 统一的 ListRenderer
- ✅ 基于数据结构的自动渲染

---

## 正确的渲染决策树

```
数据加载
    ↓
判断 _schema 类型
    ├── @nav → NavLayout (导航链接列表)
    ├── @tree → TreeLayout (树形结构)
    ├── @tabs → TabsLayout (标签页)
    │
    └── object / 无 _schema
        ↓
        判断数据结构
        ├── 有 items 数组
        │   ↓
        │   判断 items 中元素的可见字段数
        │   ├── = 1 → 按钮布局 (ObjectButtonList)
        │   ├── 2-4 → 卡片布局 (ObjectCardList)
        │   └── > 4 → 表格布局 (ObjectTable)
        │
        └── 无 items (单个对象)
            ↓
            字段分组渲染 (ObjectDetail/ObjectForm)
```

---

## 复合页面的正确设计

### 错误设计（当前）

```json
{
  "_schema": "@page",
  "sections": [
    { "_type": "nav", ... },    // ❌ 特殊类型
    { "_type": "hero", ... },   // ❌ 特殊类型
    { "_type": "stats", ... }   // ❌ 特殊类型
  ]
}
```

**问题：**
- `_type` 是硬编码的 UI 类型
- 需要为每个 `_type` 编写组件
- 违背通用化原则

### 正确设计

```json
{
  "items": [
    {
      "title": "导航链接 1",
      "url": "/home",
      "icon": "🏠"
    },
    {
      "title": "导航链接 2",
      "url": "/orders",
      "icon": "📦"
    }
  ],
  "_schema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": { "type": "string", "title": "标题" },
            "url": { "type": "string", "title": "链接" },
            "icon": { "type": "string", "title": "图标" }
          }
        }
      }
    }
  }
}
```

**优点：**
- ✅ 纯数据驱动
- ✅ 通用 ListRenderer 渲染
- ✅ 无需特殊组件

---

## 首页的正确实现

### 方案 A: 使用标准列表

```json
{
  "items": [
    { "icon": "🏠", "title": "首页", "url": "/" },
    { "icon": "📦", "title": "订单", "url": "/orders" },
    { "icon": "👤", "title": "我的", "url": "/uc" }
  ],
  "_schema": {
    "type": "object",
    "title": "导航菜单",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "_address": "{url}",
          "properties": {
            "icon": { "type": "string", "title": "图标" },
            "title": { "type": "string", "title": "标题" },
            "url": { "type": "string", "title": "链接" }
          }
        }
      }
    }
  }
}
```

**渲染结果：** 卡片布局（3 个可见字段）

---

### 方案 B: 使用 @nav 内置类型

```json
{
  "icon": "📑",
  "title": "论文评审系统",
  "links": [
    { "icon": "🏠", "title": "首页", "url": "/" },
    { "icon": "📦", "title": "订单", "url": "/orders" }
  ],
  "_schema": "@nav"
}
```

**渲染结果：** NavLayout 组件渲染导航栏

---

### 方案 C: 复合页面的正确设计

如果确实需要复合页面（多个区块），应该这样设计：

```json
{
  "blocks": [
    {
      "type": "navigation",
      "data": { ... }
    },
    {
      "type": "content_list",
      "data": {
        "items": [...],
        "_schema": { ... }
      }
    }
  ],
  "_schema": {
    "type": "object",
    "properties": {
      "blocks": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "type": { "type": "string", "title": "区块类型" },
            "data": { "type": "object", "title": "区块数据" }
          }
        }
      }
    }
  }
}
```

**渲染逻辑：**
1. 遍历 `blocks` 数组
2. 根据 `block.type` 选择渲染策略
3. 使用 `block.data` 递归渲染

**但这仍然不是最优解**，因为 `type` 还是硬编码的。

---

## 最优解：纯数据驱动

### 首页数据结构

```json
{
  "navigation": {
    "title": "论文评审系统",
    "links": [
      { "title": "首页", "url": "/" },
      { "title": "编辑后台", "url": "/editor" }
    ]
  },
  "hero": {
    "title": "论文评审系统",
    "subtitle": "高效、专业、智能的学术评审平台",
    "actions": [
      { "title": "立即登录", "url": "/auth/login" }
    ]
  },
  "stats": {
    "items": [
      { "number": "10,000+", "label": "注册论文" },
      { "number": "500+", "label": "评审专家" }
    ]
  },
  "_schema": {
    "type": "object",
    "title": "首页",
    "order": ["navigation", "hero", "stats"],
    "properties": {
      "navigation": {
        "type": "object",
        "title": "导航",
        "properties": {
          "title": { "type": "string", "title": "标题" },
          "links": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "url": { "type": "string" }
              }
            }
          }
        }
      },
      "hero": {
        "type": "object",
        "title": "Hero 区域",
        "properties": {
          "title": { "type": "string" },
          "subtitle": { "type": "string" },
          "actions": {
            "type": "array",
            "items": { ... }
          }
        }
      },
      "stats": {
        "type": "object",
        "title": "统计数据",
        "properties": {
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "number": { "type": "string" },
                "label": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

**渲染逻辑：**
1. SchemaRenderer 解析 Schema
2. 按 `order` 遍历字段
3. 简单字段 → 直接显示
4. 复杂字段（object）→ 递归渲染
5. 数组字段 → ListRenderer 渲染

**无需任何特殊 Section 组件！**

---

## 实施计划

### Step 1: 删除特殊 Section 组件

```bash
# 删除所有特殊 Section 组件
rm -rf src/components/sections/SectionHero.vue
rm -rf src/components/sections/SectionStats.vue
rm -rf src/components/sections/SectionFeatures.vue
rm -rf src/components/sections/SectionCta.vue
rm -rf src/components/sections/SectionFooter.vue
```

### Step 2: 保留通用组件

保留：
- ListRenderer (列表渲染)
- SchemaRenderer (详情/表单渲染)
- NavLayout (@nav 专用，可保留)
- TreeLayout (@tree 专用，可保留)
- TabsLayout (@tabs 专用，可保留)

### Step 3: 重写首页数据

使用纯 Schema 驱动的数据结构

### Step 4: 更新 Entry.vue

移除 `@page` 和 `isCompositePage` 逻辑

---

## 列表布局规则

| 可见字段数 | 布局 | 组件 |
|-----------|------|------|
| 1 | 按钮布局 | ObjectButtonList |
| 2-4 | 卡片布局 | ObjectCardList |
| > 4 | 表格布局 | ObjectTable |

**这是通用机制，不是特殊处理！**

---

## 总结

### 通用机制的核心

1. **Schema 驱动** - 所有渲染由 Schema 决定
2. **数据结构决定布局** - 字段数决定列表样式
3. **无特殊组件** - 不硬编码 UI 类型
4. **递归渲染** - 复杂对象递归处理

### 错误方向

- ❌ 添加特殊 Section 组件
- ❌ 硬编码 `_type` 识别
- ❌ Section 注册机制

### 正确方向

- ✅ 统一的 SchemaRenderer
- ✅ 统一的 ListRenderer
- ✅ 基于字段数的自动布局
- ✅ 递归渲染复杂对象

---

**许可:** MIT
