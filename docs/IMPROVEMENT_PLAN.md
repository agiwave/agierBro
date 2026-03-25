# AgierBro 下一步改进计划

**版本:** v0.6.1 → v0.7.0
**制定日期:** 2026-03-25
**执行周期:** 4-6 周

---

## 一、总体目标

### 1.1 愿景

从 **Demo 原型** 升级为 **可用的产品**

### 1.2 核心目标

| 目标 | 当前状态 | 目标状态 |
|-----|---------|---------|
| 后端集成 | 静态 JSON | 真实 API 调用 |
| 认证授权 | 无 | JWT + 路由守卫 |
| 错误处理 | 基础 | 统一处理机制 |
| 测试覆盖 | 0% | 核心功能 60%+ |

### 1.3 版本规划

```
v0.6.1 (当前) → v0.7.0 (4 周) → v0.8.0 (8 周) → v1.0.0 (12 周)
```

---

## 二、第一阶段：v0.7.0 (第 1-2 周)

### 2.1 真实后端集成

#### 任务 1.1: HTTP 协议完整实现

**工作内容:**
```typescript
// src/composables/useToolExecutor.ts
interface HttpConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: Record<string, any>
  timeout?: number
}

// 实现功能:
- ✅ 支持请求头配置
- ✅ 支持超时控制
- ✅ 支持请求/响应拦截器
- ✅ 支持文件上传 (FormData)
```

**验收标准:**
- [ ] 能调用真实 API 接口
- [ ] 支持自定义请求头
- [ ] 超时自动取消请求
- [ ] 文件上传进度显示

**预计工时:** 2 天

---

#### 任务 1.2: 响应处理增强

**工作内容:**
```typescript
// 统一响应格式
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  actions?: Action[]
}

// 响应拦截器
function handleResponse(response: Response): Promise<ApiResponse> {
  // 1. 检查 HTTP 状态
  // 2. 解析响应体
  // 3. 执行 actions
  // 4. 统一错误处理
}
```

**验收标准:**
- [ ] 统一响应格式
- [ ] 自动执行 onSuccess/onError actions
- [ ] 错误信息友好提示

**预计工时:** 1 天

---

#### 任务 1.3: 模拟 API 服务器

**工作内容:**
```bash
# 添加轻量级模拟服务器
npm install -D json-server

# scripts/mock-server.js
import jsonServer from 'json-server'
const server = jsonServer.create()
const router = jsonServer.router('public/api/db.json')
server.use('/api', router)
server.listen(3001)
```

**验收标准:**
- [ ] 支持 CRUD 操作
- [ ] 支持延迟模拟
- [ ] 支持错误模拟

**预计工时:** 1 天

---

### 2.2 错误处理增强

#### 任务 2.1: 全局错误处理

**工作内容:**
```typescript
// src/services/errorHandler.ts
export const errorHandler = {
  // HTTP 错误
  handleHttpError(error: Error): void,
  
  // 业务错误
  handleBusinessError(code: string, message: string): void,
  
  // 网络错误
  handleNetworkError(error: Error): void,
  
  // 未知错误
  handleUnknownError(error: Error): void
}

// 使用示例
try {
  await executeTool(tool, args)
} catch (error) {
  errorHandler.handleHttpError(error)
}
```

**验收标准:**
- [ ] 统一错误处理入口
- [ ] 错误分类处理
- [ ] 错误日志记录

**预计工时:** 1 天

---

#### 任务 2.2: 错误提示组件

**工作内容:**
```vue
<!-- components/ErrorDisplay.vue -->
<template>
  <div class="error-display" v-if="error">
    <div class="error-icon">❌</div>
    <h3>{{ error.title }}</h3>
    <p>{{ error.message }}</p>
    <button @click="handleRetry">重试</button>
    <button @click="handleBack">返回</button>
  </div>
</template>
```

**验收标准:**
- [ ] 友好的错误界面
- [ ] 支持重试操作
- [ ] 支持返回操作

**预计工时:** 1 天

---

#### 任务 2.3: 网络状态检测

**工作内容:**
```typescript
// src/composables/useNetworkStatus.ts
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const isRetrying = ref(false)
  
  // 监听网络状态变化
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // 自动重试机制
  async function retryWithBackoff(fn: () => Promise<any>) {
    // 指数退避重试
  }
  
  return { isOnline, isRetrying, retryWithBackoff }
}
```

**验收标准:**
- [ ] 网络状态实时显示
- [ ] 离线提示
- [ ] 自动重试机制

**预计工时:** 1 天

---

### 2.3 第一阶段交付物

| 交付物 | 状态 |
|-------|------|
| HTTP 协议完整实现 | 📋 待办 |
| 统一响应处理 | 📋 待办 |
| 模拟 API 服务器 | 📋 待办 |
| 全局错误处理 | 📋 待办 |
| 错误提示组件 | 📋 待办 |
| 网络状态检测 | 📋 待办 |

**预计总工时:** 7 天
**完成时间:** 第 2 周周末

---

## 三、第二阶段：v0.7.5 (第 3-4 周)

### 3.1 认证授权

#### 任务 3.1: JWT Token 管理

**工作内容:**
```typescript
// src/services/auth.ts
interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export const authService = {
  // 登录
  async login(username: string, password: string): Promise<AuthToken>,
  
  // 登出
  async logout(): Promise<void>,
  
  // 刷新 Token
  async refreshToken(): Promise<AuthToken>,
  
  // 获取当前 Token
  getToken(): string | null,
  
  // 检查是否过期
  isTokenExpired(): boolean
}
```

**验收标准:**
- [ ] 登录获取 Token
- [ ] Token 自动刷新
- [ ] Token 过期自动登出
- [ ] Token 安全存储

**预计工时:** 2 天

---

#### 任务 3.2: 路由守卫

**工作内容:**
```typescript
// src/router/index.ts
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth ?? false
  
  if (requiresAuth && !authService.isAuthenticated()) {
    next({ path: '/auth/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// 路由配置
{
  path: '/editor',
  component: Entry,
  meta: { requiresAuth: true }
}
```

**验收标准:**
- [ ] 未登录自动跳转
- [ ] 登录后返回原页面
- [ ] 支持公开路由配置

**预计工时:** 1 天

---

#### 任务 3.3: 权限控制

**工作内容:**
```typescript
// src/composables/usePermission.ts
export function usePermission() {
  const userRoles = ref<string[]>([])
  
  // 检查角色
  function hasRole(role: string): boolean {
    return userRoles.value.includes(role)
  }
  
  // 检查权限
  function hasPermission(permission: string): boolean {
    // 基于角色的权限检查
  }
  
  // 指令
  const vPermission = {
    mounted(el, binding) {
      if (!hasPermission(binding.value)) {
        el.remove()
      }
    }
  }
  
  return { hasRole, hasPermission, vPermission }
}
```

**验收标准:**
- [ ] 基于角色的权限
- [ ] 指令式权限控制
- [ ] Tool 执行权限验证

**预计工时:** 2 天

---

#### 任务 3.4: 登录/注册页面完善

**工作内容:**
```json
// public/api/auth/login.json
{
  "username": "",
  "password": "",
  "remember": false,
  "_schema": {
    "tools": [{
      "name": "login",
      "protocol": "http",
      "url": "/api/auth/login",
      "onSuccess": [
        { "type": "navigate", "target": "/" }
      ]
    }]
  }
}
```

**验收标准:**
- [ ] 真实登录功能
- [ ] 记住我功能
- [ ] 注册功能
- [ ] 密码找回

**预计工时:** 2 天

---

### 3.2 测试覆盖

#### 任务 4.1: 测试环境搭建

**工作内容:**
```bash
# 安装测试工具
npm install -D vitest @vue/test-utils @testing-library/vue

# 配置 vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  }
})
```

**验收标准:**
- [ ] Vitest 配置完成
- [ ] 测试脚本可用
- [ ] CI 集成测试

**预计工时:** 1 天

---

#### 任务 4.2: 核心功能测试

**工作内容:**
```typescript
// __tests__/dataSourceMapper.test.ts
import { describe, it, expect } from 'vitest'
import { mapToDataSource } from '@/services/dataSourceMapper'

describe('DataSourceMapper', () => {
  it('should map / to /api/index.json', () => {
    expect(mapToDataSource('/')).toBe('/api/index.json')
  })
  
  it('should map /users to /api/users.json', () => {
    expect(mapToDataSource('/users')).toBe('/api/users.json')
  })
})

// __tests__/SchemaRenderer.test.ts
import { mount } from '@vue/test-utils'
import SchemaRenderer from '@/components/SchemaRenderer.vue'

describe('SchemaRenderer', () => {
  it('should render form mode when has tools', () => {
    const wrapper = mount(SchemaRenderer, {
      props: {
        schema: { tools: [...] },
        data: {}
      }
    })
    expect(wrapper.find('.form-mode').exists()).toBe(true)
  })
})
```

**验收标准:**
- [ ] 数据源映射器测试
- [ ] SchemaRenderer 测试
- [ ] ObjectForm 测试
- [ ] useToolExecutor 测试
- [ ] 核心功能测试覆盖率 60%+

**预计工时:** 3 天

---

### 3.3 第二阶段交付物

| 交付物 | 状态 |
|-------|------|
| JWT Token 管理 | 📋 待办 |
| 路由守卫 | 📋 待办 |
| 权限控制 | 📋 待办 |
| 登录/注册完善 | 📋 待办 |
| 测试环境搭建 | 📋 待办 |
| 核心功能测试 | 📋 待办 |

**预计总工时:** 11 天
**完成时间:** 第 4 周周末

---

## 四、第三阶段：v0.8.0 (第 5-8 周)

### 4.1 状态管理 (Pinia)

```typescript
// src/stores/app.ts
export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light',
    user: null,
    loading: false,
    notifications: []
  }),
  actions: {
    setTheme(theme: string) {
      this.theme = theme
    },
    setUser(user: User) {
      this.user = user
    }
  }
})
```

**预计工时:** 2 天

---

### 4.2 国际化

```typescript
// src/i18n/index.ts
export const i18n = {
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      login: {
        title: '登录',
        username: '用户名'
      }
    },
    'en-US': {
      login: {
        title: 'Login',
        username: 'Username'
      }
    }
  }
}
```

**预计工时:** 3 天

---

### 4.3 性能优化

- 组件懒加载
- 虚拟滚动
- 请求缓存

**预计工时:** 3 天

---

### 4.4 文档完善

- API 参考文档
- 使用教程
- 示例项目

**预计工时:** 2 天

---

## 五、时间线总览

```
第 1 周 ──────────────────────
       HTTP 协议实现
       响应处理
       模拟服务器

第 2 周 ──────────────────────
       全局错误处理
       错误提示组件
       网络状态检测
       → v0.7.0 发布

第 3 周 ──────────────────────
       JWT Token 管理
       路由守卫

第 4 周 ──────────────────────
       权限控制
       登录/注册完善
       测试环境 + 核心测试
       → v0.7.5 发布

第 5-6 周 ────────────────────
       状态管理 (Pinia)
       国际化

第 7-8 周 ────────────────────
       性能优化
       文档完善
       → v0.8.0 发布
```

---

## 六、风险与应对

### 6.1 技术风险

| 风险 | 概率 | 应对措施 |
|-----|------|---------|
| HTTP 协议实现复杂 | 中 | 使用 axios 封装 |
| Token 刷新逻辑复杂 | 中 | 参考成熟方案 |
| 测试覆盖难度大 | 高 | 先核心后边缘 |

### 6.2 时间风险

| 风险 | 概率 | 应对措施 |
|-----|------|---------|
| 任务延期 | 中 | 每周检查进度 |
| 需求变更 | 低 | 保持范围稳定 |

---

## 七、验收标准

### 7.1 v0.7.0 验收

- [ ] 能调用真实 API
- [ ] 统一错误处理
- [ ] 网络状态检测
- [ ] 模拟服务器可用

### 7.2 v0.7.5 验收

- [ ] 登录功能正常
- [ ] 路由守卫生效
- [ ] 权限控制可用
- [ ] 核心测试覆盖 60%+

### 7.3 v0.8.0 验收

- [ ] 状态管理完善
- [ ] 支持中英文
- [ ] 性能指标达标
- [ ] 文档完整

---

## 八、资源需求

### 8.1 人力资源

| 角色 | 人数 | 工时 |
|-----|------|------|
| 前端开发 | 1-2 | 8 周 |
| 后端开发 | 1 | 2 周 (API 支持) |
| 测试 | 0.5 | 2 周 |

### 8.2 技术资源

| 资源 | 用途 |
|-----|------|
| 测试服务器 | API 测试 |
| CI/CD | 自动化测试 |
| 文档站点 | 文档托管 |

---

## 九、成功指标

### 9.1 技术指标

| 指标 | 目标值 |
|-----|-------|
| 测试覆盖率 | 60%+ |
| 构建时间 | < 30s |
| 首屏加载 | < 2s |
| API 调用成功率 | 99%+ |

### 9.2 业务指标

| 指标 | 目标值 |
|-----|-------|
| 开发效率提升 | 40%+ |
| 代码复用率 | 85%+ |
| Bug 率降低 | 50%+ |

---

## 十、下一步行动

### 立即行动 (本周)

1. [ ] 安装 json-server
2. [ ] 创建模拟数据库
3. [ ] 实现 HTTP 请求封装
4. [ ] 编写第一个测试用例

### 本周检查点

- [ ] 周五检查 HTTP 协议实现进度
- [ ] 周日完成模拟服务器

---

**计划制定人:** AI Assistant
**计划审核:** 待定
**计划开始:** 2026-03-26
**计划结束:** 2026-05-21
