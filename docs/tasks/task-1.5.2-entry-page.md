# 任务 1.5.2 - 实现统一入口页面

**任务 ID:** task-1.5.2  
**优先级:** P0  
**状态:** ✅ 已完成  
**完成日期:** 2024-03-17  
**文件:** `src/views/Entry.vue`

---

## 任务描述

实现 AgierBro 的统一入口页面，所有页面都通过 `/page/:entity/:id?` 访问，入口页面自动根据数据类型决定渲染方式（列表/详情/表单）。

## 核心设计理念

**一个入口，自动渲染**

```
用户访问 /page/orders
    ↓
获取数据 /api/orders
    ↓
判断数据类型
    ├─ 数组 → 渲染列表 (SchemaList)
    └─ 对象 → 渲染详情 (SchemaDetail)
         └─ mode=edit → 渲染表单 (SchemaForm)
```

## 路由设计

```typescript
{
  // 统一入口页面
  path: '/page/:entity/:id?',
  name: 'entry',
  component: () => import('@/views/Entry.vue')
}
```

### 路由示例

| URL | 说明 | 渲染 |
|-----|------|------|
| `/page/orders` | 订单列表 | SchemaList |
| `/page/orders/1` | 订单 1 详情 | SchemaDetail (view) |
| `/page/orders/1?mode=edit` | 编辑订单 1 | SchemaDetail (edit) |
| `/page/register?mode=edit` | 注册表单 | SchemaForm |

## 组件逻辑

### 1. 页面类型判断

```typescript
const pageType = computed(() => {
  if (!data.value) return 'detail'
  
  // 如果是数组，渲染列表
  if (Array.isArray(data.value)) {
    return 'list'
  }
  
  // 如果有 _form 标记或处于编辑模式，渲染表单
  if (data.value._form || route.query.mode === 'edit') {
    return 'form'
  }
  
  // 默认渲染详情
  return 'detail'
})
```

### 2. 数据加载

```typescript
async function loadData() {
  loading.value = true
  error.value = ''
  
  try {
    const { entity, id } = route.params
    
    // 构建 API URL
    const url = id
      ? `/api/${entity}/${id}`
      : `/api/${entity}`
    
    // 获取数据
    const result = await fetchData(url)
    data.value = result
    
    // 获取 Schema
    let schemaUrl = result._schema
    if (!schemaUrl && entity) {
      schemaUrl = `/api/schemas/${entity}.json`
    }
    
    if (schemaUrl) {
      schema.value = typeof schemaUrl === 'string'
        ? await fetchSchema(schemaUrl)
        : schemaUrl
    }
    
    // 获取操作
    operations.value = result._operations || []
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}
```

### 3. 操作处理

```typescript
function handleAction(action: { type: string; event?: string; data?: any }) {
  switch (action.type) {
    case 'navigate':
      router.push(action.event || '/')
      break
    case 'create':
      router.push({ query: { mode: 'edit' } })
      break
    case 'edit':
      router.push({ query: { mode: 'edit' } })
      break
    case 'delete':
      // TODO: 删除确认
      break
    case 'transition':
      // TODO: 状态转换
      break
  }
}
```

## 状态管理

```typescript
const loading = ref(true)      // 加载状态
const error = ref('')          // 错误信息
const schema = ref<Schema | null>(null)    // Schema
const data = ref<EntityData | null>(null)  // 数据
const operations = ref<Operation[]>([])    // 操作列表
```

## 模板结构

```vue
<template>
  <div class="entry-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">...</div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">...</div>
    
    <!-- 正常内容 -->
    <template v-else>
      <!-- 列表模式 -->
      <SchemaList v-if="pageType === 'list'" ... />
      
      <!-- 详情/表单模式 -->
      <SchemaDetail v-else-if="pageType === 'detail' || pageType === 'form'" ... />
      
      <!-- 未知类型 -->
      <div v-else class="unknown-type">...</div>
    </template>
  </div>
</template>
```

## 样式特性

- 加载动画（旋转 spinner）
- 错误状态提示
- 重试按钮
- 响应式布局

## 使用示例

### 访问列表页面

```
GET /page/orders
→ 自动获取 /api/orders
→ 渲染订单列表
```

### 访问详情页面

```
GET /page/orders/ORD-001
→ 自动获取 /api/orders/ORD-001
→ 渲染订单详情
```

### 编辑模式

```
GET /page/orders/ORD-001?mode=edit
→ 自动获取 /api/orders/ORD-001
→ 渲染编辑表单
```

## 优势

1. **统一入口** - 所有页面共用一个组件，代码复用
2. **自动判断** - 根据数据类型自动选择渲染方式
3. **易于扩展** - 新增实体无需创建新页面
4. **Server 驱动** - Server 返回的数据决定 UI 形态

## 后续优化

1. 支持页面缓存
2. 支持预加载
3. 支持离线模式
4. 支持页面过渡动画
5. 支持面包屑导航
