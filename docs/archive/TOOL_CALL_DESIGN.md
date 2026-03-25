# AgierBro Tool Call 机制设计

**版本:** 0.3.0  
**日期:** 2024-03-17

---

## 核心设计理念

**Tool 机制完全兼容 LLM（大语言模型）的 Tool Call API**

参考 OpenAI Tool API 设计：
- https://platform.openai.com/docs/api-reference/chat/create
- https://platform.openai.com/docs/guides/function-calling

---

## 设计对比

### 传统前端 Action 设计

```typescript
interface Action {
  name: string
  label: string
  type: 'submit' | 'navigate'
  url?: string
  navigateTo?: string
  // ... UI 相关属性
}
```

**问题：**
- ❌ 没有输入参数定义
- ❌ 没有输出参数定义
- ❌ 无法被 LLM 理解和使用
- ❌ 与 LLM Tool 机制不兼容

### AgierBro Tool 设计（兼容 LLM）

```typescript
interface Tool {
  name: string
  description: string          // LLM 根据此描述决定是否调用
  input_schema: {              // 输入参数定义（JSON Schema）
    type: 'object'
    properties: Record<string, Field>
    required?: string[]
  }
  output_schema?: {            // 输出参数定义（JSON Schema）
    type: 'object'
    properties: Record<string, Field>
  }
  type?: 'function' | 'http' | 'navigate'
  method?: 'POST'
  url?: string
  navigateTo?: string
  ui?: {                       // UI 提示（可选）
    variant?: 'primary'
    label?: string
  }
}
```

**优势：**
- ✅ 完整的输入/输出参数定义
- ✅ 兼容 JSON Schema
- ✅ 可被 LLM 理解和调用
- ✅ 与 OpenAI Tool API 完全兼容

---

## Tool Call 流程

### 1. 服务端返回对象数据

```json
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "properties": {
      "username": { "type": "string" },
      "password": { "type": "string" }
    },
    "tools": [
      {
        "name": "login",
        "description": "用户登录，验证用户名和密码",
        "type": "http",
        "method": "POST",
        "url": "/api/login",
        "input_schema": {
          "type": "object",
          "properties": {
            "username": { "type": "string", "description": "用户名" },
            "password": { "type": "string", "description": "密码" }
          },
          "required": ["username", "password"]
        },
        "output_schema": {
          "type": "object",
          "properties": {
            "success": { "type": "boolean" },
            "token": { "type": "string" },
            "_navigate": { "type": "string" }
          }
        }
      }
    ]
  }
}
```

### 2. 前端渲染 Tool 按钮

```vue
<ToolButtons :tools="schema.tools" :formData="formData" />
```

### 3. 用户点击按钮 → 执行 Tool Call

```typescript
// 收集参数
const args = {
  username: formData.username,
  password: formData.password
}

// 执行 Tool
const result = await execute(tool, args)
```

### 4. Tool Call 响应

```typescript
interface ToolCallResponse {
  tool_call_id: string
  name: string
  content: string              // JSON 字符串
  navigateTo?: string          // 导航目标
  reload?: boolean             // 是否刷新
}
```

### 5. 处理响应

```typescript
const content = JSON.parse(response.content)
if (content._navigate) {
  router.push(content._navigate)
}
if (response.reload) {
  window.location.reload()
}
```

---

## 与 LLM 集成

### LLM 调用 Tool 的标准格式

```json
// 请求
{
  "model": "gpt-4",
  "messages": [...],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "login",
        "description": "用户登录",
        "parameters": {
          "type": "object",
          "properties": {
            "username": { "type": "string" },
            "password": { "type": "string" }
          }
        }
      }
    }
  ]
}

// 响应
{
  "choices": [{
    "message": {
      "tool_calls": [{
        "id": "call_123",
        "type": "function",
        "function": {
          "name": "login",
          "arguments": "{\"username\":\"admin\",\"password\":\"123456\"}"
        }
      }]
    }
  }]
}
```

### AgierBro Tool 与 LLM Tool 的映射

| AgierBro | LLM (OpenAI) | 说明 |
|----------|-------------|------|
| `Tool` | `Function Definition` | Tool 定义 |
| `Tool.name` | `function.name` | 名称 |
| `Tool.description` | `function.description` | 描述 |
| `Tool.input_schema` | `function.parameters` | 输入参数 |
| `ToolCall` | `tool_calls` | 调用请求 |
| `ToolCallResponse` | `tool_output` | 调用响应 |

---

## Tool 类型

### 1. HTTP Tool

调用 HTTP API：

```json
{
  "name": "create_order",
  "description": "创建新订单",
  "type": "http",
  "method": "POST",
  "url": "/api/orders",
  "input_schema": {
    "type": "object",
    "properties": {
      "customer_name": { "type": "string" },
      "total_amount": { "type": "number" }
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "order_id": { "type": "string" },
      "_navigate": { "type": "string" }
    }
  }
}
```

### 2. Navigate Tool

页面导航：

```json
{
  "name": "go_to_register",
  "description": "导航到注册页面",
  "type": "navigate",
  "navigateTo": "/page/register",
  "input_schema": { "type": "object", "properties": {} },
  "output_schema": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" }
    }
  }
}
```

### 3. Function Tool

自定义函数（在客户端执行）：

```json
{
  "name": "calculate_total",
  "description": "计算订单总额",
  "type": "function",
  "input_schema": {
    "type": "object",
    "properties": {
      "items": { "type": "array" },
      "discount": { "type": "number" }
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "total": { "type": "number" }
    }
  }
}
```

---

## 响应约定

Tool 响应支持特殊字段，用于控制前端行为：

| 字段 | 类型 | 说明 |
|-----|------|------|
| `_navigate` | string | 导航目标 URL |
| `_reload` | boolean | 是否刷新页面 |
| `_message` | string | 提示消息 |
| `_error` | string | 错误消息 |

示例：

```json
{
  "success": true,
  "token": "xxx",
  "_navigate": "/page/dashboard",
  "_message": "登录成功"
}
```

---

## 实现文件

| 文件 | 说明 |
|-----|------|
| `src/types/index.ts` | Tool 类型定义 |
| `src/composables/useToolExecutor.ts` | Tool 执行器 |
| `src/components/ToolButtons.vue` | Tool 按钮组件 |
| `public/api/login.json` | 登录 Tool 示例 |

---

## 下一步

1. **完善 Tool 执行器** - 支持更多 Tool 类型
2. **LLM 集成** - 实现与 LLM Tool Call 的双向转换
3. **Tool 编排** - 支持多个 Tool 的顺序/并行执行
4. **错误处理** - 完善的错误处理和重试机制

---

## 参考链接

- [OpenAI Tool API](https://platform.openai.com/docs/api-reference/chat/create)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [JSON Schema](https://json-schema.org/)
