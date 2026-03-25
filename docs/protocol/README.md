# AgierBro 协议规范

**版本:** 1.0.0  
**状态:** 草案

---

## 概述

AgierBro 是一套**数据驱动的 UI 渲染协议**，旨在实现服务端和客户端的无缝连接：

- **Server 只关心业务** - 提供纯业务数据和操作定义
- **Client 不关心业务** - 根据协议自动渲染 UI
- **协议标准化** - 遵循协议的 Server 和 Client 可以互操作

---

## 核心原则

### 1. 数据与 UI 分离

```
Server (业务层)          Client (渲染层)
  提供：                    负责：
  - 业务数据      ──→      - UI 渲染
  - Schema 定义    JSON    - 用户交互
  - 操作定义                - 平台适配
```

### 2. 一切皆对象

每个 API 端点返回一个**对象**：

```json
{
  "id": "ORD-001",
  "status": "draft",
  "_schema": { ... },
  "_tools": [ ... ]
}
```

### 3. Schema 描述结构

- 字段定义（类型、约束）
- 可用操作（Tools）

### 4. Tool Call 机制

兼容 LLM Tool Call：
- 输入参数（JSON Schema）
- 输出参数（JSON Schema）
- 执行结果（标准化响应）

---

## 协议组成

### 1. 数据对象

```typescript
interface DataObject {
  // 业务数据字段
  [key: string]: any
  
  // 元数据字段（以 _ 开头）
  _schema?: string | Schema
  _tools?: Tool[]
  _page?: PageInfo
  items?: DataObject[]
}
```

### 2. Schema

```typescript
interface Schema {
  type: 'object'
  title?: string
  description?: string
  properties: Record<string, Field>
  tools?: Tool[]
}
```

### 3. Field

```typescript
interface Field {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'object' | 'array'
  semantic?: string
  title?: string
  description?: string
  default?: any
  readOnly?: boolean
  requiredFields?: string[]
  
  // 约束
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  minimum?: number
  maximum?: number
  
  // 复杂类型
  properties?: Record<string, Field>  // 对象
  items?: Field                       // 数组
  enum?: EnumValue[]                  // 枚举
}
```

### 4. Tool

```typescript
interface Tool {
  name: string
  description: string
  input_schema: ToolInputSchema
  output_schema?: ToolOutputSchema
  metadata?: {
    http?: { method: string; url: string }
    navigate?: { to: string }
    ui?: { variant: string; label: string }
  }
}
```

### 5. Tool Response

```typescript
interface ToolResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  
  // 前端行为控制
  _navigate?: string
  _reload?: boolean
  _message?: string
}
```

---

## 通信流程

### 获取对象

```
GET /api/orders/ORD-001
→
{
  "id": "ORD-001",
  "status": "draft",
  "_schema": { ... },
  "_tools": [ ... ]
}
```

### 执行 Tool

```
POST /api/actions/submit-order
{ "id": "ORD-001" }
→
{
  "success": true,
  "message": "订单已提交",
  "_reload": true
}
```

---

## 参考实现

### Vue 实现

**位置:** [../../agierBro-vue](../../agierBro-vue)

```bash
cd agierBro-vue
npm install
npm run dev
```

### 其他实现

- Flutter (计划中)
- iOS (计划中)
- Android (计划中)

---

## 设计文档

- [设计分析](../DESIGN_ANALYSIS.md)
- [Tool Call 机制](../specs/TOOL_CALL_DESIGN.md)
- [复杂对象支持](../../agierBro-vue/docs/COMPLEX_OBJECT_SUPPORT.md)

---

**许可:** MIT
