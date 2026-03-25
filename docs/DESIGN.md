# AgierBro 设计文档

**版本:** 4.1  
**最后更新:** 2026-03-24  
**核心原则:** 统一语义类型，简化协议设计

---

## 核心理念

### Server 职责

提供两样东西：
1. **数据** - 业务数据本身
2. **Schema** - 数据自我描述（包含语义类型）

```json
{
  "业务数据": "...",
  "_schema": {
    "type": "object",
    "semantic": "nav",
    "properties": {...}
  }
}
```

### App 职责

1. **理解 Schema** - 通过 `_schema` 理解数据结构
2. **识别语义** - 通过 `semantic` 选择渲染组件
3. **自主呈现** - 根据语义自动渲染

---

## 统一语义类型

### 设计原则

> **所有语义类型平级，无特殊前缀，无分类注释**

```typescript
type SemanticType =
  | 'nav' | 'tree' | 'tabs'
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
  | 'id' | 'title' | 'name' | 'description'
  | 'status' | 'amount' | 'date' | 'time'
  | 'email' | 'phone' | 'url' | 'image' | 'file'
  | 'user' | 'category' | 'tag'
  | 'action' | 'link'
```

---

## Schema 格式

### 标准格式

```json
{
  "业务数据": "...",
  "_schema": {
    "type": "object",
    "semantic": "nav",
    "properties": {...}
  }
}
```

### 简化格式（兼容）

```json
{
  "_schema": "nav",
  "links": [...]
}
```

---

## Tool 协议（简化版）

```typescript
interface Tool {
  name: string
  description: string
  parameters?: Schema
  protocol: 'http' | 'mcp' | 'navigate'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string  // navigate 协议用
  onSuccess?: Action[]
  onError?: Action[]
}
```

**示例:**
```json
{
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
        { "type": "message", "message": "提交成功", "level": "success" },
        { "type": "navigate", "target": "/orders" }
      ]
    }
  ]
}
```
