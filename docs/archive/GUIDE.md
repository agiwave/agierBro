# AgierBro 项目完善指南

**日期:** 2026-03-24

---

## 一、文档整合

### 整合后结构

```
docs/
├── README.md                    # 核心文档（协议 + 组件 + 开发指南）
├── IMPLEMENTATION_PLAN.md       # 实施计划（如何实现完整网站）
├── protocol/                    # 协议规范（详细版）
├── specs/                       # 技术规范
└── archive/                     # 归档文档（历史参考）
```

### 核心文档说明

| 文档 | 用途 | 内容 |
|-----|------|------|
| [README.md](./README.md) | 快速入门 | 5 分钟了解核心概念 |
| [docs/README.md](./docs/README.md) | 开发参考 | 协议规范 + 组件体系 + 最佳实践 |
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | 项目实战 | 如何实现论文评审系统 |

---

## 二、实现完整网站的能力清单

### 已有能力 ✅

| 能力 | 说明 | 状态 |
|-----|------|------|
| 统一入口 | Entry.vue 渲染所有页面 | ✅ |
| URL 映射 | 固定规则映射到 API | ✅ |
| 列表渲染 | 自动表格/卡片/按钮布局 | ✅ |
| 详情渲染 | 自动分组展示 | ✅ |
| 表单编辑 | 查看/编辑模式切换 | ✅ |
| Tool 执行 | HTTP/Navigate协议 | ✅ |
| Section 机制 | 复合页面支持 | ✅ |

### 待实现能力 🚧

| 能力 | 优先级 | 实现方案 | 预计工时 |
|-----|--------|---------|---------|
| **用户认证** | P0 | Token 管理 + 路由守卫 | 2 天 |
| **状态管理** | P0 | Pinia Store | 1 天 |
| **文件上传** | P0 | 特殊 Tool + 进度显示 | 2 天 |
| **富文本编辑** | P1 | FormField 扩展 | 1 天 |
| **通知系统** | P1 | 全局 Tool 机制 | 2 天 |
| **权限控制** | P0 | Server 返回不同 tools | 2 天 |
| **搜索功能** | P2 | 专用搜索组件 | 2 天 |
| **数据验证** | P2 | Schema 扩展验证规则 | 2 天 |

---

## 三、实现论文评审系统的步骤

### Phase 1: 基础能力（1 周）

#### 1.1 用户认证

**Server API:**
```json
// POST /api/auth/login.json
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "title": "登录",
    "properties": {
      "username": { "type": "string", "title": "用户名", "required": true },
      "password": { "type": "string", "title": "密码", "format": "password", "required": true }
    },
    "tools": [...]
  }
}
```

**Client 扩展:**
- 在 `useToolExecutor` 中自动添加 Token
- 401 自动跳转登录
- 路由守卫检查认证

#### 1.2 状态管理

```typescript
// stores/app.ts
export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),
  actions: {
    async fetchUser() { ... }
  }
})
```

#### 1.3 文件上传

```vue
<!-- FormField.vue 扩展 -->
<template>
  <input v-if="field.format === 'file'" type="file" @change="upload" />
</template>
```

---

### Phase 2: 核心页面（2 周）

#### 2.1 编辑后台

**页面结构:**
```
/editor
├── /papers          # 论文列表
│   └── /:id         # 论文详情
├── /reviews         # 评审管理
└── /reviewers       # 专家管理
```

**API 示例:**
```json
// GET /api/editor/papers.json
{
  "items": [
    { "id": "1", "title": "论文 A", "status": "pending_review" }
  ],
  "_schema": {
    "type": "object",
    "title": "论文管理",
    "tools": [
      {
        "type": "function",
        "function": { "name": "assign_reviewer", ... }
      }
    ]
  }
}
```

#### 2.2 专家后台

**页面结构:**
```
/reviewer
├── /tasks           # 评审任务
├── /my-reviews      # 我的评审
└── /profile         # 个人信息
```

---

### Phase 3: 完善优化（1 周）

- 通知系统
- 搜索功能
- 性能优化
- 文档完善

---

## 四、关键代码示例

### 4.1 Token 管理

```typescript
// composables/useToolExecutor.ts
async function execute(tool: Tool, args: any) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  
  // 自动添加 Token
  const store = useAppStore()
  if (store.isAuthenticated) {
    headers['Authorization'] = `Bearer ${store.user.token}`
  }
  
  const response = await fetch(url, { method, headers, body: JSON.stringify(args) })
  
  // 401 自动跳转
  if (response.status === 401) {
    store.setUser(null)
    window.location.href = '/login'
  }
}
```

### 4.2 路由守卫

```typescript
// router/index.ts
router.beforeEach(async (to, from, next) => {
  const store = useAppStore()
  await store.fetchUser()
  
  const requiresAuth = !to.path.startsWith('/auth') && to.path !== '/'
  if (requiresAuth && !store.isAuthenticated) {
    next('/auth/login')
  } else {
    next()
  }
})
```

### 4.3 权限控制

**Server 端根据角色返回不同的 tools:**

```json
// 编辑看到的
{
  "tools": [
    { "name": "assign_reviewer", ... },
    { "name": "reject_paper", ... }
  ]
}

// 专家看到的
{
  "tools": [
    { "name": "submit_review", ... }
  ]
}
```

---

## 五、开发检查清单

### 新功能开发流程

1. **设计 API**
   - [ ] 定义数据结构
   - [ ] 定义 Schema
   - [ ] 定义 Tools

2. **创建 API 文件**
   - [ ] `public/api/entity.json` (列表)
   - [ ] `public/api/entity/:id.json` (详情)

3. **测试页面**
   - [ ] 访问 URL 查看渲染效果
   - [ ] 测试 Tool 执行
   - [ ] 检查响应处理

4. **后端对接**
   - [ ] 替换静态 JSON 为动态 API
   - [ ] 测试真实数据

### 发布前检查

- [ ] 用户认证正常
- [ ] 权限控制正确
- [ ] 文件上传可用
- [ ] 所有页面可访问
- [ ] 错误处理完善

---

## 六、常见问题

### Q1: 如何实现分页？

**A:** 在 Schema 中定义 `navigators` 数组：

```json
{
  "items": [...],
  "navigators": [
    { "pageno": 1, "label": "上一页", "disabled": true },
    { "pageno": 2, "label": "2" },
    { "pageno": 2, "label": "下一页" }
  ],
  "_schema": {
    "properties": {
      "navigators": {
        "type": "array",
        "items": {
          "type": "object",
          "_address": "/orders?page={pageno}.json"
        }
      }
    }
  }
}
```

### Q2: 如何实现级联选择？

**A:** 使用 `enum` 动态加载：

```json
{
  "province": {
    "type": "string",
    "title": "省份",
    "enum_url": "/api/provinces.json"  // 动态加载
  },
  "city": {
    "type": "string",
    "title": "城市",
    "enum_url": "/api/cities?province={province}"
  }
}
```

### Q3: 如何处理复杂表单验证？

**A:** 扩展 Schema 验证规则：

```json
{
  "email": {
    "type": "string",
    "title": "邮箱",
    "required": true,
    "format": "email",
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "minLength": 5,
    "maxLength": 100
  }
}
```

---

## 七、下一步行动

### 立即开始

1. **阅读文档**
   - [ ] [核心文档](./docs/README.md)
   - [ ] [实施计划](./docs/IMPLEMENTATION_PLAN.md)

2. **运行项目**
   ```bash
   cd agierBro-vue
   npm run dev
   ```

3. **修改示例**
   - [ ] 修改 `public/api/orders.json`
   - [ ] 查看页面变化

### 本周目标

- [ ] 实现用户认证
- [ ] 实现状态管理
- [ ] 创建第一个业务页面

### 本月目标

- [ ] 完成论文评审系统核心功能
- [ ] 完善文档和示例
- [ ] 准备上线

---

## 八、资源链接

| 资源 | 链接 |
|-----|------|
| GitHub 仓库 | https://github.com/your-org/agierBro |
| Vue 文档 | https://vuejs.org |
| Pinia 文档 | https://pinia.vuejs.org |
| TypeScript 文档 | https://www.typescriptlang.org |

---

**许可:** MIT
