# AgierBro 更新日志

## v0.6.1 (2026-03-25)

### 核心改进

#### 极简数据源映射规则
- **规则**: `/` → `/api/index.json`，`/xxx` → `/api/xxx.json`
- 移除复杂的模式匹配和优先级系统
- 文件：`src/services/dataSourceMapper.ts`

#### 工具调用表单支持
- 自动检测有 tools 的表单页面（登录/注册等）
- SchemaRenderer 新增表单模式
- 集成表单验证和 Tool 执行

### 新增组件

| 组件 | 说明 |
|-----|------|
| `FileUploader.vue` | 文件上传（拖拽、多文件、进度） |
| `ListEnhanced.vue` | 增强列表（搜索、筛选、分页） |
| `ThemeSwitcher.vue` | 主题切换（亮色/暗色） |
| `ContentSection.vue` | 内容区块渲染 |
| `ListSection.vue` | 列表区块渲染 |

### 新增 Composables

| Composable | 说明 |
|-----------|------|
| `useFormValidator` | 表单验证（必填/长度/格式等） |
| `useTheme` | 主题管理（持久化、系统跟随） |
| `useToolExecutor` | Tool 执行（HTTP/Navigate 协议） |

### 新增页面

| 页面 | 路由 | 类型 |
|-----|------|------|
| 关于 | `/about` | 复合页面 |
| 认证中心 | `/auth` | 复合页面 |
| 登录 | `/auth/login` | 工具调用表单 |
| 注册 | `/auth/register` | 工具调用表单 |

### 清理

- 删除冗余组件（7 个）
- 删除冗余 composables（3 个）
- 删除冗余文档（5 个）
- 简化 API 文件结构

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
