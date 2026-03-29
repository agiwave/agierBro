# AgierBro 更新日志

## v6.1.0 (2026-03-29)

### 统一分形路由规则

**核心变更：**
- 路由规则统一为：`/xxx/yyy/zzz → /api/xxx/yyy/zzz.json`
- 删除了不一致的 `/index.json` 后缀规则

**改动：**
- `services/dataSourceMapper.ts` - 简化为统一映射规则
- `router/index.ts` - 简化为通用路由 `/:pathMatch(.*)*`
- `services/api.ts` - 统一 `fetchPageData(path)` 函数
- `views/Entry.vue` - 简化加载逻辑，移除 `isActionPath()` 判断

**文件结构调整：**
- `users/index.json` → `users.json`
- `users/user-001/index.json` → `users/user-001.json`
- `orders/order-001/index.json` → `orders/order-001.json`

**优势：**
- 规则统一，易于理解和记忆
- 完美的分形结构，支持任意层级
- Server 端路由配置更简单

**文档：**
- `docs/ROUTING_REFACTOR.md` - 路由重构详细说明

---

## v6.0.0 (2026-03-29)

### 纯工具描述架构 (in/out)

**核心理念：** 所有接口返回的都是工具的 Schema 描述

**架构变更：**
- `_schema.in` - 输入参数描述（调用工具需要什么）
- `_schema.out` - 输出描述（工具返回什么）
- `in` 为空 → 数据展示（view 模式）
- `in` 有定义 → 表单输入（edit 模式）

**类型定义更新：**
- 新增 `ToolDescriptor` 接口
- 新增 `PageDescriptor` 接口
- 保留 `Tool` 类型（向后兼容）

**API 服务更新：**
- `extractInSchema()` - 提取输入 Schema
- `extractOutSchema()` - 提取输出 Schema
- `needsInput()` - 判断是否需要输入
- `isDataTool()` - 判断是否是数据工具

**前端判断逻辑：**
```typescript
if (needsInput(result)) {
  mode.value = 'edit'   // 需要输入，呈现表单
} else {
  mode.value = 'view'   // 无需输入，展示数据
}
```

**示例数据更新：**
- 所有 40 个示例文件转换为 v6.0 格式
- 31 个数据展示文件（in 为空）
- 9 个表单输入文件（in 有定义）

**文档：**
- `docs/ARCHITECTURE_V6.md` - v6.0 架构详解
- `docs/VALIDATION_REPORT.md` - 示例数据验证报告

---

## v0.9.0 (2026-03-25)

### 企业级功能完善

#### 错误处理
- `components/ErrorBoundary.vue` - 错误边界组件
- `services/errorHandler.ts` - 增强错误处理
- 全局错误事件监听

#### 状态管理增强
- `stores/app.ts` - 增强应用状态（嵌套 loading、主题持久化）
- `components/GlobalToast.vue` - 全局 Toast 组件
- 快捷方法：showSuccess、showError、showWarning、showInfo
- withLoading - 自动管理 loading 状态

#### API 服务增强
- 请求缓存（5 分钟 TTL）
- 自动重试（指数退避，最多 3 次）
- 超时处理（30 秒默认）
- 统一的 get/post/put/del 方法

#### 性能优化
- `components/VirtualList.vue` - 虚拟滚动组件
- `directives/lazy.ts` - 图片懒加载指令

#### 示例数据
- 完整的用户管理 CRUD 示例
- `/api/users.json` - 用户列表
- `/api/users/user-001.json` - 用户详情
- `/api/users/create.json` - 创建用户表单

#### 测试覆盖
- `useFormValidator.test.ts` - 表单验证测试（9 个用例）
- `api.test.ts` - API 服务测试
- `auth.test.ts` - Token 管理测试
- `dataSourceMapper.test.ts` - URL 映射测试

#### 文档
- `docs/GUIDE.md` - 完整使用指南
- `docs/AUTH_REFACTOR.md` - 认证重构文档

---

## v0.8.0 (2026-03-25)

### Server 驱动认证授权

**核心原则：**
- Server 负责：认证判断、权限控制、返回相应数据
- App 负责：接收什么数据就渲染什么

**改动：**
- `services/auth.ts` - 简化为纯 Token 管理（存储/读取/自动携带）
- 删除 `stores/auth.ts` - 移除 App 端认证状态
- 删除 `directives/permission.ts` - 移除权限指令
- 删除 `components/AuthLayout.vue` - 移除认证布局组件
- `api.ts` - 所有请求自动携带 Token
- `useToolExecutor.ts` - Tool 执行自动携带/保存 Token

**优势：**
- App 端完全通用，无业务耦合
- 认证授权完全由 Server 控制
- 不同项目可使用不同的认证方案

---

## v0.7.0 (2026-03-25)

### 状态管理
- `stores/app.ts` - 应用状态（loading/theme/toast）
- 集成 Pinia

### 错误处理
- `services/errorHandler.ts` - 全局错误处理
- `composables/useNetworkStatus.ts` - 网络状态检测
- 支持指数退避重试

### 国际化
- `i18n/index.ts` - 简易 i18n 支持
- 支持语言：zh-CN, en-US
- 翻译指令 `v-t`

### 保持通用性
- 不依赖特定后端
- JWT Token 可配置

---

## v0.6.2 (2026-03-25)

### 移动端适配
- 全局响应式样式系统
- 触摸手势指令
- 底部导航组件
- 下拉刷新功能
- 汉堡菜单组件

---

## v0.6.1 (2026-03-25)

### 核心改进
- 极简数据源映射规则（仅 2 条）
- 工具调用表单支持
- 版本更新为 0.6.1

### 清理
- 删除冗余组件（7 个）
- 删除冗余 composables（3 个）
- 删除冗余文档（5 个）

---

## v0.6.0 (2026-03-25)

### 功能增强
- 表单验证机制
- 文件上传支持
- 列表增强功能
- 主题切换功能
- 通用数据源映射器

---

## v0.5.0 (2026-03-24)

### 核心功能
- 完整模拟网站
- 语义类型系统
- Tool 机制
- 自动布局
