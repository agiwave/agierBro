# AgierBro Schema 设计核心思想

## 核心理念

### 1. 地址即对象 (URL = Object)

**每一个 API 地址对应一个对象实例**

```
/api/login          →  登录对象
/api/users          →  用户列表对象
/api/users/123      →  用户 123 对象
/api/orders         →  订单列表对象
/api/orders/ORD-001 →  订单 ORD-001 对象
```

这个对象包含：
- **数据字段** - 对象的属性值
- **Schema** - 描述对象的结构
- **操作** - 对象可调用的方法

### 2. 每个对象都有 Schema

**Schema 是对象的元数据描述，必须存在（内联或引用）**

```json
{
  "id": "123",
  "name": "张三",
  
  // Schema 必须存在，可以是：
  "_schema": { ... }           // 1. 内联对象（推荐）
  "_schema": "/schemas/user"   // 2. Schema 地址（复用场景）
}
```

### 3. Schema 本身也是对象

**Schema 也是数据对象，可以有（或没有）自己的 Schema**

```json
// Schema 对象
{
  "type": "object",
  "title": "用户",
  "properties": {
    "id": { "type": "string", "semantic": "id" },
    "name": { "type": "string", "semantic": "name" }
  },
  "actions": [
    { "name": "save", "label": "保存" },
    { "name": "cancel", "label": "取消" }
  ]
  
  // Schema 本身也可以有 Schema（元 Schema），但通常不需要
  // "_schema": { ... }  // 可选
}
```

### 4. Schema 描述数据和可调用方法

**Schema = 数据结构 + 操作方法**

```json
{
  "type": "object",
  
  // 4.1 数据字段描述
  "properties": {
    "username": {
      "type": "string",
      "semantic": "name",
      "required": true
    },
    "password": {
      "type": "string",
      "semantic": "password",
      "required": true
    }
  },
  
  // 4.2 可调用的方法（类似 Tool）
  "actions": [
    {
      "name": "login",
      "label": "登录",
      "method": "POST",
      "url": "/api/login",
      "payload": {
        "username": "${username}",
        "password": "${password}"
      }
    },
    {
      "name": "register",
      "label": "注册",
      "method": "POST",
      "url": "/api/register"
    }
  ]
}
```

### 5. 登录页面示例

**登录页面 = 登录对象，包含数据和操作**

```json
// GET /api/login
{
  // 对象数据
  "username": "",
  "password": "",
  "remember": false,
  
  // Schema 描述
  "_schema": {
    "type": "object",
    "title": "用户登录",
    "properties": {
      "username": {
        "type": "string",
        "semantic": "name",
        "required": true
      },
      "password": {
        "type": "string",
        "semantic": "password",
        "required": true
      },
      "remember": {
        "type": "boolean",
        "default": false
      }
    },
    
    // 可调用的操作
    "actions": [
      {
        "name": "login",
        "label": "登录",
        "type": "submit",
        "variant": "primary"
      },
      {
        "name": "register",
        "label": "注册账号",
        "type": "navigate",
        "navigateTo": "/page/register"
      }
    ]
  }
}
```

### 6. 详情页的灵活性

**前端根据策略决定如何呈现**

#### 简单表单 - 单字段平铺

```json
// GET /api/users/123
{
  "id": "123",
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  
  "_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "readonly": true },
      "name": { "type": "string", "semantic": "name" },
      "email": { "type": "string", "format": "email" },
      "phone": { "type": "string", "format": "phone" }
    }
  }
}
```

前端渲染：所有字段平铺展示

#### 复杂表单 - 前端策略决定呈现方式

```json
// GET /api/users/123
{
  "id": "123",
  "name": "张三",
  "email": "zhangsan@example.com",
  
  // 简单字段
  "phone": "13800138000",
  "address": "北京市朝阳区 xxx",
  
  // 复杂对象字段
  "department": {
    "id": "dept-001",
    "name": "技术部",
    "parent": {
      "id": "dept-root",
      "name": "总公司"
    }
  },
  
  "profile": {
    "bio": "个人简介...",
    "skills": ["Vue", "React", "Node.js"],
    "projects": [
      { "name": "项目 A", "role": "负责人" },
      { "name": "项目 B", "role": "核心开发" }
    ]
  },
  
  "_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "readonly": true },
      "name": { "type": "string", "semantic": "name" },
      "email": { "type": "string", "format": "email" },
      "phone": { "type": "string", "format": "phone" },
      "address": { "type": "string", "semantic": "address" },
      
      // 对象类型字段
      "department": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "parent": { "type": "object" }
        }
      },
      
      "profile": {
        "type": "object",
        "properties": {
          "bio": { "type": "string" },
          "skills": { "type": "array", "items": { "type": "string" } },
          "projects": { "type": "array" }
        }
      }
    }
  }
}
```

**前端呈现策略（由前端决定）：**

#### 策略 A：Tabs 分组
```
[ 基本信息 ] [ 部门信息 ] [ 个人资料 ]
┌─────────────────────────────────────┐
│ 基本信息                            │
│ 姓名：张三                          │
│ 邮箱：zhangsan@example.com          │
│ 电话：13800138000                   │
│ 地址：北京市朝阳区 xxx              │
└─────────────────────────────────────┘
```

#### 策略 B：卡片分组
```
┌─ 基本信息 ─────────────────────────┐
│ 姓名：张三                          │
│ 邮箱：zhangsan@example.com          │
└─────────────────────────────────────┘

┌─ 部门信息 ─────────────────────────┐
│ 部门：技术部                        │
│ 上级：总公司                        │
└─────────────────────────────────────┘

┌─ 个人资料 ─────────────────────────┐
│ 简介：个人简介...                   │
│ 技能：Vue, React, Node.js          │
└─────────────────────────────────────┘
```

### 7. 列表对象

**列表 = 对象数组 + 列表 Schema + 列表操作**

```json
// GET /api/users
{
  // 列表数据
  "items": [
    { "id": "1", "name": "张三", "email": "zhangsan@example.com" },
    { "id": "2", "name": "李四", "email": "lisi@example.com" }
  ],
  
  // 分页信息
  "_page": {
    "number": 1,
    "size": 20,
    "total": 100,
    "pages": 5
  },
  
  // 列表的 Schema
  "_schema": {
    "type": "list",
    "itemSchema": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "readonly": true },
        "name": { "type": "string", "semantic": "name" },
        "email": { "type": "string", "format": "email" }
      }
    },
    
    // 列表级别的操作
    "actions": [
      {
        "name": "create",
        "label": "新建用户",
        "type": "navigate",
        "navigateTo": "/page/users/new"
      }
    ],
    
    // 项级别的操作
    "itemActions": [
      {
        "name": "view",
        "label": "查看",
        "type": "navigate",
        "navigateTo": "/page/users/${id}"
      },
      {
        "name": "edit",
        "label": "编辑",
        "type": "navigate",
        "navigateTo": "/page/users/${id}?mode=edit"
      },
      {
        "name": "delete",
        "label": "删除",
        "type": "action",
        "method": "DELETE",
        "url": "/api/users/${id}"
      }
    ]
  }
}
```

---

## Schema 类型体系

```typescript
// 基础 Schema
interface BaseSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'list'
  title?: string
  description?: string
  required?: boolean
  readonly?: boolean
  default?: any
  
  // 语义标签
  semantic?: string
  
  // 验证规则
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  
  // 枚举
  enum?: EnumValue[]
  
  // 操作
  tools: Action[]
}

// 对象 Schema
interface ObjectSchema extends BaseSchema {
  type: 'object'
  properties: Record<string, FieldSchema>
}

// 数组 Schema
interface ArraySchema extends BaseSchema {
  type: 'array'
  items: FieldSchema
}

// 列表 Schema（特殊的数组）
interface ListSchema extends BaseSchema {
  type: 'list'
  itemSchema: ObjectSchema
  itemActions?: Action[]
}

// 字段 Schema（可以是任何类型）
type FieldSchema = BaseSchema | ObjectSchema | ArraySchema | ListSchema

// 操作（方法）
interface Action {
  name: string
  label: string
  type: 'submit' | 'navigate' | 'action' | 'transition'
  
  // 导航
  navigateTo?: string
  
  // HTTP 请求
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  payload?: Record<string, any>
  
  // UI 样式
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: string
  
  // 确认
  confirm?: string
}
```

---

## 数据流示例

### 登录流程

```
1. 访问 /page/login
   ↓
2. 获取 /api/login.json
   {
     "username": "",
     "password": "",
     "_schema": {
       "type": "object",
       "properties": { ... },
       "tools": [
         { "name": "login", "label": "登录" },
         { "name": "register", "label": "注册" }
       ]
     }
   }
   ↓
3. 前端渲染登录表单
   - 显示 username 输入框
   - 显示 password 输入框
   - 显示"登录"按钮
   - 显示"注册"按钮
   ↓
4. 用户点击"登录"
   ↓
5. 前端调用 login action
   POST /api/login
   { "username": "admin", "password": "123456" }
   ↓
6. 服务器返回结果
   {
     "success": true,
     "token": "xxx",
     "_schema": { ... }
   }
```

### 用户详情流程

```
1. 访问 /page/users/123
   ↓
2. 获取 /api/users/123.json
   ↓
3. 前端分析 Schema
   - 简单字段：name, email, phone
   - 复杂字段：department (object), profile (object)
   ↓
4. 前端决定呈现策略
   方案 A：Tabs - 基本信息 | 部门信息 | 个人资料
   方案 B：分组卡片
   方案 C：手风琴折叠
   ↓
5. 渲染页面
   ↓
6. 用户点击"编辑"
   ↓
7. 切换到编辑模式
```

---

## 实施优先级

### Phase 1: 基础对象支持 ✅
- [x] 简单对象（扁平字段）
- [x] 内联 Schema
- [x] 基本操作（submit/navigate）

### Phase 2: 对象操作
- [ ] Action 系统（方法调用）
- [ ] 登录/注册页面
- [ ] 状态转换

### Phase 3: 复杂对象
- [ ] 嵌套对象字段
- [ ] 前端呈现策略（Tabs/分组）
- [ ] 对象数组字段

### Phase 4: 列表对象
- [ ] 列表渲染
- [ ] 列表操作
- [ ] 项操作
- [ ] 分页

### Phase 5: 高级特性
- [ ] Schema 继承
- [ ] 动态 Schema
- [ ] 条件渲染
