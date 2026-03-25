# 认证授权重构总结

**版本:** v0.8.0
**日期:** 2026-03-25

---

## 核心原则

> **Server 负责：认证判断、权限控制、返回相应数据**
> 
> **App 负责：接收什么数据就渲染什么**

---

## 问题分析

### 原有方案的问题

在 v0.7.0 中，App 端包含了完整的认证授权逻辑：

```typescript
// ❌ 旧方案：App 端硬编码认证逻辑
import { isAuthenticated, authGuard } from '@/services/auth'

// 路由守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { path: '/auth/login' }
  }
})

// 权限指令
<button v-permission="'admin'">仅管理员</button>

// 认证状态
const authStore = useAuthStore()
if (authStore.isAuthenticated) { ... }
```

**问题：**
1. 违背通用原则 - 不同项目有不同的认证方案
2. 业务耦合 - App 端知道"认证"、"权限"概念
3. 灵活性差 - 无法适配不同的后端认证机制

---

## 新方案：Server 驱动

### 工作流程

```
用户访问 /editor
    ↓
App → GET /api/editor.json (自动携带 Token)
    ↓
Server 判断：
├── 已登录 + 有权限 → 返回正常数据
├── 未登录 → 返回登录表单 Schema
└── 已登录 + 无权限 → 返回 403 提示 Schema
    ↓
App 自动渲染对应内容
```

### Server 返回示例

**未登录时：**

```json
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "title": "请先登录",
    "tools": [{
      "name": "login",
      "protocol": "http",
      "method": "POST",
      "url": "/api/auth/login",
      "onSuccess": [{ "type": "reload" }]
    }]
  }
}
```

**无权限时：**

```json
{
  "code": 403,
  "message": "您没有权限访问此页面",
  "suggestedAction": { "title": "返回首页", "url": "/" },
  "_schema": { "type": "object", "title": "无权限访问" }
}
```

**登录成功返回 Token：**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "message": "登录成功",
  "_schema": {
    "tools": [{
      "name": "continue",
      "protocol": "navigate",
      "target": "/"
    }]
  }
}
```

---

## 代码改动

### 简化的文件

#### 1. `services/auth.ts`

**之前：** 150+ 行，包含认证状态、权限判断、路由守卫

**现在：** 50 行，仅 Token 管理

```typescript
// 仅保留最基础的 Token 管理
export function saveToken(accessToken: string, refreshToken?: string) { ... }
export function getToken(): string | null { ... }
export function clearToken() { ... }
export function getAuthHeaders(): Record<string, string> { ... }
```

#### 2. `services/api.ts`

**新增：** 自动携带 Token

```typescript
function buildRequestOptions(method?: string): RequestInit {
  const options: RequestInit = {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' }
  }

  // 自动携带 Token
  const token = getToken()
  if (token) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  return options
}
```

#### 3. `composables/useToolExecutor.ts`

**新增：** Tool 执行时自动携带/保存 Token

```typescript
import { getToken, saveToken } from '@/services/auth'

// 自动携带 Token
function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  if (token) {
    return { 'Authorization': `Bearer ${token}` }
  }
  return {}
}

// 保存响应中的 Token
function saveTokenFromResponse(data: any) {
  if (data?.access_token) {
    saveToken(data.access_token, data.refresh_token)
  }
}
```

#### 4. `views/Entry.vue`

**简化：** 移除认证状态判断

```typescript
/**
 * 加载数据
 *
 * Server 驱动认证方案：
 * - 未登录：Server 返回登录表单 Schema，App 自动渲染
 * - 无权限：Server 返回 403 提示 Schema，App 自动渲染
 * - 正常：Server 返回业务数据，App 自动渲染
 * App 端不判断认证状态，只负责渲染 Server 返回的数据
 */
async function loadData() {
  const result = await fetchPageData(entity)
  data.value = result
  schema.value = extractSchema(result)
}
```

### 删除的文件

| 文件 | 原因 |
|------|------|
| `stores/auth.ts` | 移除 App 端认证状态 |
| `directives/permission.ts` | 移除权限指令 |
| `components/AuthLayout.vue` | 移除认证布局组件 |

### 修改的文件

| 文件 | 改动 |
|------|------|
| `src/main.ts` | 移除 `initAuth()` 和 `v-permission` 指令 |
| `docs/CORE.md` | 更新认证授权章节 |
| `docs/CHANGELOG.md` | 记录 v0.8.0 改动 |
| `README.md` | 更新版本信息 |

---

## 优势对比

| 维度 | 旧方案 (v0.7.0) | 新方案 (v0.8.0) |
|------|----------------|----------------|
| **通用性** | ❌ 硬编码认证逻辑 | ✅ 完全通用 |
| **业务耦合** | ❌ App 端知道认证概念 | ✅ 无业务耦合 |
| **灵活性** | ❌ 固定认证流程 | ✅ 适配任意认证方案 |
| **代码量** | ❌ 200+ 行认证代码 | ✅ 50 行 Token 管理 |
| **控制权** | ❌ App 端判断权限 | ✅ Server 完全控制 |
| **维护成本** | ❌ 需要维护认证逻辑 | ✅ 只需维护 Token |

---

## 迁移指南

### 从 v0.7.0 升级到 v0.8.0

**如果你的项目使用了 v0.7.0 的认证功能：**

1. **删除认证状态相关代码：**

```typescript
// ❌ 删除
import { useAuthStore } from '@/stores/auth'
import { isAuthenticated } from '@/services/auth'
import { authGuard } from '@/services/auth'

const authStore = useAuthStore()
if (authStore.isAuthenticated) { ... }
```

2. **删除权限指令：**

```vue
<!-- ❌ 删除 -->
<button v-permission="'admin'">仅管理员</button>
```

3. **Server 端实现认证判断：**

```typescript
// ✅ 在 Server 端判断认证和权限
app.get('/api/editor', (req, res) => {
  if (!req.user) {
    // 未登录，返回登录表单
    return res.json({
      username: "",
      password: "",
      _schema: { /* 登录表单 Schema */ }
    })
  }

  if (!req.user.hasPermission('edit')) {
    // 无权限，返回 403 提示
    return res.status(403).json({
      code: 403,
      message: "无权限访问",
      _schema: { /* 403 提示 Schema */ }
    })
  }

  // 正常返回数据
  res.json({ /* 业务数据 */ })
})
```

---

## 测试验证

### 通过的测试

```bash
✓ src/services/__tests__/auth.test.ts (5 tests)
✓ src/composables/__tests__/useFormValidator.test.ts (7 tests)
✓ src/services/__tests__/dataSourceMapper.test.ts (8 tests)
```

### 构建结果

```bash
✓ built in 1.78s
dist/assets/index-*.js    106.06 kB │ gzip: 41.21 kB
dist/assets/index-*.css     3.84 kB │ gzip:  1.35 kB
```

---

## 总结

### 核心改进

1. **真正的通用 App 引擎** - App 端不再包含任何业务逻辑
2. **Server 完全控制** - 认证授权完全由 Server 决定
3. **代码更简洁** - 删除 200+ 行认证代码
4. **更易于维护** - 职责清晰，边界明确

### 核心思想

> **Server 返回什么，App 就渲染什么。**
>
> **App 端完全不知道"认证"、"授权"、"权限"这些概念。**

这才是真正的**数据驱动通用 App**！

---

**重构完成日期:** 2026-03-25
**版本:** v0.8.0
