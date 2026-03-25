# 任务 1.1.1 - 定义核心 TypeScript 类型

**任务 ID:** task-1.1.1  
**优先级:** P0  
**状态:** ✅ 已完成  
**完成日期:** 2024-01-01  
**文件:** `src/types/schema.ts`

---

## 任务描述

定义 AgierBro 项目的核心 TypeScript 类型系统，包括 Schema、Entity、Field 等基础类型。

## 类型定义

### SchemaProperty

字段属性定义，支持以下类型和约束：

```typescript
interface SchemaProperty {
  // 基础类型
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'date'
  
  // 语义标签（用于 UI 渲染优化）
  semantic?: string
  
  // 基础约束
  required?: boolean
  readonly?: boolean
  default?: any
  
  // 字符串约束
  minLength?: number
  maxLength?: number
  format?: string        // email, phone, date, date-time, uri
  pattern?: string       // 正则表达式
  
  // 数值约束
  minimum?: number
  maximum?: number
  
  // 数组约束
  minItems?: number
  maxItems?: number
  items?: SchemaProperty
  
  // 对象约束
  properties?: Record<string, SchemaProperty>
  
  // 枚举
  enum?: EnumValue[]
  
  // 计算字段
  computed?: string
  
  // 状态转换
  transitions?: Record<string, string[]>
  
  // 描述
  description?: string
}
```

### Schema

完整的 Schema 定义：

```typescript
interface Schema {
  type: 'object'
  properties: Record<string, SchemaProperty>
  title?: string
  description?: string
}
```

### EntityData

实体数据结构：

```typescript
interface EntityData {
  [key: string]: any
  _schema?: string | Schema      // Schema URL 或内联 Schema
  _permissions?: string[]         // 权限列表
  _transitions?: Transition[]     // 可用状态转换
  _links?: Link[]                 // 相关链接
  _operations?: Operation[]       // 可用操作
  items?: EntityData[]            // 列表数据
  _page?: PageInfo                // 分页信息
}
```

### Operation

操作定义：

```typescript
interface Operation {
  type: 'create' | 'update' | 'delete' | 'transition' | 'navigate' | string
  event?: string
  label: string
  variant?: 'primary' | 'secondary' | 'danger' | string
  confirm?: string
}
```

### PageInfo

分页信息：

```typescript
interface PageInfo {
  number: number    // 当前页码
  size: number      // 每页大小
  total: number     // 总记录数
  pages: number     // 总页数
}
```

## 语义标签列表

| 标签 | 说明 | UI 渲染建议 |
|-----|------|-----------|
| id | 唯一标识 | 只读/隐藏 |
| name | 姓名 | 突出显示 |
| email | 邮箱 | 邮箱输入框 |
| phone | 电话 | 电话输入框 |
| address | 地址 | 多行文本 |
| status | 状态 | 状态标签 |
| money/price | 金额 | 货币格式化 |
| quantity | 数量 | 数字输入 + 步进器 |
| created_at | 创建时间 | 相对时间显示 |

## 相关文件

- `src/types/schema.ts` - 核心类型定义
- `src/types/operation.ts` - 操作类型（待创建）
- `src/types/ui.ts` - UI 组件类型（待创建）

## 参考资料

- [JSON Schema 规范](https://json-schema.org/)
- [项目 Schema 规范](./SCHEMA.md)
