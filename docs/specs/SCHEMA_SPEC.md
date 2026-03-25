# AgierBro Schema 规范

**版本:** 4.1  
**最后更新:** 2026-03-24  
**状态:** 正式规范

---

## 概述

Schema 是 AgierBro 协议的核心，用于描述数据对象的结构和语义。

**核心原则:**
- Schema 定义数据结构，不定义 UI
- Schema 包含语义类型（semantic），前端根据语义选择渲染方式
- 所有语义类型平级，无特殊前缀
- Schema 本身也是对象

---

## Schema 结构

### 基本结构

```typescript
interface Schema {
  type: 'object' | 'array'
  title?: string
  description?: string
  semantic?: SemanticType      // 语义类型（用于渲染选择）
  properties: Record<string, Field>
  order?: string[]             // 字段顺序（可选）
  groups?: FieldGroup[]        // 字段分组（可选）
  tools?: Tool[]               // 可用操作（可选）
}
```

### 字段定义

```typescript
interface Field {
  type: FieldType
  title?: string
  description?: string
  semantic?: SemanticType      // 字段语义（用于渲染优化）
  default?: any
  visible?: boolean
  readOnly?: boolean
  required?: boolean
  format?: string
  
  // 约束
  minLength?: number
  maxLength?: number
  pattern?: string
  minimum?: number
  maximum?: number
  enum?: EnumValue[]
  
  // 复杂类型
  items?: Field                // 数组元素
  properties?: Record<string, Field>  // 对象属性
  _address?: string            // 关联地址
}
```

---

## 语义类型

### 统一语义类型体系

所有语义类型平级，无特殊前缀，无分类注释：

```typescript
type SemanticType =
  // 导航与结构
  | 'nav' | 'tree' | 'tabs'
  
  // 页面区块
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
  
  // 字段语义
  | 'id' | 'title' | 'name' | 'description'
  | 'status' | 'amount' | 'date' | 'time'
  | 'email' | 'phone' | 'url' | 'image' | 'file'
  | 'user' | 'category' | 'tag'
  | 'action' | 'link'
```

### 语义类型用途

| 语义类型 | 用途 | 前端渲染 |
|---------|------|---------|
| `nav` | 导航栏 | NavLayout |
| `tree` | 树形菜单 | TreeLayout |
| `tabs` | 标签页 | TabsLayout |
| `hero` | Hero 区域 | HeroSection |
| `stats` | 统计数据 | StatsSection |
| `features` | 功能列表 | FeaturesSection |
| `cta` | 行动号召 | CtaSection |
| `footer` | 页脚 | FooterSection |
| `content` | 内容区块 | ContentSection |
| `list` | 列表区块 | ListSection |

### 字段语义用途

| 语义类型 | 渲染优化 |
|---------|---------|
| `email` | 邮件链接 |
| `phone` | 电话链接 |
| `url` | 超链接 |
| `image` | 图片显示 |
| `file` | 文件下载 |
| `status` | 状态标签 |
| `amount` | 货币格式化 |
| `date` | 日期格式化 |
| `title` | 加粗显示 |

---

## Schema 使用示例

### 1. 导航栏

```json
{
  "_schema": {
    "type": "object",
    "semantic": "nav"
  },
  "icon": "📑",
  "title": "论文评审系统",
  "links": [
    { "title": "首页", "url": "/" },
    { "title": "编辑后台", "url": "/editor" }
  ]
}
```

### 2. Hero 区域

```json
{
  "_schema": {
    "type": "object",
    "semantic": "hero"
  },
  "icon": "🎓",
  "title": "论文评审系统",
  "subtitle": "高效、专业、智能",
  "actions": [
    { "title": "立即登录", "url": "/auth/login" }
  ]
}
```

### 3. 统计数据

```json
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
```

### 4. 详情对象

```json
{
  "id": "ORD-001",
  "name": "订单 A",
  "status": "draft",
  "amount": 100.00,
  "_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "semantic": "id", "readOnly": true },
      "name": { "type": "string", "semantic": "name", "required": true },
      "status": { 
        "type": "string", 
        "semantic": "status",
        "enum": [
          { "value": "draft", "label": "草稿" },
          { "value": "pending", "label": "待审核" }
        ]
      },
      "amount": { "type": "number", "semantic": "amount" }
    }
  }
}
```

---

## 渲染决策

### 决策树

```
数据加载
    ↓
获取 semantic 类型
    ↓
nav → NavLayout
tree → TreeLayout
tabs → TabsLayout
hero → HeroSection
stats → StatsSection
features → FeaturesSection
cta → CtaSection
footer → FooterSection
无/其他 → SectionBlock (通用渲染)
```

### 列表布局规则

对于列表数据，根据可见字段数自动选择布局：

| 可见字段数 | 布局 | 组件 |
|-----------|------|------|
| 1 | 按钮布局 | ListRenderer (button) |
| 2-4 | 卡片布局 | ListRenderer (card) |
| > 4 | 表格布局 | ListRenderer (table) |

---

## 最佳实践

### ✅ 推荐

```json
{
  "_schema": {
    "type": "object",
    "semantic": "nav",
    "properties": {
      "title": { "type": "string" },
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
  }
}
```

### ❌ 避免

```json
{
  "_schema": "@nav",  // ❌ 不要使用特殊前缀
  "ui": {             // ❌ 不要在 Schema 中包含 UI 信息
    "color": "blue",
    "layout": "horizontal"
  }
}
```

---

## 与 Tool 的关系

Schema 可以包含 `tools` 字段，定义该数据对象可执行的操作：

```json
{
  "id": "ORD-001",
  "status": "draft",
  "_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "status": { "type": "string" }
    },
    "tools": [
      {
        "name": "submit_order",
        "description": "提交订单审核",
        "parameters": {
          "type": "object",
          "properties": {
            "id": { "type": "string" }
          }
        },
        "protocol": "http",
        "method": "POST",
        "url": "/api/orders/ORD-001/submit",
        "onSuccess": [
          { "type": "message", "message": "提交成功" },
          { "type": "navigate", "target": "/orders" }
        ]
      }
    ]
  }
}
```

详见：[TOOL_SPEC.md](./TOOL_SPEC.md)

---

## 相关文档

| 文档 | 说明 |
|-----|------|
| [TOOL_SPEC.md](./TOOL_SPEC.md) | Tool 规范 |
| [../DESIGN.md](../DESIGN.md) | 完整设计文档 |

---

**许可:** MIT
