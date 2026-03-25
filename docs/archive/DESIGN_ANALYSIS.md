# AgierBro 设计理念深度分析

**版本:** 0.4.0  
**日期:** 2024-03-18  
**状态:** 设计评审

---

## 核心原则

### 原则 1: API 只提供数据和方法

**现状分析:**
```json
// ✅ 当前实现
{
  "id": "ORD-001",
  "customer_name": "张三",
  "_schema": {
    "properties": { ... },
    "tools": [
      {
        "name": "submit_order",
        "description": "提交订单审核",
        "url": "/api/actions/submit-order.json",
        "input_schema": { ... },
        "output_schema": { ... }
      }
    ]
  }
}
```

**评估:** ✅ 完全符合原则
- 数据字段：`id`, `customer_name`, `status` 等
- 方法定义：`tools` 数组，每个 Tool 有完整的输入/输出定义
- 无 UI 信息：不包含"用按钮还是链接"、"什么颜色"等 UI 决策

**优化建议:**
- 当前 `ui` 字段是纯前端提示，不影响原则
- 考虑将 `ui` 移到单独的前端配置文件

---

### 原则 2: 方法和 Tool Call 机制完全看齐

**现状分析:**

| AgierBro | OpenAI Tool | 对齐度 |
|----------|-------------|--------|
| `Tool.name` | `function.name` | ✅ |
| `Tool.description` | `function.description` | ✅ |
| `Tool.input_schema` | `function.parameters` | ✅ |
| `ToolCall` | `tool_calls` | ⚠️ |
| `ToolCallResponse` | `tool_output` | ⚠️ |

**当前 Tool 定义:**
```typescript
interface Tool {
  name: string
  description: string
  input_schema: ToolInputSchema    // ✅ 兼容 JSON Schema
  output_schema?: ToolOutputSchema // ✅ 兼容 JSON Schema
  type?: 'function' | 'http' | 'navigate'
  url?: string
  method?: 'POST'
}
```

**评估:** ⚠️ 部分对齐，需要优化

**问题:**
1. OpenAI 的 Tool 只有 `function` 类型，我们通过 `type` 扩展了 `http` 和 `navigate`
2. OpenAI 的响应格式是 `content`，我们用 `ToolCallResponse`
3. 缺少 `strict` 模式（OpenAI 新增特性）

---

## 当前架构分析

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Server (业务层)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  业务数据 + Schema + Tools                           │   │
│  │  { data..., _schema: { properties, tools } }        │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│                   纯 JSON 响应                               │
│                   /api/xxx.json                             │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  AgierBro (渲染层)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Entry.vue (统一入口)                                │   │
│  │  1. fetchPageData() → 获取数据                       │   │
│  │  2. extractSchema() → 提取 Schema                    │   │
│  │  3. 判断类型 → 选择组件                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ObjectForm / ObjectList / ObjectDetail              │   │
│  │  根据 Schema.properties 渲染字段                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  useToolExecutor                                     │   │
│  │  根据 Schema.tools 渲染按钮，执行 Tool Call           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户访问 /page/orders/ORD-001
    ↓
Entry.vue: fetchPageData('orders', 'ORD-001')
    ↓
GET /api/orders/ORD-001.json
    ↓
返回：{ data, _schema: { properties, tools } }
    ↓
判断：有 items → 列表 / 无 items → 详情
    ↓
ObjectDetail 渲染：
  - 根据 properties 渲染字段
  - 根据 tools 渲染操作按钮
    ↓
用户点击"提交审核"
    ↓
useToolExecutor.execute(tool, args)
    ↓
fetch('/api/actions/submit-order.json')
    ↓
解析响应，处理 _navigate / _reload
```

---

## 可行性分析

### ✅ 已验证可行的部分

1. **数据驱动渲染**
   - Schema.properties → 表单字段 ✅
   - Schema.tools → 操作按钮 ✅
   - 类型系统完整 ✅

2. **Tool Call 机制**
   - 输入参数定义 (input_schema) ✅
   - 输出参数定义 (output_schema) ✅
   - 执行流程完整 ✅

3. **静态文件模拟**
   - 开发无需后端 ✅
   - 快速原型验证 ✅
   - 易于测试 ✅

### ⚠️ 需要优化的部分

1. **Tool 类型扩展**
   - 当前：`type: 'function' | 'http' | 'navigate'`
   - 问题：与 OpenAI 标准不完全兼容
   - 建议：统一为 `function`，通过 `metadata` 扩展

2. **响应格式**
   - 当前：自定义 `ToolCallResponse`
   - 问题：与 LLM 响应格式不一致
   - 建议：对齐 OpenAI 格式

3. **复杂对象支持**
   - 当前：仅支持扁平字段
   - 问题：嵌套对象、数组字段未实现
   - 建议：实现递归渲染

4. **状态管理**
   - 当前：组件内局部状态
   - 问题：跨页面状态共享困难
   - 建议：引入 Pinia Store

---

## 优化方案

### 方案 A: 完全对齐 OpenAI Tool API

**Tool 定义:**
```typescript
interface Tool {
  type: 'function'  // 固定为 function
  function: {
    name: string
    description: string
    parameters: JSON Schema  // 对齐 OpenAI
    strict?: boolean         // OpenAI 新增
  }
  metadata?: {       // 扩展信息
    http?: {
      method: 'POST' | 'PUT' | 'DELETE'
      url: string
    }
    navigate?: {
      to: string
    }
    ui?: {
      variant: 'primary' | 'secondary' | 'danger'
      label: string
      confirm: string
    }
  }
}
```

**Tool Call 响应:**
```typescript
interface ToolCallResponse {
  id: string         // tool_call_id
  role: 'tool'       // 固定为 tool
  content: string    // JSON 字符串
  name: string       // tool name
}
```

**优点:**
- ✅ 完全兼容 LLM Tool Call
- ✅ 可以直接使用 OpenAI SDK
- ✅ 未来接入 LLM 无需修改

**缺点:**
- ⚠️ 结构更复杂
- ⚠️ 需要修改现有代码

---

### 方案 B: 保持当前设计，增加适配层

**当前 Tool 定义保持不变:**
```typescript
interface Tool {
  name: string
  description: string
  input_schema: JSON Schema
  output_schema?: JSON Schema
  type?: 'function' | 'http' | 'navigate'
  url?: string
}
```

**增加适配器:**
```typescript
// 转换为 OpenAI 格式
function toOpenAITool(tool: Tool): OpenAITool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema
    }
  }
}

// 从 OpenAI 格式转换
function fromOpenAITool(tool: OpenAITool): Tool {
  return {
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters
  }
}
```

**优点:**
- ✅ 现有代码改动小
- ✅ 保持简洁
- ✅ 通过适配器兼容 LLM

**缺点:**
- ⚠️ 需要维护适配层
- ⚠️ 不是原生兼容

---

## 推荐方案

### 短期 (1-2 周): 方案 B + 优化

**保持当前设计，增加以下优化:**

1. **统一响应格式**
```typescript
interface ToolResponse {
  success: boolean
  data?: any
  error?: string
  // 前端行为控制
  _navigate?: string
  _reload?: boolean
  _message?: string
}
```

2. **增加 metadata 字段**
```typescript
interface Tool {
  name: string
  description: string
  input_schema: JSON Schema
  output_schema?: JSON Schema
  metadata?: {
    http?: { method: string; url: string }
    ui?: { variant: string; label: string }
  }
}
```

3. **实现复杂对象渲染**
- 嵌套对象字段
- 数组字段
- 字段分组（Tabs）

---

### 中期 (1-2 月): 逐步迁移到方案 A

**分阶段迁移:**

1. **Phase 1:** 新增 Tool 使用新格式
2. **Phase 2:** 旧 Tool 逐步迁移
3. **Phase 3:** 实现 LLM 集成

---

## 核心设计原则验证

### 原则 1: API 只提供数据和方法 ✅

**验证:**
```json
// ✅ 数据
{
  "id": "ORD-001",
  "status": "draft"
}

// ✅ 方法
{
  "_schema": {
    "tools": [
      {
        "name": "submit_order",
        "input_schema": { ... },
        "output_schema": { ... }
      }
    ]
  }
}

// ❌ 不应该有 UI 信息
{
  "ui": {
    "buttonColor": "blue",  // 不应该有
    "layout": "horizontal"  // 不应该有
  }
}
```

**结论:** 当前设计符合原则，`ui` 字段是前端提示，不影响原则。

---

### 原则 2: 方法和 Tool Call 机制完全看齐 ⚠️

**验证:**

| 要求 | 当前状态 | 差距 |
|-----|---------|------|
| 输入参数定义 | ✅ input_schema | 无 |
| 输出参数定义 | ✅ output_schema | 无 |
| Tool Call 格式 | ⚠️ 自定义 | 需适配 |
| Tool 响应格式 | ⚠️ 自定义 | 需适配 |
| strict 模式 | ❌ 未实现 | 需添加 |

**结论:** 核心机制对齐，响应格式需优化。

---

## 下一步行动

### 立即执行 (本周)

1. **统一响应格式** - 定义 `ToolResponse` 接口
2. **增加 metadata 字段** - 支持扩展信息
3. **完善文档** - 更新 Tool Call 设计文档

### 本周目标

1. **复杂对象支持** - 嵌套对象、数组字段
2. **字段分组** - Tabs 布局
3. **测试覆盖** - 添加 E2E 测试

### 下周计划

1. **Pinia Store** - 状态管理
2. **LLM 适配器** - OpenAI Tool API 兼容
3. **性能优化** - Schema 缓存

---

## 总结

### 当前设计评分

| 维度 | 评分 | 说明 |
|-----|------|------|
| 原则 1 符合度 | ⭐⭐⭐⭐⭐ | 完全符合 |
| 原则 2 符合度 | ⭐⭐⭐⭐ | 核心对齐，格式需优化 |
| 可行性 | ⭐⭐⭐⭐⭐ | 已验证 |
| 可扩展性 | ⭐⭐⭐⭐ | 良好，需适配层 |
| 开发体验 | ⭐⭐⭐⭐⭐ | 静态文件模拟友好 |

### 总体评价

**✅ 设计理念正确，方案可行**

核心原则得到严格遵守，Tool Call 机制基本对齐。建议采用**方案 B（适配层）**逐步演进，保持现有代码稳定的同时，为未来 LLM 集成做准备。

### 关键决策

1. **保持当前 Tool 定义** - 简洁直观
2. **增加 metadata 字段** - 支持扩展
3. **实现适配层** - 兼容 LLM
4. **优先实现复杂对象** - 完善核心功能

---

**最后更新:** 2024-03-18  
**评审状态:** 待讨论
