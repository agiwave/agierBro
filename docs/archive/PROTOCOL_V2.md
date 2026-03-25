# AgierBro 协议规范 v2.0

**状态:** 草案  
**目标:** 实现与业务无关的通用前端和通用 API 数据规范

---

## 核心原则

### 1. 统一入口
所有前端页面通过统一入口渲染，URL 通过固定规则映射到后端 API。

### 2. 数据自描述
API 返回的数据包含完整的结构描述（Schema），前端无需硬编码任何业务逻辑。

### 3. 字段分组呈现
- 连续的简单字段自动合并为一组
- 复杂字段（对象/数组）独立分组
- 按 Schema 定义的顺序依次呈现

### 4. 业务无关
前端不关心具体业务，只根据协议渲染数据和操作。

---

## URL 映射规则

### 固定映射规则

| 前端 URL | 后端 API | 说明 |
|---------|---------|------|
| `/` | `/api/index.json` | 根路径 |
| `/:entity` | `/api/:entity.json` | 实体列表 |
| `/:entity/:id` | `/api/:entity/:id.json` | 实体详情 |
| `/:entity/:id/:action` | `/api/:entity/:id/:action.json` | 实体操作 |

### 示例

```
/                       → /api/index.json
/home                   → /api/home.json
/orders                 → /api/orders.json
/orders/ORD-001         → /api/orders/ORD-001.json
/orders/ORD-001/edit    → /api/orders/ORD-001/edit.json
```

### 实现代码

```typescript
function mapUrlToApi(path: string): string {
  const cleanPath = path.split('?')[0]
  
  // 根路径
  if (cleanPath === '/' || cleanPath === '') {
    return '/api/index.json'
  }
  
  // 解析路径段
  const segments = cleanPath.split('/').filter(Boolean)
  
  if (segments.length === 1) {
    // /:entity → /api/:entity.json
    return `/api/${segments[0]}.json`
  }
  
  if (segments.length >= 2) {
    // /:entity/:id → /api/:entity/:id.json
    const [entity, id, ...rest] = segments
    return `/api/${entity}/${id}${rest.length ? '/' + rest.join('/') : ''}.json`
  }
  
  return '/api/index.json'
}
```

---

## 数据结构

### 基础响应格式

```typescript
interface ApiResponse {
  // 业务数据字段
  [key: string]: any
  
  // 元数据（以 _ 开头）
  _schema?: Schema | BuiltinSchema
  _tools?: Tool[]
  _page?: PageInfo
  items?: DataObject[]
}
```

### Schema 定义

```typescript
interface Schema {
  type: 'object'
  title?: string
  description?: string
  
  // 字段定义
  properties: Record<string, Field>
  
  // 字段顺序（可选，未指定时按 properties 顺序）
  order?: string[]
  
  // 字段分组（可选，用于高级布局）
  groups?: FieldGroup[]
  
  // 可用操作
  tools?: Tool[]
}

interface FieldGroup {
  key: string
  title: string
  description?: string
  fields: string[]  // 属于该分组的字段
  collapsed?: boolean  // 是否默认折叠
}
```

### Field 定义

```typescript
interface Field {
  // 基础属性
  type: FieldType
  title?: string
  description?: string
  default?: any
  
  // 显示控制
  visible?: boolean
  readOnly?: boolean
  required?: boolean
  
  // 语义提示（用于自动分组）
  semantic?: SemanticType
  group?: string  // 所属分组
  
  // 约束
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  minimum?: number
  maximum?: number
  enum?: EnumValue[]
  
  // 复杂类型
  properties?: Record<string, Field>  // 对象
  items?: Field                       // 数组
}

type FieldType = 
  | 'string' 
  | 'number' 
  | 'integer' 
  | 'boolean' 
  | 'date' 
  | 'date-time'
  | 'object' 
  | 'array'

type SemanticType =
  | 'id'           // 标识符
  | 'name'         // 名称
  | 'title'        // 标题
  | 'description'  // 描述
  | 'status'       // 状态
  | 'amount'       // 金额
  | 'date'         // 日期
  | 'time'         // 时间
  | 'email'        // 邮箱
  | 'phone'        // 电话
  | 'url'          // 链接
  | 'image'        // 图片
  | 'file'         // 文件
  | 'user'         // 用户
  | 'category'     // 分类
  | 'tag'          // 标签
```

### 内置 Schema 类型

```typescript
type BuiltinSchema = 
  | '@nav'      // 导航数据
  | '@link'     // 链接跳转
  | '@content'  // 内容展示
  | '@tabs'     // 标签页
  | '@tree'     // 树形结构
  | '@list'     // 列表数据
  | 'object'    // 自定义对象
```

### Section 机制

**Section** 是页面区块的通用机制，用于构建复合页面（如首页）。

```typescript
interface SectionData {
  _schema: '@hero' | '@stats' | '@features' | '@cta' | '@footer' | string
  title?: string
  description?: string
  items?: any[]
  actions?: any[]
  links?: any[]
  [key: string]: any  // 其他自定义字段
}
```

**示例：首页由多个 Section 组成**

```json
{
  "items": [
    { "_schema": "@nav", "title": "网站", "links": [...] },
    { "_schema": "@hero", "title": "欢迎", "subtitle": "...", "actions": [...] },
    { "_schema": "@stats", "items": [...] },
    { "_schema": "@features", "title": "功能", "items": [...] },
    { "_schema": "@footer", "copyright": "..." }
  ]
}
```

---

## 字段分组策略

### 自动分组规则

前端根据以下规则自动分组：

1. **简单字段** - `string`, `number`, `integer`, `boolean`, `date`
   - 连续的简单字段自动合并为一组
   - 默认组名："基本信息"

2. **复杂字段** - `object`, `array`
   - 每个复杂字段独立分组
   - 组名使用字段的 `title` 或格式化后的 key

3. **显式分组** - Schema 定义了 `groups`
   - 按照定义的分组呈现
   - 未分组的字段归入"其他"组

### 分组算法

```typescript
interface FieldSection {
  key: string
  title: string
  fields: ParsedField[]
  isComplex?: boolean
}

function groupFields(schema: Schema, data: DataObject): FieldSection[] {
  const sections: FieldSection[] = []
  const properties = schema.properties
  const order = schema.order || Object.keys(properties)
  
  // 如果有显式分组定义
  if (schema.groups && schema.groups.length > 0) {
    return groupByExplicitGroups(schema, data, order)
  }
  
  // 自动分组
  let currentSimpleFields: ParsedField[] = []
  
  for (const key of order) {
    const field = properties[key]
    if (!field || field.visible === false) continue
    
    const parsedField = parseField(key, field, data[key])
    
    if (isSimpleField(field)) {
      // 简单字段：累积到当前组
      currentSimpleFields.push(parsedField)
    } else {
      // 复杂字段：先提交之前的简单字段组
      if (currentSimpleFields.length > 0) {
        sections.push({
          key: 'basic',
          title: '基本信息',
          fields: currentSimpleFields,
          isComplex: false
        })
        currentSimpleFields = []
      }
      
      // 添加复杂字段组
      sections.push({
        key,
        title: field.title || formatLabel(key),
        fields: [parsedField],
        isComplex: true
      })
    }
  }
  
  // 提交剩余的简单字段
  if (currentSimpleFields.length > 0) {
    sections.push({
      key: 'basic',
      title: '基本信息',
      fields: currentSimpleFields,
      isComplex: false
    })
  }
  
  return sections
}

function isSimpleField(field: Field): boolean {
  return ['string', 'number', 'integer', 'boolean', 'date', 'date-time'].includes(field.type)
}
```

### 示例

```json
{
  "id": "ORD-001",
  "order_no": "ORD-20240101001",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "created_at": "2024-01-01T00:00:00Z",
  "items": [
    { "product": "商品 A", "quantity": 2, "price": 90.00 }
  ],
  "shipping_address": {
    "province": "广东省",
    "city": "深圳市",
    "detail": "南山区 xxx 路 xxx 号"
  },
  "_schema": {
    "type": "object",
    "title": "订单详情",
    "order": ["id", "order_no", "customer_name", "status", "total_amount", "created_at", "items", "shipping_address"],
    "properties": {
      "id": { "type": "string", "title": "订单 ID", "readOnly": true },
      "order_no": { "type": "string", "title": "订单编号", "readOnly": true },
      "customer_name": { "type": "string", "title": "客户姓名" },
      "status": { "type": "string", "title": "状态", "enum": [...] },
      "total_amount": { "type": "number", "title": "订单金额", "readOnly": true },
      "created_at": { "type": "string", "format": "date-time", "title": "创建时间", "readOnly": true },
      "items": { 
        "type": "array", 
        "title": "商品列表",
        "items": { "type": "object", "properties": {...} }
      },
      "shipping_address": { 
        "type": "object", 
        "title": "收货地址",
        "properties": {...}
      }
    }
  }
}
```

**渲染结果：**

```
┌─────────────────────────────────────┐
│ 订单详情                            │
├─────────────────────────────────────┤
│ 基本信息                            │
│ ┌─────────────────────────────────┐ │
│ │ 订单 ID:     ORD-001            │ │
│ │ 订单编号：ORD-20240101001       │ │
│ │ 客户姓名：张三                  │ │
│ │ 状态：草稿                      │ │
│ │ 订单金额：180.00                │ │
│ │ 创建时间：2024-01-01 00:00:00   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 商品列表                            │
│ ┌─────────────────────────────────┐ │
│ │ [商品列表内容]                  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 收货地址                            │
│ ┌─────────────────────────────────┐ │
│ │ [收货地址内容]                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Tool 定义

```typescript
interface Tool {
  // 基础信息
  name: string
  title: string
  description?: string
  
  // 输入输出定义（兼容 OpenAI Tool API）
  input_schema?: Schema
  output_schema?: Schema
  
  // 执行方式
  protocol: 'http' | 'mcp' | 'navigate'
  
  // HTTP 协议
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  
  // 导航协议
  target?: string
  
  // UI 提示（可选，不影响业务逻辑）
  ui?: {
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: string
    confirm?: string  // 二次确认提示
  }
}
```

### Tool 响应

```typescript
interface ToolResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  
  // 前端行为控制
  _navigate?: string  // 跳转路径
  _reload?: boolean   // 重新加载
  _back?: boolean     // 返回上一页
}
```

---

## 内置结构类型

### @nav（导航）

```json
{
  "icon": "📋",
  "title": "主菜单",
  "links": [
    { "icon": "🏠", "title": "首页", "url": "/home" },
    { "icon": "📦", "title": "订单", "url": "/orders" }
  ],
  "_schema": "@nav"
}
```

### @list（列表）

```json
{
  "items": [
    { "id": "1", "name": "项目 1" },
    { "id": "2", "name": "项目 2" }
  ],
  "_schema": {
    "type": "object",
    "title": "列表",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "_address": "/items/{id}.json",
          "properties": {
            "id": { "type": "string" },
            "name": { "type": "string" }
          }
        }
      }
    }
  }
}
```

### @tree（树形）

```json
{
  "title": "目录",
  "nodes": [
    {
      "title": "父节点",
      "icon": "📁",
      "children": [
        { "title": "子节点 1", "content": "/api/node1.json" },
        { "title": "子节点 2", "content": "/api/node2.json" }
      ]
    }
  ],
  "_schema": "@tree"
}
```

---

## 前端渲染流程

```
1. 用户访问 URL
   ↓
2. URL 映射到 API 路径
   ↓
3.  fetch API 获取数据
   ↓
4.  解析 _schema 类型
   ↓
5.  选择渲染策略：
   ├── 内置类型 (@nav/@tree/@tabs...) → 专用组件
   └── object → 通用对象渲染器
       ↓
   6.  解析 Schema.properties
       ↓
   7.  执行字段分组算法
       ↓
   8.  按组渲染：
       ├── 简单字段组 → 表单/表格
       └── 复杂字段组 → 嵌套组件
       ↓
   9.  渲染 tools（操作按钮）
```

---

## 示例 API 响应

### 列表页

```json
{
  "items": [
    { "id": "ORD-001", "order_no": "ORD-001", "customer": "张三", "status": "draft", "amount": 180.00 },
    { "id": "ORD-002", "order_no": "ORD-002", "customer": "李四", "status": "pending", "amount": 360.00 }
  ],
  "_page": { "number": 1, "size": 20, "total": 2 },
  "_schema": {
    "type": "object",
    "title": "订单列表",
    "properties": {
      "items": {
        "type": "array",
        "title": "订单",
        "items": {
          "type": "object",
          "_address": "/orders/{id}.json",
          "properties": {
            "id": { "type": "string", "title": "订单 ID" },
            "order_no": { "type": "string", "title": "订单编号" },
            "customer": { "type": "string", "title": "客户" },
            "status": { 
              "type": "string", 
              "title": "状态",
              "enum": [
                { "value": "draft", "label": "草稿" },
                { "value": "pending", "label": "待审核" },
                { "value": "approved", "label": "已通过" }
              ]
            },
            "amount": { "type": "number", "title": "金额", "format": "currency" }
          }
        }
      }
    },
    "tools": [
      {
        "name": "create_order",
        "title": "新建订单",
        "protocol": "navigate",
        "target": "/orders/new"
      }
    ]
  }
}
```

### 详情页

```json
{
  "id": "ORD-001",
  "order_no": "ORD-20240101001",
  "customer_name": "张三",
  "customer_phone": "13800138000",
  "customer_email": "zhangsan@example.com",
  "status": "draft",
  "total_amount": 180.00,
  "discount_amount": 20.00,
  "paid_amount": 160.00,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "items": [
    { "product_id": "P001", "product_name": "商品 A", "quantity": 2, "unit_price": 90.00 }
  ],
  "shipping_address": {
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "xxx 路 xxx 号"
  },
  "_schema": {
    "type": "object",
    "title": "订单详情",
    "order": [
      "id", "order_no", "customer_name", "customer_phone", "customer_email",
      "status", "total_amount", "discount_amount", "paid_amount",
      "created_at", "updated_at", "items", "shipping_address"
    ],
    "properties": {
      "id": { "type": "string", "title": "订单 ID", "readOnly": true },
      "order_no": { "type": "string", "title": "订单编号", "readOnly": true },
      "customer_name": { "type": "string", "title": "客户姓名", "semantic": "name" },
      "customer_phone": { "type": "string", "title": "客户电话", "semantic": "phone" },
      "customer_email": { "type": "string", "title": "客户邮箱", "semantic": "email", "format": "email" },
      "status": { 
        "type": "string", 
        "title": "状态",
        "semantic": "status",
        "enum": [
          { "value": "draft", "label": "草稿", "color": "gray" },
          { "value": "pending", "label": "待审核", "color": "orange" },
          { "value": "approved", "label": "已通过", "color": "green" }
        ]
      },
      "total_amount": { "type": "number", "title": "订单金额", "semantic": "amount", "readOnly": true },
      "discount_amount": { "type": "number", "title": "优惠金额", "semantic": "amount", "readOnly": true },
      "paid_amount": { "type": "number", "title": "已付金额", "semantic": "amount", "readOnly": true },
      "created_at": { "type": "string", "format": "date-time", "title": "创建时间", "readOnly": true },
      "updated_at": { "type": "string", "format": "date-time", "title": "更新时间", "readOnly": true },
      "items": { 
        "type": "array", 
        "title": "商品明细",
        "items": {
          "type": "object",
          "properties": {
            "product_id": { "type": "string", "title": "商品 ID" },
            "product_name": { "type": "string", "title": "商品名称" },
            "quantity": { "type": "integer", "title": "数量" },
            "unit_price": { "type": "number", "title": "单价" }
          }
        }
      },
      "shipping_address": { 
        "type": "object", 
        "title": "收货地址",
        "properties": {
          "province": { "type": "string", "title": "省份" },
          "city": { "type": "string", "title": "城市" },
          "district": { "type": "string", "title": "区县" },
          "detail": { "type": "string", "title": "详细地址" }
        }
      }
    },
    "tools": [
      {
        "name": "submit_order",
        "title": "提交审核",
        "description": "将订单提交到审核流程",
        "protocol": "http",
        "method": "POST",
        "url": "/api/orders/ORD-001/submit",
        "ui": { "variant": "primary", "confirm": "确定提交订单审核？" }
      },
      {
        "name": "cancel_order",
        "title": "取消订单",
        "description": "取消当前订单",
        "protocol": "http",
        "method": "POST",
        "url": "/api/orders/ORD-001/cancel",
        "ui": { "variant": "danger", "confirm": "确定取消订单？" }
      }
    ]
  }
}
```

---

## 迁移指南

### 从 v1.0 迁移到 v2.0

1. **Schema 结构** - 添加 `order` 字段指定字段顺序
2. **字段分组** - 可选添加 `groups` 实现显式分组
3. **语义类型** - 为字段添加 `semantic` 提示
4. **Tool 格式** - 统一使用 `protocol` 字段

---

## 附录

### A. 语义类型完整列表

| 类型 | 说明 | 示例 |
|-----|------|------|
| `id` | 标识符 | 订单 ID、用户 ID |
| `name` | 名称 | 姓名、商品名 |
| `status` | 状态 | 订单状态、审核状态 |
| `amount` | 金额 | 价格、总额 |
| `date` | 日期 | 生日、入职日期 |
| `email` | 邮箱 | user@example.com |
| `phone` | 电话 | 13800138000 |

### B. 颜色约定

| 状态 | 颜色 |
|-----|------|
| draft/草稿 | gray |
| pending/待审核 | orange |
| approved/已通过 | green |
| rejected/已拒绝 | red |
| cancelled/已取消 | gray |

---

**许可:** MIT
