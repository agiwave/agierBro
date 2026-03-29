# AgierBro 架构文档 (v6.0)

**版本:** v6.0
**日期:** 2026-03-29
**架构主题:** 纯工具描述（in/out）

---

## 一、核心理念

### 1.1 一切皆工具描述

**核心思想：** 所有服务端接口返回的都是**工具的 Schema 描述**，包含：
- **`in`** - 工具的输入参数描述（调用工具需要什么）
- **`out`** - 工具的输出描述（工具返回什么数据）

```
┌─────────────────────────────────────────────────────────┐
│                  工具描述（Tool Descriptor）              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   {                                                     │
│     "_schema": {                                        │
│       "in": { ... },    // 输入参数描述                  │
│       "out": { ... }    // 输出描述                      │
│     },                                                  │
│     "protocol": "http",                                 │
│     "method": "POST",                                   │
│     "url": "/api/..."                                   │
│   }                                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 与 v5.0 的区别

| 版本 | 架构 | 问题 |
|-----|------|-----|
| **v5.0** | 所有接口都是工具，包含 `_tools` 数组 | 仍然区分"数据工具"和"表单工具" |
| **v6.0** | 所有接口返回工具描述，`in` 和 `out` 明确分离 | 统一模型，更清晰 |

**v5.0 的问题：**
```json
// 仍然有"数据"和"工具"的隐含区分
{
  "data": [...],
  "_tools": [{ "name": "fetch", "parameters": {} }]
}
```

**v6.0 的解决方案：**
```json
// 纯粹的工具描述，in/out 分离
{
  "_schema": {
    "in": {},  // 空 = 无需输入 = 数据展示
    "out": { "type": "object", "properties": {...} }
  }
}
```

---

## 二、架构详解

### 2.1 工具描述结构

```typescript
interface ToolDescriptor {
  // 工具描述 Schema（核心）
  _schema: {
    // 输入参数描述（调用工具需要什么）
    // 空对象或无此字段 = 无需输入 = 数据展示
    in?: Schema | Record<string, Field>
    
    // 输出描述（工具返回什么数据）
    // 描述返回数据的结构
    out: Schema | Record<string, Field>
  }
  
  // 工具执行协议（如何调用）
  protocol?: 'http' | 'navigate' | 'mcp'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string  // navigate 协议用
  
  // 可执行的后续操作
  tools?: ToolDescriptor[]
}
```

### 2.2 前端判断逻辑

```typescript
// 判断是否需要输入（有输入参数 = 需要表单）
function needsInput(data: PageDescriptor): boolean {
  const schema = data._schema
  if (!schema) return false
  
  const input = schema.in
  if (!input) return false
  
  // 检查是否有必填字段
  if (typeof input === 'object') {
    const props = input.properties || input as Record<string, Field>
    return Object.values(props).some(f => f.required === true)
  }
  
  return false
}

// 使用场景
if (needsInput(result)) {
  mode.value = 'edit'   // 需要输入，呈现表单
} else {
  mode.value = 'view'   // 无需输入，展示数据
}
```

### 2.3 三种场景

#### 场景 1：数据展示（无输入）

```json
{
  "id": "user-001",
  "username": "admin",
  "email": "admin@example.com",
  "_schema": {
    "in": {},  // 空 = 无需输入
    "out": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "title": "ID" },
        "username": { "type": "string", "title": "用户名" },
        "email": { "type": "string", "title": "邮箱" }
      }
    }
  }
}
```

**前端行为：**
- `needsInput()` → `false`
- `mode = 'view'`
- 使用 `out` schema 渲染数据

#### 场景 2：表单输入（有输入）

```json
{
  "_schema": {
    "in": {
      "type": "object",
      "title": "登录",
      "properties": {
        "username": {
          "type": "string",
          "title": "用户名",
          "required": true
        },
        "password": {
          "type": "string",
          "title": "密码",
          "format": "password",
          "required": true
        }
      }
    },
    "out": {
      "type": "object",
      "properties": {
        "access_token": { "type": "string", "title": "访问令牌" },
        "message": { "type": "string", "title": "消息" }
      }
    }
  },
  "protocol": "http",
  "method": "POST",
  "url": "/api/auth/login.json"
}
```

**前端行为：**
- `needsInput()` → `true`
- `mode = 'edit'`
- 使用 `in` schema 渲染表单
- 提交后得到 `out` 数据

#### 场景 3：导航操作

```json
{
  "_schema": {
    "in": {},
    "out": {
      "type": "object",
      "properties": {}
    }
  },
  "protocol": "navigate",
  "target": "/users"
}
```

**前端行为：**
- 直接执行导航

---

## 三、URL 映射规则（统一）

```
前端 URL              →   后端数据源
/                    →   /api/index.json
/users               →   /api/users/index.json
/users/001           →   /api/users/001/index.json
/users/001/edit      →   /api/users/001/edit.json
/users/create        →   /api/users/create.json
```

**规则说明：**
1. **资源集合** - `/users` → `/api/users/index.json`
2. **资源详情** - `/users/001` → `/api/users/001/index.json`
3. **资源操作** - `/users/001/edit` → `/api/users/001/edit.json`

---

## 四、示例数据文件结构

### 4.1 目录结构

```
public/api/
├── index.json                    # 首页（数据展示）
├── users/
│   ├── index.json                # 用户列表（数据展示）
│   ├── create.json               # 创建用户（表单输入）
│   └── user-001/
│       ├── index.json            # 用户详情（数据展示）
│       └── edit.json             # 编辑用户（表单输入）
└── auth/
    └── login.json                # 登录（表单输入）
```

### 4.2 完整示例：用户详情（数据展示）

```json
{
  "id": "user-001",
  "username": "admin",
  "email": "admin@example.com",
  "role": "管理员",
  "status": "active",
  "_schema": {
    "in": {},
    "out": {
      "type": "object",
      "title": "用户详情",
      "properties": {
        "id": { "type": "string", "title": "ID", "readOnly": true },
        "username": { "type": "string", "title": "用户名" },
        "email": { "type": "string", "title": "邮箱", "format": "email" },
        "role": { "type": "string", "title": "角色" },
        "status": { "type": "string", "title": "状态" }
      }
    }
  },
  "_tools": [
    {
      "name": "edit",
      "displayName": "编辑",
      "protocol": "navigate",
      "target": "/users/user-001/edit"
    }
  ]
}
```

### 4.3 完整示例：编辑用户（表单输入）

```json
{
  "_schema": {
    "in": {
      "type": "object",
      "title": "编辑用户",
      "properties": {
        "username": { 
          "type": "string", 
          "title": "用户名",
          "required": true
        },
        "email": { 
          "type": "string", 
          "title": "邮箱", 
          "format": "email",
          "required": true
        },
        "role": { 
          "type": "string", 
          "title": "角色",
          "required": true
        },
        "status": { 
          "type": "string", 
          "title": "状态",
          "required": true
        }
      }
    },
    "out": {
      "type": "object",
      "title": "更新结果",
      "properties": {
        "id": { "type": "string", "title": "ID" },
        "message": { "type": "string", "title": "消息" }
      }
    }
  },
  "protocol": "http",
  "method": "PUT",
  "url": "/api/users/user-001/index.json"
}
```

---

## 五、类型定义

### 5.1 核心类型

```typescript
// 工具描述（v6.0 核心）
interface ToolDescriptor {
  _schema: {
    in?: Schema | Record<string, Field>
    out: Schema | Record<string, Field>
  }
  protocol?: 'http' | 'navigate' | 'mcp'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string
  tools?: ToolDescriptor[]
}

// 页面描述（接口响应）
interface PageDescriptor extends DataObject {
  _schema: {
    in?: Schema | Record<string, Field>
    out: Schema | Record<string, Field>
  }
  _tools?: ToolDescriptor[]
  items?: PageDescriptor[]
}
```

### 5.2 API 服务

```typescript
// 获取页面数据（工具描述）
export async function fetchPageData(entity: string, id?: string): Promise<PageDescriptor>

// 提取输出 Schema
export function extractOutSchema(data: PageDescriptor): Schema | null

// 提取输入 Schema
export function extractInSchema(data: PageDescriptor): Schema | null

// 判断是否需要输入
export function needsInput(data: PageDescriptor): boolean

// 判断是否是数据工具
export function isDataTool(data: PageDescriptor): boolean
```

---

## 六、前端视图逻辑

### 6.1 Entry.vue 核心逻辑

```typescript
async function loadData() {
  // 获取数据
  const result = await fetchPageData(entity)
  
  // 提取 Schema
  outSchema.value = extractOutSchema(result)
  inSchema.value = extractInSchema(result)
  
  // 判断模式
  if (needsInput(result)) {
    mode.value = 'edit'   // 需要输入，呈现表单
  } else {
    mode.value = 'view'   // 无需输入，展示数据
  }
}
```

### 6.2 Schema 选择

```typescript
// 当前使用的 Schema
const currentSchema = computed<Schema | null>(() => {
  if (mode.value === 'edit') {
    return inSchema.value   // 表单模式用 in schema
  }
  return outSchema.value    // 数据模式用 out schema
})

// 展示的数据
const displayData = computed<DataObject>(() => {
  if (mode.value === 'edit') {
    return formData.value   // 表单模式用表单数据
  }
  return pageData.value     // 数据模式用实际数据
})
```

---

## 七、优势总结

| 方面 | 传统方案 | v6.0 工具描述 |
|-----|---------|--------------|
| **架构统一性** | 数据/工具分离 | 纯粹的工具描述 |
| **输入输出** | 混合在 schema 中 | in/out 明确分离 |
| **前端判断** | 复杂，多条件 | 统一的 `needsInput()` |
| **扩展性** | 需要区分类型 | 一切皆工具描述 |
| **Server 路由** | 不规则 | 统一 `/resource/:id/action` |

---

## 八、迁移指南

### 8.1 从 v5.0 迁移

**v5.0 格式：**
```json
{
  "data": [...],
  "_schema": { ... },
  "_tools": [{ "name": "fetch", "parameters": {} }]
}
```

**v6.0 格式：**
```json
{
  "data": [...],
  "_schema": {
    "in": {},
    "out": { "type": "object", "properties": {...} }
  },
  "_tools": [...]
}
```

### 8.2 关键变更

1. **Schema 结构** - 从单一 schema 改为 `in/out` 分离
2. **判断逻辑** - 从 `hasInputParameters(tool)` 改为 `needsInput(data)`
3. **类型名称** - `Tool` → `ToolDescriptor`（保留 `Tool` 向后兼容）

---

## 九、版本信息

**当前版本:** 6.0.0
**发布日期:** 2026-03-29
**破坏性变更:** 是（需要更新数据文件格式）

---

**许可:** MIT License
