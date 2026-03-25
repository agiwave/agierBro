# 任务 1.4.1 - 实现 API 客户端

**任务 ID:** task-1.4.1  
**优先级:** P0  
**状态:** ✅ 已完成  
**完成日期:** 2024-01-01  
**文件:** `src/services/api.ts`

---

## 任务描述

实现 AgierBro 的 API 客户端，处理数据获取。核心原则：

1. **Schema 只是数据的一个字段** - 不需要单独获取
2. **页面路由与 API 地址映射** - `/page/xxx` → `/api/xxx.json`
3. **Schema 内联在数据中** - 数据返回时已包含完整的 Schema

## API 设计原则

### 1. 页面数据地址映射

```
页面路由              API 地址
/page/index    →     /api/index.json
/page/users    →     /api/users.json
/page/orders   →     /api/orders.json
/page/orders/1 →     /api/orders/1.json
```

### 2. 数据结构

每个 API 返回的数据都是纯 JSON，包含：

```json
{
  // 业务数据字段
  "id": "ORD-001",
  "order_no": "ORD-20240101001",
  "customer_name": "张三",
  
  // 元数据字段（都以 _ 开头）
  "_schema": { ... },           // Schema（内联对象或 URL）
  "_permissions": ["read", "update"],
  "_operations": [...],
  "_transitions": [...]
}
```

### 3. Schema 内联

Schema 直接内联在数据中，不需要单独获取：

```json
{
  "id": "ORD-001",
  "customer_name": "张三",
  "_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "semantic": "id", "readonly": true },
      "customer_name": { "type": "string", "semantic": "name", "required": true }
    }
  }
}
```

## 核心函数

### fetchPageData

获取页面数据：

```typescript
async function fetchPageData(entity: string, id?: string): Promise<EntityData> {
  const url = id
    ? `${BASE_URL}/${entity}/${id}.json`
    : `${BASE_URL}/${entity}.json`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${url}`)
  }
  return response.json()
}
```

### extractSchema

从数据中提取 Schema：

```typescript
function extractSchema(data: EntityData): Schema | null {
  const schemaRef = data._schema
  
  if (!schemaRef) return null
  
  // 如果_schema 是对象，直接返回（内联 Schema）
  if (typeof schemaRef === 'object') {
    return schemaRef as Schema
  }
  
  // 如果_schema 是字符串
  if (typeof schemaRef === 'string') {
    // 完整 URL 或相对路径 - 需要单独获取（不推荐）
    if (schemaRef.startsWith('http') || schemaRef.startsWith('/')) {
      console.warn('Schema should be inlined in data')
      return null
    }
    
    // 短名称 - 从 _schemas 字段查找
    if ((data as any)._schemas) {
      const schemas = (data as any)._schemas as Record<string, Schema>
      return schemas[schemaRef] || null
    }
  }
  
  return null
}
```

## 使用示例

### Entry.vue 中的数据加载

```typescript
async function loadData() {
  const { entity, id } = route.params
  
  // 1. 获取页面数据（包含内联 Schema）
  const result = await fetchPageData(entity as string, id as string)
  data.value = result
  
  // 2. 从数据中提取 Schema
  schema.value = extractSchema(result)
  
  // 3. 获取操作
  operations.value = result._operations || []
}
```

## 文件结构

```
public/api/
├── orders.json           # 订单列表
├── orders/
│   ├── 1.json           # 订单 1 详情
│   └── 2.json           # 订单 2 详情
├── register.json        # 注册表单
└── users.json           # 用户列表
```

## 注意事项

1. **Schema 应该内联** - 避免额外的网络请求
2. **短名称引用** - 只有在 Schema 很大且复用时使用
3. **URL 引用** - 不推荐，会破坏"数据即 UI"的原则

## 后续优化

1. 支持批量获取（列表页同时获取多个实体）
2. 支持增量更新（只获取变化的字段）
3. 支持离线缓存
4. 支持请求拦截和响应拦截
