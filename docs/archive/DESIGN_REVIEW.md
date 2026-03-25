# AgierBro 设计方案系统梳理与优化

**日期:** 2026-03-24  
**目标:** 构建 Server 关注数据和功能、App 专注呈现的通用架构

---

## 第一部分：现有架构分析

### 1.1 核心设计原则

| 原则 | 现状 | 评分 |
|-----|------|------|
| **前端无知** | 前端不关心业务概念 | ✅ 9/10 |
| **Schema 驱动** | 所有行为由 Schema 定义 | ✅ 9/10 |
| **结构决定渲染** | 根据数据结构选择组件 | ✅ 8/10 |
| **业务无关** | 组件命名无业务含义 | ✅ 9/10 |
| **Server 关注数据** | Server 提供数据 +Schema+Tools | ⚠️ 7/10 |
| **App 专注呈现** | App 根据 Schema 自动渲染 | ✅ 9/10 |

---

### 1.2 架构分层现状

```
┌─────────────────────────────────────────────────────────────┐
│                     Server (业务层)                          │
│                                                              │
│  职责：提供数据 + 能力                                        │
│  ├── 业务数据 (data)                                        │
│  ├── 数据描述 (_schema.properties)                          │
│  └── 可用能力 (_schema.tools)                               │
│                                                              │
│  问题：⚠️ Schema 中混入了 UI 提示 (ui 字段)                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Client (渲染层)                          │
│                                                              │
│  职责：理解 + 呈现                                            │
│  ├── 理解层：解析 Schema，理解数据结构                       │
│  ├── 决策层：根据结构选择渲染策略                            │
│  └── 呈现层：通用组件渲染                                    │
│                                                              │
│  问题：⚠️ Section 机制与内置 Schema 并存，概念不统一          │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.3 核心概念梳理

#### A. 内置 Schema 类型

| 类型 | 用途 | 问题 |
|-----|------|------|
| `@nav` | 导航数据 | ✅ 清晰 |
| `@tree` | 树形结构 | ✅ 清晰 |
| `@tabs` | 标签页 | ✅ 清晰 |
| `@link` | 链接跳转 | ✅ 清晰 |
| `@content` | 内容展示 | ✅ 清晰 |
| `@list` | 列表数据 | ⚠️ 与 ObjectList 混淆 |
| `@hero` | Hero 区块 | ⚠️ Section 特有 |
| `@stats` | 统计区块 | ⚠️ Section 特有 |
| `@features` | 功能区块 | ⚠️ Section 特有 |
| `@cta` | 行动号召 | ⚠️ Section 特有 |
| `@footer` | 页脚 | ⚠️ Section 特有 |

**问题：** Section 类型（`@hero`, `@stats`等）与内置 Schema 类型（`@nav`, `@tree`）概念边界模糊

---

#### B. 组件体系

```
通用组件（数据驱动）
├── ObjectList      → items 数组渲染
│   ├── ObjectTable      → 表格布局
│   ├── ObjectCardList   → 卡片布局
│   └── ObjectButtonList → 按钮布局
├── ObjectForm    → 表单渲染
├── ObjectDetail  → 详情渲染
└── ObjectGroups  → 分组渲染

Section 组件（页面区块）
├── SectionRenderer  → 动态组件
├── SectionList      → Section 容器
├── SectionNav       → 导航栏
├── SectionHero      → Hero 区块
├── SectionStats     → 统计区块
├── SectionFeatures  → 功能区块
├── SectionCta       → 行动号召
├── SectionFooter    → 页脚
└── SectionContent   → 内容

布局组件
├── NavLayout
├── TreeLayout
├── TabsLayout
└── ContentLayout
```

**问题：** 组件体系复杂，通用组件与 Section 组件职责有重叠

---

#### C. Tool 机制

```typescript
interface Tool {
  name: string           // ✅ 清晰
  title: string          // ✅ 清晰
  description?: string   // ⚠️ 使用不规范
  input_schema?: Schema  // ✅ 清晰
  output_schema?: Schema // ⚠️ 未使用
  
  protocol: 'http' | 'mcp' | 'navigate'  // ⚠️ 不统一
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string        // navigate 协议用
  
  ui?: {                 // ⚠️ UI 提示混在协议中
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: string
    confirm?: string
  }
}
```

**问题：**
1. `description` 使用不规范
2. `output_schema` 未使用
3. `protocol` 设计不统一
4. `ui` 字段混入业务协议

---

### 1.4 数据流分析

```
用户访问 URL
    ↓
Entry.vue (统一入口)
    ↓
URL 映射 → API 路径
    ↓
fetch API 获取数据
    ↓
识别数据类型
├── isNav?      → NavLayout
├── isTree?     → TreeLayout
├── isTabs?     → TabsLayout
├── isSectionList? → SectionList
├── isItemList? → ObjectList
└── 默认        → ObjectGroups + ObjectForm
    ↓
渲染组件
```

**问题：** 识别逻辑分散，SectionList 与 ObjectList 边界模糊

---

## 第二部分：优化方案

### 2.1 核心架构优化

#### 优化 1：统一 Schema 类型体系

**问题：** Section 类型与内置 Schema 类型并存，概念混乱

**方案：** 将所有 Schema 类型统一为**数据结构描述**

```typescript
// 优化后
type BuiltinSchema = 
  // 导航结构
  | '@nav'      // 导航数据（links 数组）
  
  // 内容结构
  | '@content'  // 内容展示（title + content）
  | '@media'    // 媒体内容（images/videos）
  
  // 列表结构
  | '@list'     // 通用列表（items 数组）
  | '@grid'     // 网格列表（items 数组 + 网格布局）
  | '@tree'     // 树形结构（nodes 数组）
  
  // 表单结构
  | '@form'     // 表单（properties + tools）
  
  // 复合结构
  | '@page'     // 复合页面（sections 数组）
  
  // 对象结构
  | 'object'    // 自定义对象
```

**Section 重新定义：**
- Section 不是 Schema 类型
- Section 是**页面区块的通用概念**
- 通过 `@page` 的 `sections` 数组定义

```json
{
  "_schema": "@page",
  "sections": [
    { "_type": "nav", "data": {...} },
    { "_type": "hero", "data": {...} },
    { "_type": "stats", "data": {...} }
  ]
}
```

---

#### 优化 2：简化组件体系

**问题：** 组件过多，职责重叠

**方案：** 统一为三大类组件

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 容器组件 (Container)                                     │
│    - Entry.vue          (统一入口)                          │
│    - SectionContainer   (Section 容器)                      │
│    - ListContainer      (列表容器)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. 渲染组件 (Renderer)                                      │
│    - SchemaRenderer     (根据 Schema 渲染)                  │
│    - FieldRenderer      (渲染字段)                          │
│    - ToolRenderer       (渲染 Tool 按钮)                    │
│    - SectionRenderer    (渲染 Section)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. 基础组件 (Primitive)                                     │
│    - TextField          (文本输入)                          │
│    - SelectField        (下拉选择)                          │
│    - Button             (按钮)                              │
│    - Card               (卡片)                              │
│    - Table              (表格)                              │
│    - Toast              (消息提示)                          │
└─────────────────────────────────────────────────────────────┘
```

**删除组件：**
- ObjectList, ObjectTable, ObjectCardList, ObjectButtonList → 合并为 `ListRenderer`
- ObjectForm, ObjectDetail, ObjectGroups → 合并为 `SchemaRenderer`
- NavLayout, TreeLayout, TabsLayout → 合并为 `SchemaRenderer`
- SectionNav, SectionHero, SectionStats... → 改为 Section 注册

---

#### 优化 3：纯净化 Server 协议

**问题：** Server 返回数据中混入 UI 提示

**方案：** 严格分离业务协议和 UI 提示

```json
// ❌ 优化前：混入 UI 提示
{
  "tools": [
    {
      "name": "submit",
      "ui": { "variant": "primary", "color": "blue" }
    }
  ]
}

// ✅ 优化后：纯业务协议
{
  "tools": [
    {
      "name": "submit",
      "description": "提交订单",
      "input_schema": {...},
      "protocol": "http",
      "method": "POST",
      "url": "/api/orders/submit"
    }
  ]
}
```

**UI 提示单独配置：**
```typescript
// 前端本地配置
const uiHints = {
  'submit_order': { variant: 'primary' },
  'cancel_order': { variant: 'danger' }
}

// 或使用前端配置文件
// public/ui-hints.json
```

---

#### 优化 4：统一 Tool 协议

**问题：** Tool 协议不统一，部分字段未使用

**方案：** 对齐 OpenAI Tool API

```typescript
interface Tool {
  // 基础信息（对齐 OpenAI）
  type: 'function'
  function: {
    name: string
    description: string
    parameters: JSONSchema  // 输入参数
    strict?: boolean        // 严格模式
  }
  
  // 执行方式（AgierBro 扩展）
  execution: {
    protocol: 'http' | 'mcp'
    http?: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      url: string
    }
    mcp?: {
      server: string
      tool: string
    }
  }
  
  // 响应处理（AgierBro 扩展）
  response?: {
    onSuccess?: Action[]
    onError?: Action[]
  }
}

type Action = 
  | { type: 'navigate'; target: string }
  | { type: 'reload' }
  | { type: 'back' }
  | { type: 'message'; message: string; level: 'success' | 'error' | 'info' }
```

---

### 2.2 Server 端优化

#### Server 职责精确定义

```
Server 只关注：
├── 1. 数据 (Data)
│   ├── 业务数据本身
│   └── 数据关系（items, navigators 等）
│
├── 2. 数据描述 (Schema)
│   ├── 字段定义 (properties)
│   ├── 字段顺序 (order)
│   ├── 字段分组 (groups) - 可选
│   └── 约束条件 (required, format 等)
│
└── 3. 能力定义 (Tools)
    ├── 可执行的操作
    ├── 输入参数定义
    └── 预期结果
```

#### Server 返回示例

```json
{
  "// 1. 业务数据": "",
  "id": "ORD-001",
  "order_no": "ORD-20240324001",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  
  "// 2. 数据描述": "",
  "_schema": {
    "type": "object",
    "title": "订单",
    "order": ["id", "order_no", "customer_name", "status", "total_amount"],
    "properties": {
      "id": { "type": "string", "title": "订单 ID", "readOnly": true },
      "order_no": { "type": "string", "title": "订单编号", "readOnly": true },
      "customer_name": { "type": "string", "title": "客户姓名", "required": true },
      "status": { 
        "type": "string", 
        "title": "状态",
        "enum": [
          { "value": "draft", "label": "草稿" },
          { "value": "pending", "label": "待审核" }
        ]
      },
      "total_amount": { "type": "number", "title": "金额", "readOnly": true }
    },
    
    "// 3. 能力定义": "",
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "submit_order",
          "description": "将订单提交到审核流程",
          "parameters": {
            "type": "object",
            "properties": {
              "id": { "type": "string", "description": "订单 ID" }
            },
            "required": ["id"]
          }
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/orders/ORD-001/submit"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "订单已提交", "level": "success" },
            { "type": "navigate", "target": "/orders" }
          ]
        }
      }
    ]
  }
}
```

---

### 2.3 App 端优化

#### App 职责精确定义

```
App 只关注：
├── 1. 理解 (Understand)
│   ├── 解析 Schema 类型
│   ├── 理解数据结构
│   └── 发现可用能力
│
├── 2. 决策 (Decide)
│   ├── 选择渲染策略
│   ├── 选择布局方式
│   └── 选择交互方式
│
└── 3. 呈现 (Present)
    ├── 渲染数据
    ├── 渲染操作
    └── 处理反馈
```

#### 渲染决策树

```typescript
function decideRenderStrategy(data: DataObject): RenderStrategy {
  // 1. 判断内置 Schema 类型
  if (data._schema === '@nav') return 'nav'
  if (data._schema === '@tree') return 'tree'
  if (data._schema === '@tabs') return 'tabs'
  if (data._schema === '@page') return 'page'
  
  // 2. 判断数据结构
  if (data.items) {
    // 列表数据
    const itemSchema = data._schema?.properties?.items
    const visibleFields = countVisibleFields(itemSchema)
    
    if (visibleFields === 1) return 'button-list'
    if (visibleFields <= 4) return 'card-list'
    return 'table'
  }
  
  // 3. 判断是否有操作
  if (data._schema?.tools?.length > 0) {
    return 'form-with-tools'
  }
  
  // 4. 默认：详情展示
  return 'detail'
}
```

---

### 2.4 协议优化

#### 协议分层

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 数据协议 (Data Protocol)                           │
│ - 基础数据类型 (string/number/boolean/object/array)         │
│ - 数据约束 (min/max/pattern/enum)                           │
│ - 数据关系 (items/properties)                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Schema 协议 (Schema Protocol)                       │
│ - 字段语义 (title/description/semantic)                     │
│ - 字段顺序 (order)                                          │
│ - 字段分组 (groups)                                         │
│ - 内置类型 (@nav/@tree/@tabs)                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: 能力协议 (Capability Protocol)                     │
│ - Tool 定义 (name/description/parameters)                   │
│ - 执行方式 (http/mcp)                                       │
│ - 响应处理 (onSuccess/onError)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 第三部分：实施路线图

### 3.1 短期优化（1-2 周）

| 任务 | 说明 | 优先级 |
|-----|------|--------|
| 统一 Schema 类型 | 合并 Section 类型到内置 Schema | P0 |
| 简化组件体系 | 合并重叠组件 | P0 |
| 纯净化 Tool 协议 | 移除 ui 字段 | P1 |
| 完善文档 | 更新协议规范 | P1 |

### 3.2 中期优化（1-2 月）

| 任务 | 说明 | 优先级 |
|-----|------|--------|
| 实现 SchemaRenderer | 统一渲染组件 | P0 |
| 实现 Section 注册系统 | 支持自定义 Section | P0 |
| 对齐 OpenAI Tool API | 完善 Tool 协议 | P1 |
| 引入状态管理 | Pinia Store | P2 |

### 3.3 长期优化（3-6 月）

| 任务 | 说明 | 优先级 |
|-----|------|--------|
| LLM 集成 | 支持自然语言交互 | P2 |
| 可视化编辑器 | Schema 可视化配置 | P2 |
| 多端支持 | Flutter/iOS/Android | P3 |

---

## 第四部分：核心原则验证

### 4.1 Server 职责验证

| 职责 | 验证项 | 状态 |
|-----|------|------|
| 提供数据 | 返回业务数据字段 | ✅ |
| 数据描述 | 通过 Schema 描述结构 | ✅ |
| 能力定义 | 通过 Tools 定义操作 | ✅ |
| 不关心 UI | 无 UI 配置信息 | ⚠️ 需优化 |

### 4.2 App 职责验证

| 职责 | 验证项 | 状态 |
|-----|------|------|
| 理解数据 | 解析 Schema 类型 | ✅ |
| 自主决策 | 选择渲染策略 | ✅ |
| 呈现 UI | 通用组件渲染 | ✅ |
| 不关心业务 | 无业务逻辑硬编码 | ✅ |

---

## 第五部分：优化后架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Server (业务层)                          │
│                                                              │
│  输入：HTTP Request                                          │
│  处理：业务逻辑                                              │
│  输出：{ data, _schema: { properties, tools } }              │
│                                                              │
│  原则：只提供数据和能力，不关心 UI                            │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Client (渲染层)                          │
│                                                              │
│  Entry.vue (统一入口)                                        │
│    ↓                                                         │
│  SchemaParser (解析 Schema)                                  │
│    ↓                                                         │
│  StrategyDecider (决策渲染策略)                               │
│    ↓                                                         │
│  SchemaRenderer (统一渲染)                                    │
│    ├── SectionRenderer (Section)                             │
│    ├── ListRenderer (列表)                                   │
│    └── FieldRenderer (字段)                                  │
│                                                              │
│  原则：只关心结构和呈现，不关心业务                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 总结

### 核心成果

1. ✅ **Server 职责明确** - 只提供数据和能力
2. ✅ **App 职责明确** - 只关心理解和呈现
3. ✅ **协议分层清晰** - 数据/Schema/能力三层
4. ✅ **组件体系统一** - 容器/渲染/基础三层

### 待优化项

1. ⚠️ **统一 Schema 类型** - 合并 Section 类型
2. ⚠️ **简化组件体系** - 合并重叠组件
3. ⚠️ **纯净化协议** - 移除 UI 提示
4. ⚠️ **对齐 OpenAI** - 完善 Tool 协议

### 核心原则

> **Server 关注数据和功能，App 专注呈现机制**
> 
> 这是 AgierBro 的核心设计理念，所有优化都应遵循此原则。

---

**许可:** MIT
