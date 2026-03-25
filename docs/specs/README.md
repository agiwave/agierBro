# AgierBro 技术规范

**版本:** 4.1  
**最后更新:** 2026-03-24

---

## 规范文档

| 文档 | 说明 | 状态 |
|-----|------|------|
| [SCHEMA_SPEC.md](./SCHEMA_SPEC.md) | Schema 规范 - 数据结构定义 | ✅ 最新 |
| [TOOL_SPEC.md](./TOOL_SPEC.md) | Tool 规范 - 操作定义 | ✅ 最新 |

---

## 核心概念

### Schema

Schema 用于描述数据对象的结构和语义：

```typescript
interface Schema {
  type: 'object' | 'array'
  semantic?: SemanticType      // 语义类型
  properties: Record<string, Field>
  tools?: Tool[]               // 可用操作
}
```

**详见:** [SCHEMA_SPEC.md](./SCHEMA_SPEC.md)

### Tool

Tool 用于定义数据对象可执行的操作：

```typescript
interface Tool {
  name: string
  description: string
  parameters?: Schema
  protocol: 'http' | 'mcp' | 'navigate'
  onSuccess?: Action[]
}
```

**详见:** [TOOL_SPEC.md](./TOOL_SPEC.md)

---

## 语义类型

### 统一语义类型体系

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

**特点:**
- 所有类型平级，无特殊前缀
- 用于前端渲染选择
- 易于扩展

---

## 相关文档

| 文档 | 说明 |
|-----|------|
| [../DESIGN.md](../DESIGN.md) | 完整设计文档 |
| [../README.md](../README.md) | 文档中心索引 |

---

**许可:** MIT
