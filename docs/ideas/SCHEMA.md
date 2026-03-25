# 业务数据协议规范

## 核心理念

**数据就是纯数据。Schema 只是数据的一个字段，可以是值，也可以是链接。**

```json
// 方式一：Schema 内嵌
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": "https://api.example.com/schemas/order"
}

// 方式二：Schema 内联
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": {
    "type": "object",
    "properties": {
      "order_no": { "type": "string", "semantic": "code" },
      "customer_name": { "type": "string", "semantic": "name" }
    }
  }
}

// 方式三：无 Schema（前端已缓存或已知）
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00
}
```

---

## 一、数据结构

### 1.1 纯数据原则

数据就是普通的 JSON 对象，没有任何包装：

```json
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "customer_phone": "13800138000",
  "status": "draft",
  "items": [
    {
      "product_id": "p1",
      "product_name": "商品A",
      "quantity": 2,
      "unit_price": 100,
      "subtotal": 200
    }
  ],
  "subtotal": 200,
  "discount": 0.1,
  "total_amount": 180,
  "created_at": "2024-01-01T10:00:00Z",
  "_schema": "https://api.example.com/schemas/order"
}
```

### 1.2 Schema 字段

`_schema` 字段是特殊的元数据字段，可以是：

```yaml
_schema:
  # 字符串 - Schema URL
  - "https://api.example.com/schemas/order"
  - "/schemas/order"
  - "order"  # 短名称，前端自行解析
  
  # 对象 - 内联 Schema
  - type: object
    properties: { ... }
```

### 1.3 其他元数据字段

```yaml
# 可选的元数据字段（都以 _ 开头）
_schema: string | object    # Schema 定义或链接
_permissions: string[]       # 当前用户权限
_transitions: Transition[]   # 可用状态转换
_links: Link[]               # 相关链接
_page: Pagination            # 分页信息（列表时）
```

---

## 二、Schema 定义

### 2.1 基本结构

Schema 遵循 JSON Schema 规范，扩展了 `semantic` 等字段：

```json
{
  "type": "object",
  "properties": {
    "order_no": {
      "type": "string",
      "semantic": "code",
      "readonly": true,
      "pattern": "^ORD-[0-9]{8}$"
    },
    "customer_name": {
      "type": "string",
      "semantic": "name",
      "required": true,
      "minLength": 2,
      "maxLength": 50
    },
    "status": {
      "type": "string",
      "semantic": "status",
      "enum": [
        { "value": "draft", "label": "草稿", "color": "gray" },
        { "value": "pending", "label": "待审核", "color": "yellow" },
        { "value": "approved", "label": "已通过", "color": "green" }
      ],
      "transitions": {
        "draft": ["pending"],
        "pending": ["approved", "rejected"]
      }
    },
    "total_amount": {
      "type": "number",
      "semantic": "money",
      "readonly": true,
      "computed": "subtotal * (1 - discount)"
    }
  }
}
```

### 2.2 字段定义

```yaml
Field:
  type: string                 # 类型：string, number, integer, boolean, array, object
  semantic: string             # 语义标签（前端渲染提示）
  
  # 基础约束
  required: boolean            # 是否必填
  readonly: boolean            # 是否只读
  default: any                 # 默认值
  
  # 字符串约束
  minLength: number            # 最小长度
  maxLength: number            # 最大长度
  format: string               # 格式：date, date-time, email, phone, uri
  pattern: string              # 正则表达式
  
  # 数值约束
  minimum: number              # 最小值
  maximum: number              # 最大值
  
  # 数组约束
  minItems: number             # 最少元素
  maxItems: number             # 最多元素
  items: Field                 # 元素类型
  
  # 枚举
  enum: EnumValue[]            # 枚举值
  
  # 计算字段
  computed: string             # 计算公式
  
  # 状态转换
  transitions: object          # 状态转换规则
```

### 2.3 语义标签

```yaml
Semantics:
  # 标识
  id                           # 唯一标识
  code                         # 编码
  
  # 个人信息
  name                         # 姓名
  avatar                       # 头像
  email                        # 邮箱
  phone                        # 电话
  address                      # 地址
  
  # 内容
  title                        # 标题
  description                  # 描述
  content                      # 内容
  
  # 商业
  price                        # 价格
  quantity                     # 数量
  money                        # 金额
  
  # 状态
  status                       # 状态
  progress                     # 进度
  
  # 时间
  created_at                   # 创建时间
  updated_at                   # 更新时间
```

### 2.4 枚举值

```yaml
EnumValue:
  value: string | number       # 枚举值
  label: string                # 显示标签
  color: string                # 颜色（可选）
  disabled: boolean            # 是否禁用（可选）
```

---

## 三、API 设计

### 3.1 获取数据（带 Schema URL）

```http
GET /api/orders/123

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": "https://api.example.com/schemas/order",
  "_permissions": ["read", "update"],
  "_transitions": [
    { "event": "submit", "label": "提交审核" }
  ]
}
```

### 3.2 获取数据（带内联 Schema）

```http
GET /api/orders/123?include_schema=true

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00,
  "_schema": {
    "type": "object",
    "properties": {
      "order_no": { "type": "string", "semantic": "code" },
      "customer_name": { "type": "string", "semantic": "name" },
      "status": { "type": "string", "enum": [...] },
      "total_amount": { "type": "number", "semantic": "money" }
    }
  },
  "_permissions": ["read", "update"]
}
```

### 3.3 获取数据（无 Schema）

前端已缓存 Schema 时：

```http
GET /api/orders/123?include_schema=false

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer_name": "张三",
  "status": "draft",
  "total_amount": 180.00
}
```

### 3.4 单独获取 Schema

```http
GET /api/schemas/order

Response:
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "semantic": "id" },
    "order_no": { "type": "string", "semantic": "code", "readonly": true },
    "customer_name": { "type": "string", "semantic": "name", "required": true },
    "status": {
      "type": "string",
      "semantic": "status",
      "enum": [
        { "value": "draft", "label": "草稿" },
        { "value": "pending", "label": "待审核" },
        { "value": "approved", "label": "已通过" }
      ],
      "transitions": {
        "draft": ["pending"],
        "pending": ["approved", "rejected"]
      }
    },
    "total_amount": { "type": "number", "semantic": "money", "readonly": true }
  }
}
```

### 3.5 获取列表

```http
GET /api/orders

Response:
{
  "items": [
    { "id": "123", "order_no": "ORD-001", "status": "draft", "total_amount": 100 },
    { "id": "124", "order_no": "ORD-002", "status": "pending", "total_amount": 200 }
  ],
  "_schema": "order",
  "_page": {
    "number": 1,
    "size": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 3.6 创建数据

```http
POST /api/orders
Content-Type: application/json

{
  "customer_name": "张三",
  "customer_phone": "13800138000",
  "items": [...]
}

Response:
{
  "id": "125",
  "order_no": "ORD-003",
  "customer_name": "张三",
  "status": "draft",
  "_schema": "order",
  "_permissions": ["read", "update", "delete"],
  "_transitions": [
    { "event": "submit", "label": "提交审核" }
  ]
}
```

### 3.7 状态转换

```http
POST /api/orders/123/transitions
Content-Type: application/json

{
  "event": "submit"
}

Response:
{
  "id": "123",
  "status": "pending",
  "_transitions": [
    { "event": "approve", "label": "通过" },
    { "event": "reject", "label": "拒绝" }
  ]
}
```

---

## 四、前端渲染规则

### 4.1 类型 → 控件映射

| type | format/semantic | 前端控件 |
|------|-----------------|---------|
| string | - | 文本输入框 |
| string | email | 邮箱输入框 |
| string | phone | 电话输入框 |
| string | date | 日期选择器 |
| string | date-time | 日期时间选择器 |
| string | (enum) | 下拉选择/单选按钮组 |
| number | - | 数字输入框 |
| number | money | 金额输入框 |
| integer | - | 整数输入框 |
| boolean | - | 开关/复选框 |
| array | - | 列表编辑器 |
| object | - | 分组表单 |

### 4.2 语义 → 显示优化

| semantic | 显示方式 |
|----------|---------|
| id | 隐藏或只读 |
| code | 等宽字体 |
| name | 突出显示 |
| status | 状态标签 |
| money | 货币格式化 |
| created_at | 相对时间 |

### 4.3 约束 → 校验

| 约束 | 前端校验 |
|-----|---------|
| required | 必填提示 |
| minLength/maxLength | 长度限制 |
| minimum/maximum | 范围限制 |
| pattern | 格式校验 |
| format | 格式校验 |

---

## 五、完整示例

### 5.1 订单详情

```http
GET /api/orders/123?include_schema=true

Response:
{
  "id": "123",
  "order_no": "ORD-20240101",
  "customer": {
    "name": "张三",
    "phone": "13800138000",
    "address": "广东省深圳市南山区xxx"
  },
  "items": [
    {
      "product_id": "p1",
      "product_name": "商品A",
      "quantity": 2,
      "unit_price": 100,
      "subtotal": 200
    }
  ],
  "subtotal": 200,
  "discount": 0.1,
  "total_amount": 180,
  "status": "draft",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:30:00Z",
  "_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "semantic": "id", "readonly": true },
      "order_no": { "type": "string", "semantic": "code", "readonly": true },
      "customer": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "semantic": "name", "required": true },
          "phone": { "type": "string", "format": "phone", "required": true },
          "address": { "type": "string", "semantic": "address", "required": true }
        }
      },
      "items": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "properties": {
            "product_id": { "type": "string", "required": true },
            "product_name": { "type": "string", "semantic": "name" },
            "quantity": { "type": "integer", "minimum": 1, "semantic": "quantity" },
            "unit_price": { "type": "number", "semantic": "price" },
            "subtotal": { 
              "type": "number", 
              "semantic": "money",
              "computed": "quantity * unit_price",
              "readonly": true
            }
          }
        }
      },
      "subtotal": { 
        "type": "number", 
        "semantic": "money",
        "computed": "sum(items[].subtotal)",
        "readonly": true
      },
      "discount": { "type": "number", "minimum": 0, "maximum": 1 },
      "total_amount": { 
        "type": "number", 
        "semantic": "money",
        "computed": "subtotal * (1 - discount)",
        "readonly": true
      },
      "status": {
        "type": "string",
        "semantic": "status",
        "enum": [
          { "value": "draft", "label": "草稿", "color": "gray" },
          { "value": "pending", "label": "待审核", "color": "yellow" },
          { "value": "approved", "label": "已通过", "color": "green" },
          { "value": "rejected", "label": "已拒绝", "color": "red" }
        ],
        "transitions": {
          "draft": ["pending"],
          "pending": ["approved", "rejected"],
          "rejected": ["draft"]
        }
      },
      "created_at": { "type": "string", "format": "date-time", "semantic": "created_at", "readonly": true },
      "updated_at": { "type": "string", "format": "date-time", "semantic": "updated_at", "readonly": true }
    }
  },
  "_permissions": ["read", "update", "delete"],
  "_transitions": [
    { "event": "submit", "label": "提交审核", "confirm": "确认提交审核吗？" }
  ],
  "_links": [
    { "rel": "self", "href": "/api/orders/123" },
    { "rel": "customer", "href": "/api/customers/456" }
  ]
}
```

### 5.2 用户注册表单

```http
GET /api/forms/register?include_schema=true

Response:
{
  "username": "",
  "email": "",
  "password": "",
  "agree_terms": false,
  "_schema": {
    "type": "object",
    "properties": {
      "username": {
        "type": "string",
        "semantic": "name",
        "required": true,
        "minLength": 3,
        "maxLength": 20,
        "pattern": "^[a-zA-Z0-9_]+$"
      },
      "email": {
        "type": "string",
        "format": "email",
        "required": true
      },
      "password": {
        "type": "string",
        "semantic": "password",
        "required": true,
        "minLength": 8
      },
      "agree_terms": {
        "type": "boolean",
        "required": true
      }
    }
  }
}
```

---

## 六、优势总结

### 数据纯净

```json
// ✅ 数据就是纯数据，_schema 只是其中一个字段
{
  "id": "123",
  "name": "张三",
  "age": 25,
  "_schema": "user"
}

// ✅ Schema 可以是 URL
{
  "id": "123",
  "name": "张三",
  "_schema": "https://api.example.com/schemas/user"
}

// ✅ 也可以省略（前端已知）
{
  "id": "123",
  "name": "张三"
}
```

### 灵活性

- **Schema URL**：减少数据传输，前端可缓存
- **Schema 内联**：首次加载或 Schema 动态变化时
- **无 Schema**：前端已知 Schema，减少传输

### 兼容性

- 完全符合 RESTful 风格
- 数据就是资源本身
- `_schema` 等字段是可选的元数据
- 可与现有 API 共存

### 前端友好

- 根据 `type` + `format` + `semantic` 选择控件
- 根据约束实现校验
- 根据计算公式实现联动
- 根据状态转换渲染操作按钮