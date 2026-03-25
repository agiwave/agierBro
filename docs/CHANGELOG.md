# AgierBro 更新日志

## v0.7.0 (2026-03-25)

### 企业级功能

#### 认证授权
- `services/auth.ts` - 通用 JWT 认证服务
- `directives/permission.ts` - 权限指令
- `components/AuthLayout.vue` - 认证布局组件
- `stores/auth.ts` - 认证状态管理

#### 状态管理
- `stores/app.ts` - 应用状态（loading/theme/toast）
- `stores/auth.ts` - 认证状态
- 集成 Pinia

#### 错误处理
- `services/errorHandler.ts` - 全局错误处理
- `composables/useNetworkStatus.ts` - 网络状态检测
- 支持指数退避重试

#### 国际化
- `i18n/index.ts` - 简易 i18n 支持
- 支持语言：zh-CN, en-US
- 翻译指令 `v-t`

### 保持通用性
- 不依赖特定后端
- JWT Token 可配置
- 认证/授权解耦

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
