# 任务 1.2.1 - 实现 Schema 解析器

**任务 ID:** task-1.2.1  
**优先级:** P0  
**状态:** ✅ 已完成  
**完成日期:** 2024-01-01  
**文件:** `src/composables/useSchemaParser.ts`

---

## 任务描述

实现 Schema 解析器，将 JSON Schema 转换为前端可用的表单字段配置，并提供字段验证功能。

## 核心功能

### 1. parseSchema - 解析 Schema

将 Schema 转换为 FormField 数组：

```typescript
function parseSchema(schema: Schema, data: EntityData = {}): FormField[] {
  const fields: FormField[] = []
  
  for (const [key, property] of Object.entries(schema.properties)) {
    fields.push({
      key,
      property,
      value: data[key] !== undefined ? data[key] : getDefaultValue(property),
      visible: true
    })
  }
  
  return fields
}
```

### 2. getDefaultValue - 获取默认值

根据字段类型返回合适的默认值：

```typescript
function getDefaultValue(property: SchemaProperty): any {
  if (property.default !== undefined) {
    return property.default
  }
  
  switch (property.type) {
    case 'string': return ''
    case 'number':
    case 'integer': return 0
    case 'boolean': return false
    case 'array': return []
    case 'object': return {}
    case 'date': return ''
    default: return null
  }
}
```

### 3. validateField - 验证单个字段

支持以下验证规则：

```typescript
function validateField(key: string, value: any, property: SchemaProperty): string | null {
  // 必填校验
  if (property.required && !value) {
    return `${key} 是必填项`
  }
  
  // 字符串长度校验
  if (property.type === 'string') {
    if (property.minLength && value.length < property.minLength) {
      return `${key} 长度不能少于 ${property.minLength} 个字符`
    }
    if (property.maxLength && value.length > property.maxLength) {
      return `${key} 长度不能超过 ${property.maxLength} 个字符`
    }
    // 正则校验
    if (property.pattern && !new RegExp(property.pattern).test(value)) {
      return `${key} 格式不正确`
    }
  }
  
  // 数值范围校验
  if (property.type === 'number' || property.type === 'integer') {
    if (property.minimum !== undefined && value < property.minimum) {
      return `${key} 不能小于 ${property.minimum}`
    }
    if (property.maximum !== undefined && value > property.maximum) {
      return `${key} 不能大于 ${property.maximum}`
    }
  }
  
  return null
}
```

### 4. validateForm - 验证整个表单

```typescript
function validateForm(fields: FormField[]): Record<string, string> {
  const errors: Record<string, string> = {}
  
  for (const field of fields) {
    const error = validateField(field.key, field.value, field.property)
    if (error) {
      errors[field.key] = error
    }
  }
  
  return errors
}
```

## 使用示例

```typescript
import { useSchemaParser } from '@/composables/useSchemaParser'

const { parseSchema, validateField, validateForm } = useSchemaParser()

// 解析 Schema
const fields = parseSchema(schema, data)

// 验证字段
const error = validateField('name', '', { type: 'string', required: true })

// 验证表单
const errors = validateForm(fields)
```

## 相关文件

- `src/composables/useSchemaParser.ts` - Schema 解析器
- `src/composables/useComputedParser.ts` - 计算公式解析器（待创建）

## 后续优化

1. 支持异步验证（如检查用户名是否已存在）
2. 支持跨字段验证（如确认密码）
3. 支持自定义验证规则
4. 支持 i18n 错误消息
