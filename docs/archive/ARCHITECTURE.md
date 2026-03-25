# AgierBro 架构设计

**版本:** 3.0  
**日期:** 2026-03-24  
**核心原则:** Server 关注数据和功能，App 专注呈现机制

---

## 核心公理

### 公理 1：Server 只提供数据和能力

```
Server 职责 = 数据 (Data) + 能力 (Capabilities)

数据：业务数据本身 + Schema 描述
能力：可执行的操作 (Tools)
```

**Server 不应该：**
- ❌ 指定 UI 颜色、样式
- ❌ 指定按钮位置、布局
- ❌ 关心设备类型、屏幕大小

**Server 应该：**
- ✅ 提供清晰的业务数据
- ✅ 提供完整的 Schema 描述
- ✅ 提供明确的 Tools 定义

---

### 公理 2：App 只关心理解和呈现

```
App 职责 = 理解 (Understand) + 呈现 (Present)

理解：解析 Schema，理解数据结构
呈现：根据结构自主选择渲染方式
```

**App 不应该：**
- ❌ 硬编码"订单"、"用户"等业务概念
- ❌ 硬编码业务规则
- ❌ 关心数据来源

**App 应该：**
- ✅ 理解 Schema 类型
- ✅ 自主选择渲染策略
- ✅ 自主决定 UI 呈现

---

### 公理 3：Schema 定义一切

```
Server 提供 Schema → App 理解 Schema → 用户看到 UI
```

| UI 元素 | Schema 定义 | App 行为 |
|--------|------------|---------|
| 字段标签 | `field.title` | 显示 title |
| 字段隐藏 | `field.visible` | 隐藏/显示 |
| 字段顺序 | `schema.order` | 按顺序渲染 |
| 字段分组 | `schema.groups` | 分组渲染 |
| 操作按钮 | `tools[]` | 渲染按钮 |
| 操作结果 | `tools.response` | 执行 Action |

---

## 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                     Server (业务层)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  业务逻辑 + 数据模型                                   │  │
│  │                        ↓                              │  │
│  │  输出：{ data, _schema, _tools }                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            │ 纯 JSON，无 UI 信息             │
│                            ▼                                │
├─────────────────────────────────────────────────────────────┤
│                     Client (渲染层)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Entry.vue (统一入口)                                 │  │
│  │    ↓                                                  │  │
│  │  SchemaParser (解析)                                  │  │
│  │    ↓                                                  │  │
│  │  StrategyDecider (决策)                               │  │
│  │    ↓                                                  │  │
│  │  SchemaRenderer (渲染)                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  通用组件库                                            │  │
│  │  - SectionRenderer (Section 渲染)                     │  │
│  │  - ListRenderer (列表渲染)                            │  │
│  │  - FieldRenderer (字段渲染)                           │  │
│  │  - ToolRenderer (Tool 渲染)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 数据模型

### 基础响应

```json
{
  "// 业务数据": "任意字段",
  "id": "ORD-001",
  "name": "订单",
  
  "// 元数据": "以 _ 开头",
  "_schema": {
    "type": "object",
    "title": "订单详情",
    "properties": {...},
    "tools": [...]
  }
}
```

### Schema 类型

```typescript
type BuiltinSchema = 
  // 导航结构
  | '@nav'      // 导航链接
  
  // 内容结构
  | '@content'  // 内容展示
  | '@media'    // 媒体内容
  
  // 列表结构
  | '@list'     // 列表
  | '@tree'     // 树形
  | '@tabs'     // 标签页
  
  // 复合结构
  | '@page'     // 复合页面
  
  // 对象结构
  | 'object'    // 自定义对象
```

### Tool 定义

```typescript
interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: JSONSchema
  }
  execution: {
    protocol: 'http' | 'mcp'
    http?: { method: string; url: string }
  }
  response?: {
    onSuccess?: Action[]
    onError?: Action[]
  }
}
```

---

## 渲染决策

### 决策树

```typescript
function decideRenderStrategy(data: DataObject): string {
  // 1. 内置 Schema 类型优先
  if (data._schema === '@nav') return 'nav'
  if (data._schema === '@tree') return 'tree'
  if (data._schema === '@tabs') return 'tabs'
  if (data._schema === '@page') return 'page'
  
  // 2. 列表数据
  if (data.items) {
    const visibleFields = countVisibleFields(data._schema)
    if (visibleFields === 1) return 'button-list'
    if (visibleFields <= 4) return 'card-list'
    return 'table'
  }
  
  // 3. 有操作 → 表单
  if (data._schema?.tools?.length > 0) {
    return 'form-with-tools'
  }
  
  // 4. 默认：详情
  return 'detail'
}
```

### 渲染策略

| 策略 | 条件 | 组件 |
|-----|------|------|
| nav | `_schema === '@nav'` | NavRenderer |
| tree | `_schema === '@tree'` | TreeRenderer |
| tabs | `_schema === '@tabs'` | TabsRenderer |
| page | `_schema === '@page'` | PageRenderer |
| table | `items + 字段>4` | TableRenderer |
| card-list | `items + 字段 2-4` | CardRenderer |
| button-list | `items + 字段=1` | ButtonRenderer |
| form-with-tools | `tools.length > 0` | FormRenderer |
| detail | 默认 | DetailRenderer |

---

## 组件体系

### 三层组件

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 容器组件 (Container)                                     │
│    - Entry           统一入口                               │
│    - SectionContainer Section 容器                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. 渲染组件 (Renderer)                                      │
│    - SchemaRenderer  根据 Schema 渲染                        │
│    - SectionRenderer Section 渲染                           │
│    - ListRenderer    列表渲染                               │
│    - FieldRenderer   字段渲染                               │
│    - ToolRenderer    Tool 渲染                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. 基础组件 (Primitive)                                     │
│    - TextField       文本输入                               │
│    - SelectField     下拉选择                               │
│    - Button          按钮                                   │
│    - Card            卡片                                   │
│    - Table           表格                                   │
│    - Toast           消息提示                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 通信流程

### 获取数据

```
GET /api/orders/ORD-001
→
{
  "id": "ORD-001",
  "name": "订单",
  "_schema": {
    "type": "object",
    "properties": {...},
    "tools": [...]
  }
}
```

### 执行 Tool

```
POST /api/orders/ORD-001/submit
{ "id": "ORD-001" }
→
{
  "success": true,
  "actions": [
    { "type": "message", "message": "提交成功", "level": "success" },
    { "type": "navigate", "target": "/orders" }
  ]
}
```

### 执行 Action

```typescript
function executeAction(action: Action) {
  switch (action.type) {
    case 'navigate':
      router.push(action.target)
      break
    case 'reload':
      loadData()
      break
    case 'back':
      router.back()
      break
    case 'message':
      showToast(action.message, action.level)
      break
  }
}
```

---

## 设计原则

### 正面清单（推荐）

| 原则 | 示例 |
|-----|------|
| **组件通用命名** | `ObjectForm` 不是 `OrderForm` |
| **样式无业务** | `.card` 不是 `.order-card` |
| **Schema 定义标签** | `field.title` 不是硬编码 |
| **结构决定渲染** | `hasItems ? List : Detail` |
| **Tool 定义操作** | `tools[]` 定义可执行操作 |

### 反面清单（避免）

| 反模式 | 问题 | 正确做法 |
|-------|------|---------|
| 前端判断业务类型 | "这是登录页" | 判断结构 "有 tools" |
| 样式包含业务名 | `.login-button` | `.btn-primary` |
| 硬编码字段标签 | `labels.order_no` | `schema.properties.order_no.title` |
| UI 提示混入协议 | `tool.ui.variant` | 前端本地配置 |

---

## 协议分层

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 数据协议                                           │
│ - 基础类型 (string/number/boolean/object/array)             │
│ - 数据约束 (min/max/pattern/enum)                           │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Schema 协议                                        │
│ - 字段语义 (title/description)                              │
│ - 字段顺序 (order)                                          │
│ - 内置类型 (@nav/@tree/@tabs)                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: 能力协议                                           │
│ - Tool 定义 (name/description/parameters)                   │
│ - 执行方式 (http/mcp)                                       │
│ - 响应处理 (onSuccess/onError)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 优化方向

### 已完成

- ✅ 统一入口 (Entry.vue)
- ✅ URL 映射规则
- ✅ Schema 驱动渲染
- ✅ Section 机制
- ✅ 字段分组策略

### 待优化

- ⏳ 统一 Schema 类型体系
- ⏳ 简化组件体系
- ⏳ 纯净化 Tool 协议
- ⏳ 对齐 OpenAI Tool API

---

## 文件索引

| 文档 | 说明 |
|-----|------|
| [PROTOCOL_V2.md](./PROTOCOL_V2.md) | 协议规范 v2.0 |
| [DESIGN_REVIEW.md](./DESIGN_REVIEW.md) | 设计方案系统梳理 |
| [SECTION_MECHANISM.md](./SECTION_MECHANISM.md) | Section 机制 |
| [VISION.md](./VISION.md) | 项目愿景 |

---

**许可:** MIT
