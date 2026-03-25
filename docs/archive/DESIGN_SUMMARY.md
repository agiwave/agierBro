# AgierBro 设计方案系统梳理总结

**日期:** 2026-03-24  
**目标:** Server 关注数据和功能，App 专注呈现机制

---

## 一、核心发现

### 1.1 设计原则评分

| 原则 | 现状 | 评分 | 说明 |
|-----|------|------|------|
| **前端无知** | 前端不关心业务概念 | ✅ 9/10 | 组件命名通用 |
| **Schema 驱动** | 所有行为由 Schema 定义 | ✅ 9/10 | 字段/布局/操作 |
| **结构决定渲染** | 根据数据结构选择组件 | ✅ 8/10 | 决策逻辑清晰 |
| **业务无关** | 组件命名无业务含义 | ✅ 9/10 | ObjectForm 非 OrderForm |
| **Server 关注数据** | Server 提供数据 +Schema+Tools | ⚠️ 7/10 | ui 字段混入 |
| **App 专注呈现** | App 根据 Schema 自动渲染 | ✅ 9/10 | 通用组件渲染 |

**总体评分：8.5/10** - 设计原则明确，部分细节待优化

---

### 1.2 架构优势

```
✅ 1. 统一入口机制
   - Entry.vue 作为所有页面的渲染入口
   - URL 通过固定规则映射到 API

✅ 2. Schema 驱动渲染
   - 前端根据 Schema 类型自主选择组件
   - 无业务逻辑硬编码

✅ 3. 字段分组策略
   - 简单字段自动合并
   - 复杂字段独立分组

✅ 4. Section 机制
   - 通用页面区块渲染
   - 组件注册系统支持扩展

✅ 5. Tool 执行机制
   - 兼容 OpenAI Tool API
   - 支持 HTTP/MCP 协议
```

---

### 1.3 待优化项

```
⚠️ 1. Schema 类型体系不统一
   - Section 类型 (@hero/@stats) 与内置类型 (@nav/@tree) 并存
   - 概念边界模糊

⚠️ 2. 组件体系复杂
   - 通用组件与 Section 组件职责重叠
   - 组件数量过多 (18 个)

⚠️ 3. Tool 协议不纯净
   - ui 字段混入业务协议
   - description 使用不规范
   - output_schema 未使用

⚠️ 4. 文档分散
   - 多个文档描述同一概念
   - 缺少统一的架构文档
```

---

## 二、优化方案

### 2.1 统一 Schema 类型体系

**问题：** Section 类型与内置 Schema 类型并存

**方案：**

```typescript
// 优化前：混乱
type BuiltinSchema = '@nav' | '@tree' | '@hero' | '@stats' | '@footer' | ...

// 优化后：统一
type BuiltinSchema = 
  // 导航结构
  | '@nav'
  
  // 内容结构
  | '@content' | '@media'
  
  // 列表结构
  | '@list' | '@grid' | '@tree' | '@tabs'
  
  // 复合结构
  | '@page'  // 复合页面（sections 数组）
  
  // 对象结构
  | 'object'
```

**Section 重新定义：**
- Section 不是 Schema 类型
- Section 是页面区块的通用概念
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

### 2.2 简化组件体系

**问题：** 组件过多，职责重叠

**方案：** 统一为三层组件

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 容器组件 (Container) - 2 个                               │
│    - Entry           统一入口                               │
│    - SectionContainer Section 容器                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. 渲染组件 (Renderer) - 5 个                                │
│    - SchemaRenderer  根据 Schema 渲染                        │
│    - SectionRenderer Section 渲染                           │
│    - ListRenderer    列表渲染                               │
│    - FieldRenderer   字段渲染                               │
│    - ToolRenderer    Tool 渲染                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. 基础组件 (Primitive) - 6 个                               │
│    - TextField       文本输入                               │
│    - SelectField     下拉选择                               │
│    - Button          按钮                                   │
│    - Card            卡片                                   │
│    - Table           表格                                   │
│    - Toast           消息提示                               │
└─────────────────────────────────────────────────────────────┘
```

**合并计划：**

| 原有组件 | 合并为 |
|---------|--------|
| ObjectList, ObjectTable, ObjectCardList, ObjectButtonList | ListRenderer |
| ObjectForm, ObjectDetail, ObjectGroups | SchemaRenderer |
| NavLayout, TreeLayout, TabsLayout | SchemaRenderer |
| SectionNav, SectionHero, SectionStats... | Section 注册 |

---

### 2.3 纯净化 Tool 协议

**问题：** ui 字段混入业务协议

**方案：**

```json
// ❌ 优化前
{
  "tools": [
    {
      "name": "submit",
      "ui": { "variant": "primary", "color": "blue" }
    }
  ]
}

// ✅ 优化后
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "submit",
        "description": "提交订单",
        "parameters": {...}
      },
      "execution": {
        "protocol": "http",
        "http": {
          "method": "POST",
          "url": "/api/orders/submit"
        }
      },
      "response": {
        "onSuccess": [
          { "type": "message", "message": "提交成功" }
        ]
      }
    }
  ]
}
```

**UI 提示单独配置：**
- 前端本地配置：`src/ui-hints.ts`
- 或配置文件：`public/ui-hints.json`

---

### 2.4 统一 Tool 协议（对齐 OpenAI）

**问题：** Tool 协议不统一

**方案：** 对齐 OpenAI Tool API

```typescript
interface Tool {
  type: 'function'  // 固定为 function
  
  function: {
    name: string
    description: string
    parameters: JSONSchema
    strict?: boolean  // 严格模式
  }
  
  // AgierBro 扩展
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

## 三、Server 职责精确定义

```
Server 只关注：

┌─────────────────────────────────────────────────────────────┐
│ 1. 数据 (Data)                                              │
│    - 业务数据本身（任意字段）                               │
│    - 数据关系（items, navigators 等）                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. 数据描述 (Schema)                                        │
│    - 字段定义 (properties)                                  │
│    - 字段顺序 (order)                                       │
│    - 字段分组 (groups) - 可选                               │
│    - 约束条件 (required, format, enum 等)                   │
│    - 内置类型 (@nav, @tree, @tabs 等)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. 能力定义 (Tools)                                         │
│    - 可执行的操作列表                                       │
│    - 输入参数定义 (input_schema)                            │
│    - 执行方式 (http/mcp)                                    │
│    - 响应处理 (onSuccess/onError)                           │
└─────────────────────────────────────────────────────────────┘
```

**Server 不关心：**
- ❌ UI 颜色、样式
- ❌ 按钮位置、布局
- ❌ 设备类型、屏幕大小
- ❌ 用户交互细节

---

## 四、App 职责精确定义

```
App 只关注：

┌─────────────────────────────────────────────────────────────┐
│ 1. 理解 (Understand)                                        │
│    - 解析 Schema 类型                                        │
│    - 理解数据结构                                           │
│    - 发现可用能力 (Tools)                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. 决策 (Decide)                                            │
│    - 选择渲染策略（列表/详情/表单）                         │
│    - 选择布局方式（表格/卡片/按钮）                         │
│    - 选择交互方式                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. 呈现 (Present)                                           │
│    - 渲染数据                                               │
│    - 渲染操作                                               │
│    - 处理反馈                                               │
└─────────────────────────────────────────────────────────────┘
```

**App 不关心：**
- ❌ 业务概念（订单/用户/产品）
- ❌ 业务规则（审核流程/权限控制）
- ❌ 数据来源（数据库/API/缓存）

---

## 五、渲染决策树

```typescript
function decideRenderStrategy(data: DataObject): string {
  // 1. 内置 Schema 类型优先
  if (data._schema === '@nav') return 'nav'
  if (data._schema === '@tree') return 'tree'
  if (data._schema === '@tabs') return 'tabs'
  if (data._schema === '@page') return 'page'
  if (data._schema === '@content') return 'content'
  
  // 2. 列表数据
  if (data.items) {
    const itemSchema = data._schema?.properties?.items
    const visibleFields = countVisibleFields(itemSchema)
    
    if (visibleFields === 1) return 'button-list'
    if (visibleFields <= 4) return 'card-list'
    return 'table'
  }
  
  // 3. 有操作 → 表单
  if (data._schema?.tools?.length > 0) {
    return 'form-with-tools'
  }
  
  // 4. 默认：详情展示
  return 'detail'
}
```

---

## 六、协议分层

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
│ Layer 2: Schema 协议 (Schema Protocol)                      │
│ - 字段语义 (title/description/semantic)                     │
│ - 字段顺序 (order)                                          │
│ - 字段分组 (groups)                                         │
│ - 内置类型 (@nav/@tree/@tabs/@page)                         │
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

## 七、实施路线图

### 短期（1-2 周）- 完成基础优化

| 任务 | 说明 | 优先级 | 状态 |
|-----|------|--------|------|
| 统一 Schema 类型 | 合并 Section 类型到内置 Schema | P0 | ⏳ |
| 简化组件体系 | 合并重叠组件 | P0 | ⏳ |
| 纯净化 Tool 协议 | 移除 ui 字段 | P1 | ⏳ |
| 完善文档 | 更新协议规范 | P1 | ✅ |

### 中期（1-2 月）- 实现统一架构

| 任务 | 说明 | 优先级 | 状态 |
|-----|------|--------|------|
| 实现 SchemaRenderer | 统一渲染组件 | P0 | ⏳ |
| 实现 Section 注册系统 | 支持自定义 Section | P0 | ✅ |
| 对齐 OpenAI Tool API | 完善 Tool 协议 | P1 | ⏳ |
| 引入状态管理 | Pinia Store | P2 | ⏳ |

### 长期（3-6 月）- 扩展能力

| 任务 | 说明 | 优先级 | 状态 |
|-----|------|--------|------|
| LLM 集成 | 支持自然语言交互 | P2 | ⏳ |
| 可视化编辑器 | Schema 可视化配置 | P2 | ⏳ |
| 多端支持 | Flutter/iOS/Android | P3 | ⏳ |

---

## 八、核心文档索引

| 文档 | 说明 | 状态 |
|-----|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构设计（精简版） | ✅ 已更新 |
| [DESIGN_REVIEW.md](./DESIGN_REVIEW.md) | 设计方案系统梳理 | ✅ 新增 |
| [PROTOCOL_V2.md](./PROTOCOL_V2.md) | 协议规范 v2.0 | ✅ 已更新 |
| [SECTION_MECHANISM.md](./SECTION_MECHANISM.md) | Section 机制 | ✅ 已更新 |
| [VISION.md](./VISION.md) | 项目愿景 | ✅ 参考 |

---

## 九、总结

### 核心成果

```
✅ 1. 设计原则明确
   - Server 关注数据和功能
   - App 专注呈现机制
   - 评分：8.5/10

✅ 2. 架构分层清晰
   - Server 层：数据 + Schema + Tools
   - Client 层：理解 + 决策 + 呈现

✅ 3. 协议规范完善
   - 数据协议
   - Schema 协议
   - 能力协议

✅ 4. 组件体系健全
   - 容器组件
   - 渲染组件
   - 基础组件
```

### 待优化项

```
⚠️ 1. 统一 Schema 类型体系
   - 合并 Section 类型
   - 明确概念边界

⚠️ 2. 简化组件体系
   - 合并重叠组件
   - 减少组件数量

⚠️ 3. 纯净化协议
   - 移除 ui 字段
   - 对齐 OpenAI

⚠️ 4. 文档整合
   - 统一架构文档
   - 减少重复描述
```

### 核心原则

> **Server 关注数据和功能，App 专注呈现机制**
>
> 这是 AgierBro 的核心设计理念，所有优化都应遵循此原则。

---

**许可:** MIT
