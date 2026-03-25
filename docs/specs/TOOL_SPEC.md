# AgierBro Tool 规范

**版本:** 4.1  
**最后更新:** 2026-03-24  
**状态:** 正式规范

---

## 概述

Tool（工具）是 AgierBro 协议中定义操作的核心。

**核心原则:**
- Tool 定义简洁，包含基础字段
- 输入参数遵循 Schema 规范
- 调用成功后执行行动（Action）
- 不包含 UI 信息（UI 由前端决定）

---

## Tool 结构

### 基础字段

```typescript
interface Tool {
  name: string              // Tool 唯一标识
  description: string       // 描述
  parameters?: Schema       // 输入参数 Schema
  protocol: 'http' | 'mcp' | 'navigate'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string              // HTTP/MCP 协议用
  target?: string           // navigate 协议用
  onSuccess?: Action[]      // 成功后的行动
  onError?: Action[]        // 失败后的行动
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `name` | string | ✅ | Tool 唯一标识 |
| `description` | string | ✅ | 描述 |
| `parameters` | Schema | ❌ | 输入参数 Schema |
| `protocol` | string | ✅ | 调用协议 |
| `method` | string | ❌ | HTTP 方法 |
| `url` | string | ❌ | HTTP/MCP 调用地址 |
| `target` | string | ❌ | navigate 目标地址 |
| `onSuccess` | Action[] | ❌ | 成功后的行动 |
| `onError` | Action[] | ❌ | 失败后的行动 |

---

## Action（行动）

### 结构

```typescript
interface Action {
  type: 'navigate' | 'reload' | 'back' | 'message' | 'custom'
  target?: string      // navigate 用
  message?: string     // message 用
  level?: 'success' | 'error' | 'info' | 'warning'
  custom?: string      // custom 用
}
```

### 行动类型

| type | 说明 | 字段 | 示例 |
|-----|------|------|------|
| `navigate` | 导航跳转 | `target` | `{ "type": "navigate", "target": "/orders" }` |
| `reload` | 刷新当前页 | - | `{ "type": "reload" }` |
| `back` | 返回上一页 | - | `{ "type": "back" }` |
| `message` | 显示消息 | `message`, `level` | `{ "type": "message", "message": "成功", "level": "success" }` |
| `custom` | 自定义行动 | `custom` | `{ "type": "custom", "custom": "export" }` |

---

## 使用示例

### 1. HTTP 协议

```json
{
  "name": "submit_order",
  "description": "提交订单审核",
  "parameters": {
    "type": "object",
    "properties": {
      "id": { "type": "string" }
    },
    "required": ["id"]
  },
  "protocol": "http",
  "method": "POST",
  "url": "/api/orders/ORD-001/submit",
  "onSuccess": [
    { "type": "message", "message": "提交成功", "level": "success" },
    { "type": "navigate", "target": "/orders" }
  ]
}
```

### 2. Navigate 协议

```json
{
  "name": "create_order",
  "description": "创建新订单",
  "protocol": "navigate",
  "target": "/orders/new"
}
```

### 3. 带错误处理

```json
{
  "name": "delete_order",
  "description": "删除订单",
  "parameters": {
    "type": "object",
    "properties": {
      "id": { "type": "string" }
    }
  },
  "protocol": "http",
  "method": "DELETE",
  "url": "/api/orders/ORD-001",
  "onSuccess": [
    { "type": "message", "message": "删除成功", "level": "success" },
    { "type": "navigate", "target": "/orders" }
  ],
  "onError": [
    { "type": "message", "message": "删除失败", "level": "error" }
  ]
}
```

---

## Tool 在 Schema 中的位置

Tool 定义在 Schema 的 `tools` 字段中：

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

---

## 执行流程

```
用户点击 Tool 按钮
    ↓
收集参数（从 formData 或 currentData）
    ↓
调用 Tool（HTTP/MCP/Navigate）
    ↓
解析响应
    ↓
执行 Action
├── navigate → router.push(target)
├── reload → loadData()
├── back → router.back()
├── message → showToast(message, level)
└── custom → 自定义处理
```

---

## 最佳实践

### ✅ 推荐

```json
{
  "name": "submit_order",
  "description": "清晰的业务描述",
  "parameters": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "description": "订单 ID" }
    }
  },
  "protocol": "http",
  "method": "POST",
  "url": "/api/orders/submit",
  "onSuccess": [
    { "type": "message", "message": "提交成功", "level": "success" },
    { "type": "navigate", "target": "/orders" }
  ]
}
```

### ❌ 避免

```json
{
  "name": "submit",
  "ui": {             // ❌ 不要在 Tool 中包含 UI 信息
    "color": "blue",
    "variant": "primary"
  }
}
```

---

## 相关文档

| 文档 | 说明 |
|-----|------|
| [SCHEMA_SPEC.md](./SCHEMA_SPEC.md) | Schema 规范 |
| [../DESIGN.md](../DESIGN.md) | 完整设计文档 |

---

**许可:** MIT
