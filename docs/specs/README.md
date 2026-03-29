# AgierBro 技术规范

**版本:** v6.0
**最后更新:** 2026-03-29

---

## 规范文档

| 文档 | 说明 |
|-----|------|
| [SCHEMA_SPEC.md](./SCHEMA_SPEC.md) | Schema 规范 - 数据结构定义 |
| [TOOL_SPEC.md](./TOOL_SPEC.md) | Tool 规范 - 工具描述定义 |

---

## 核心概念 (v6.0)

### 工具描述 (Tool Descriptor)

所有服务端接口返回的都是**工具的 Schema 描述**：

```typescript
interface ToolDescriptor {
  _schema: {
    in?: Schema   // 输入参数（调用工具需要什么）
    out: Schema   // 输出描述（工具返回什么）
  }
  protocol?: 'http' | 'navigate' | 'mcp'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string
}
```

**核心原则：**
- `in` 为空 → 数据展示（view 模式）
- `in` 有定义 → 表单输入（edit 模式）

### Schema

Schema 用于描述数据的结构：

```typescript
interface Schema {
  type: 'object' | 'array'
  title?: string
  properties: Record<string, Field>
  semantic?: SemanticType
}
```

**详见:** [SCHEMA_SPEC.md](./SCHEMA_SPEC.md)

### 语义类型

```typescript
type SemanticType =
  | 'nav' | 'tree' | 'tabs'
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
  | 'email' | 'phone' | 'url' | 'image' | 'file'
  | 'status' | 'amount' | 'date' | 'time'
  // ... 更多类型见 SCHEMA_SPEC.md
```

---

## 路由规则

**统一分形规则：**

```
/xxx/yyy/zzz → /api/xxx/yyy/zzz.json
```

**示例：**
- `/` → `/api/index.json`
- `/users` → `/api/users.json`
- `/users/001` → `/api/users/001.json`
- `/users/001/edit` → `/api/users/001/edit.json`

---

## 示例

### 数据展示（in 为空）

```json
{
  "id": "user-001",
  "username": "admin",
  "_schema": {
    "in": {},
    "out": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "title": "ID" },
        "username": { "type": "string", "title": "用户名" }
      }
    }
  }
}
```

### 表单输入（in 有定义）

```json
{
  "_schema": {
    "in": {
      "type": "object",
      "properties": {
        "username": { "type": "string", "required": true },
        "password": { "type": "string", "format": "password", "required": true }
      }
    },
    "out": {
      "type": "object",
      "properties": {
        "access_token": { "type": "string" }
      }
    }
  },
  "protocol": "http",
  "method": "POST",
  "url": "/api/auth/login.json"
}
```

---

## 相关文档

| 文档 | 说明 |
|-----|------|
| [ARCHITECTURE_V6.md](../ARCHITECTURE_V6.md) | v6.0 架构详解 |
| [ROUTING_REFACTOR.md](../ROUTING_REFACTOR.md) | 路由规则重构说明 |
| [VALIDATION_REPORT.md](../VALIDATION_REPORT.md) | 示例数据验证报告 |
| [CHANGELOG.md](../CHANGELOG.md) | 版本更新日志 |

---

**许可:** MIT License
