# AgierBro 路由规则重构文档

**版本:** v6.1.0
**日期:** 2026-03-29
**重构主题:** 统一分形路由规则

---

## 一、重构背景

### 1.1 旧路由规则的问题

之前的路由规则存在不一致性：

```
/users               → /api/users/index.json
/users/001           → /api/users/001/index.json
/users/001/edit      → /api/users/001/edit.json  ← 不一致！
```

**问题：**
- 资源路径使用 `/index.json` 后缀
- 操作路径直接使用 `.json` 后缀
- 规则特殊化，不是统一的分形结构

### 1.2 新路由规则

**统一分形规则（只有一条）：**

```
/xxx/yyy/zzz → /api/xxx/yyy/zzz.json
```

**示例：**
```
/                    → /api/index.json
/users               → /api/users.json
/users/001           → /api/users/001.json
/users/001/edit      → /api/users/001/edit.json
/editor/papers       → /api/editor/papers.json
/editor/papers/001   → /api/editor/papers/001.json
```

---

## 二、核心变更

### 2.1 DataSourceMapper

**旧代码：**
```typescript
private applyDefaultRule(cleanPath: string): string {
  // /xxx → /api/xxx/index.json
  // /xxx/yyy → /api/xxx/yyy/index.json
  return `${apiBase}/${path}/index${extension}`
}
```

**新代码：**
```typescript
private applyDefaultRule(cleanPath: string): string {
  // /xxx/yyy/zzz → /api/xxx/yyy/zzz.json
  return `${apiBase}/${path}${extension}`
}
```

### 2.2 Router 配置

**旧代码：**
```typescript
routes: [
  { path: '/', name: 'home', component: () => import('@/views/Entry.vue') },
  { path: '/:entity', name: 'entity', component: () => import('@/views/Entry.vue') },
  { path: '/:entity/:sub', name: 'entity-sub', component: () => import('@/views/Entry.vue') },
  { path: '/:entity/:sub/:id', name: 'entity-detail', component: () => import('@/views/Entry.vue') }
]
```

**新代码：**
```typescript
routes: [
  { path: '/', name: 'home', component: () => import('@/views/Entry.vue') },
  { path: '/:pathMatch(.*)*', name: 'catch-all', component: () => import('@/views/Entry.vue') }
]
```

### 2.3 Entry.vue 加载逻辑

**旧代码：**
```typescript
// 判断是否是操作路径
if (isActionPath()) {
  const entity = route.path.replace(/^\//, '')
  const result = await fetchActionData(entity)
  // ...
} else {
  const entity = route.path.replace(/^\//, '') || 'index'
  const result = await fetchPageData(entity)
  // ...
}
```

**新代码：**
```typescript
// 统一路由规则：直接使用 route.path
const apiPath = route.path === '/' ? 'index' : route.path.replace(/^\//, '')
const result = await fetchPageData(apiPath)
```

### 2.4 API 服务

**旧代码：**
```typescript
export async function fetchPageData(entity: string, id?: string): Promise<PageDescriptor> {
  const url = id ? `/api/${entity}/${id}/index.json` : `/api/${entity}/index.json`
  return get<PageDescriptor>(url)
}

export async function fetchActionData(path: string): Promise<PageDescriptor> {
  const url = `/api/${path}.json`
  return get<PageDescriptor>(url)
}
```

**新代码：**
```typescript
export async function fetchPageData(path: string): Promise<PageDescriptor> {
  const url = `/api/${path}.json`
  return get<PageDescriptor>(url)
}
```

---

## 三、文件结构调整

### 3.1 移动文件

| 旧路径 | 新路径 |
|-------|-------|
| `users/index.json` | `users.json` |
| `users/user-001/index.json` | `users/user-001.json` |
| `users/user-001/edit.json` | `users/user-001/edit.json` |
| `orders/order-001/index.json` | `orders/order-001.json` |
| `orders/order-001/approve.json` | `orders/order-001/approve.json` |
| `editor/papers.json` | `editor/papers.json` |
| `editor/papers/paper-001.json` | `editor/papers/paper-001.json` |

### 3.2 最终文件结构

```
public/api/
├── index.json
├── about.json
├── auth.json
├── auth/
│   ├── login.json
│   ├── register.json
│   └── me.json
├── users.json
├── users/
│   ├── create.json
│   └── user-001.json
├── editor.json
├── editor/
│   ├── papers.json
│   ├── papers/
│   │   ├── new.json
│   │   └── paper-001.json
│   ├── reviewers.json
│   └── reviews.json
├── orders/
│   ├── order-001.json
│   └── order-001/
│       ├── approve.json
│       └── reject.json
└── ...
```

---

## 四、路由映射表

### 4.1 完整映射

| 前端 URL | 后端数据源 | 说明 |
|---------|-----------|------|
| `/` | `/api/index.json` | 首页 |
| `/about` | `/api/about.json` | 关于页面 |
| `/auth` | `/api/auth.json` | 认证中心 |
| `/auth/login` | `/api/auth/login.json` | 登录表单 |
| `/auth/register` | `/api/auth/register.json` | 注册表单 |
| `/auth/me` | `/api/auth/me.json` | 个人信息 |
| `/users` | `/api/users.json` | 用户列表 |
| `/users/create` | `/api/users/create.json` | 创建用户表单 |
| `/users/user-001` | `/api/users/user-001.json` | 用户详情 |
| `/users/user-001/edit` | `/api/users/user-001/edit.json` | 编辑用户表单 |
| `/editor` | `/api/editor.json` | 编辑后台 |
| `/editor/papers` | `/api/editor/papers.json` | 论文列表 |
| `/editor/papers/new` | `/api/editor/papers/new.json` | 提交论文表单 |
| `/editor/papers/paper-001` | `/api/editor/papers/paper-001.json` | 论文详情 |
| `/orders/order-001` | `/api/orders/order-001.json` | 订单详情 |
| `/orders/order-001/approve` | `/api/orders/order-001/approve.json` | 批准订单表单 |
| `/orders/order-001/reject` | `/api/orders/order-001/reject.json` | 拒绝订单表单 |

### 4.2 分形特性

新路由规则具有完美的分形特性：

```
级别 1: /users          → /api/users.json
级别 2: /users/001      → /api/users/001.json
级别 3: /users/001/edit → /api/users/001/edit.json
级别 4: /users/001/edit/confirm → /api/users/001/edit/confirm.json
```

每一级都遵循相同的规则，无特殊化。

---

## 五、优势总结

| 方面 | 旧规则 | 新规则 |
|-----|-------|-------|
| **一致性** | 资源和操作规则不同 | 统一规则 |
| **分形结构** | 非分形 | 完美分形 |
| **可预测性** | 需要记忆特殊规则 | 规则简单直观 |
| **Server 路由** | 需要特殊处理 | 统一处理 |
| **代码复杂度** | 需要判断路径类型 | 统一处理 |

---

## 六、向后兼容性

**破坏性变更：** 是

需要更新：
1. 数据文件路径（移动文件）
2. Server 端路由配置

**迁移步骤：**
1. 按照上表移动数据文件
3. 更新 Server 端路由规则

---

## 七、验证结果

- ✅ 构建成功
- ✅ 类型检查通过
- ✅ 测试通过（29+ 用例）
- ✅ 文件结构统一

---

**许可:** MIT License
