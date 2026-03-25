# 任务 1.3.1 - 实现 SchemaForm 动态表单组件

**任务 ID:** task-1.3.1  
**优先级:** P0  
**状态:** ✅ 已完成  
**完成日期:** 2024-01-01  
**文件:** `src/components/SchemaForm.vue`

---

## 任务描述

实现通用的动态表单组件，根据 Schema 自动渲染合适的输入控件。

## 组件接口

### Props

```typescript
interface SchemaFormProps {
  schema: Schema           // Schema 定义
  data: EntityData         // 表单数据
  readonly?: boolean       // 是否只读模式
}
```

### Events

```typescript
interface SchemaFormEvents {
  submit: (data: EntityData) => void   // 提交表单
  reset: () => void                     // 重置表单
}
```

## 类型到控件的映射

| type | format/semantic | 渲染控件 |
|------|-----------------|---------|
| string | - | 文本输入框 |
| string | email | 邮箱输入框 |
| string | phone | 电话输入框 |
| string | date | 日期选择器 |
| string | date-time | 日期时间选择器 |
| string | enum | 下拉选择器 |
| number | - | 数字输入框 |
| number | money | 金额输入框 |
| integer | - | 整数输入框 |
| boolean | - | 开关/复选框 |
| array | - | 列表编辑器 |
| object | - | 分组表单 |

## 核心功能

### 1. 字段标签生成

```typescript
function getFieldLabel(key: string, property: SchemaProperty): string {
  const semanticLabels: Record<string, string> = {
    id: 'ID',
    name: '姓名',
    email: '邮箱',
    phone: '电话',
    status: '状态',
    created_at: '创建时间'
  }
  
  if (property.semantic && semanticLabels[property.semantic]) {
    return semanticLabels[property.semantic]
  }
  
  return key.replace(/_/g, ' ')
}
```

### 2. 输入框类型判断

```typescript
function getInputType(property: SchemaProperty): string {
  if (property.format === 'email') return 'email'
  if (property.format === 'date') return 'date'
  if (property.format === 'date-time') return 'datetime-local'
  if (property.format === 'phone') return 'tel'
  if (property.semantic === 'password') return 'password'
  return 'text'
}
```

### 3. 值格式化

```typescript
function formatValue(value: any, property: SchemaProperty): string {
  if (value === null || value === undefined) return ''
  
  // 布尔值
  if (property.type === 'boolean') {
    return value ? '是' : '否'
  }
  
  // 枚举值
  if (property.enum) {
    const item = property.enum.find(e => e.value === value)
    return item ? item.label : String(value)
  }
  
  // 金额
  if (property.semantic === 'money' || property.semantic === 'price') {
    return `¥${Number(value).toFixed(2)}`
  }
  
  return String(value)
}
```

### 4. 表单验证

```typescript
function handleSubmit() {
  if (!validate()) return
  
  const formData = {}
  for (const field of fields.value) {
    formData[field.key] = field.value
  }
  
  emit('submit', formData)
}
```

## 样式特性

- 必填标记（红色 *）
- 输入框聚焦高亮
- 错误提示显示
- 只读字段样式
- 响应式布局

## 使用示例

```vue
<template>
  <SchemaForm
    :schema="orderSchema"
    :data="orderData"
    @submit="handleSubmit"
    @reset="handleReset"
  />
</template>

<script setup>
import SchemaForm from '@/components/SchemaForm.vue'

const orderSchema = {
  type: 'object',
  properties: {
    customer_name: {
      type: 'string',
      semantic: 'name',
      required: true
    },
    status: {
      type: 'string',
      enum: [
        { value: 'draft', label: '草稿' },
        { value: 'pending', label: '待审核' }
      ]
    }
  }
}

const orderData = {
  customer_name: '张三',
  status: 'draft'
}

function handleSubmit(data) {
  console.log('提交数据:', data)
}
</script>
```

## 后续优化

1. 支持字段联动（如选择省市区）
2. 支持动态显示/隐藏字段
3. 支持自定义验证规则
4. 支持文件上传
5. 支持富文本编辑器
