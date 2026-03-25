# AgierBro 核心文档

**版本:** v0.7.0
**日期:** 2026-03-25

---

## 一、快速开始

```bash
cd agierBro-vue
npm install
npm run dev
```

访问 http://localhost:3000

---

## 二、核心思想

**Server 职责:** 提供数据 + Schema + Tools
**App 职责:** 理解 Schema + 识别语义 + 自主呈现

```
Server → { data, _schema, _tools } → App → UI
```

---

## 三、URL 映射规则（极简）

```
1. /              → /api/index.json
2. /xxx           → /api/xxx.json（无论多少级）
```

| 前端 URL | 后端数据源 |
|---------|-----------|
| `/` | `/api/index.json` |
| `/about` | `/api/about.json` |
| `/auth/login` | `/api/auth/login.json` |
| `/editor/papers/paper-001` | `/api/editor/papers/paper-001.json` |

---

## 四、Schema 格式

```json
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "title": "登录",
    "tools": [{
      "name": "login",
      "description": "登录系统",
      "protocol": "http",
      "method": "POST",
      "url": "/api/auth/login",
      "onSuccess": [
        { "type": "message", "message": "登录成功", "level": "success" },
        { "type": "navigate", "target": "/" }
      ]
    }]
  }
}
```

---

## 五、语义类型

所有语义类型平级，无特殊前缀：

| 类型 | 说明 | 类型 | 说明 |
|-----|------|-----|------|
| `nav` | 导航栏 | `hero` | Hero 区域 |
| `tree` | 树形菜单 | `stats` | 统计数据 |
| `tabs` | 标签页 | `features` | 功能列表 |
| `content` | 内容区块 | `cta` | 行动号召 |
| `list` | 列表区块 | `footer` | 页脚 |

**字段语义:** `email`, `phone`, `url`, `image`, `file`, `status`, `amount`, `date` 等

---

## 六、渲染决策

```
数据加载
    ↓
判断数据结构
    ├── 有 items 且每项有 _schema → SectionList (复合页面)
    ├── 有 items 但无 _schema → ListRenderer (列表)
    ├── 有 tools 且无 items → SchemaRenderer (表单模式)
    └── 其他 → SchemaRenderer (查看模式)
    ↓
根据 semantic 类型选择 Section 组件
```

---

## 七、列表自动布局

| 可见字段数 | 布局 |
|-----------|------|
| 1 | 按钮 |
| 2-4 | 卡片 |
| > 4 | 表格 |

---

## 八、移动端适配

### 响应式断点

```
375px   576px   768px   1024px   1440px
│       │       │       │        │
XS      SM      MD      LG       XL
手机    手机    平板    桌面     大屏
```

### 触摸手势

```vue
<!-- 点击 -->
<div v-touch="{ onTap: handleTap }">

<!-- 滑动 -->
<div v-touch="{ onSwipeLeft: next }">

<!-- 长按 -->
<button v-longpress="showMenu">
```

### 下拉刷新

```typescript
const { isRefreshing, handlers } = usePullToRefresh(loadData)
```

### 底部导航

```vue
<BottomNav :items="[
  { icon: '🏠', label: '首页', url: '/' }
]" />
```

---

## 九、认证授权（Server 驱动）

### 核心原则

> **Server 负责：认证判断、权限控制、返回相应数据**
> 
> **App 负责：接收什么数据就渲染什么**

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

**未登录时访问受保护页面：**

```json
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "title": "请先登录",
    "tools": [{
      "name": "login",
      "description": "登录系统",
      "protocol": "http",
      "method": "POST",
      "url": "/api/auth/login",
      "onSuccess": [
        { "type": "reload" }
      ]
    }]
  }
}
```

**无权限时：**

```json
{
  "code": 403,
  "message": "您没有权限访问此页面",
  "suggestedAction": {
    "title": "返回首页",
    "url": "/"
  },
  "_schema": {
    "type": "object",
    "title": "无权限访问"
  }
}
```

**登录成功返回 Token：**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "message": "登录成功",
  "_schema": {
    "type": "object",
    "tools": [{
      "name": "continue",
      "description": "继续",
      "protocol": "navigate",
      "target": "/"
    }]
  }
}
```

### App 端 Token 管理

App 端自动携带和保存 Token，无需判断认证状态：

```typescript
// 自动携带 Token（所有请求）
Authorization: Bearer {token}

// 登录成功后自动保存 Token
{
  "access_token": "...",
  "refresh_token": "..."
}
```

### 优势

| 传统方案 | Server 驱动方案 |
|---------|----------------|
| App 端判断认证状态 | Server 完全控制 |
| App 端路由守卫 | Server 返回什么渲染什么 |
| 硬编码权限逻辑 | 完全通用，无业务耦合 |

---

## 十、状态管理

### 10.1 应用状态

```typescript
// 使用 Pinia
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
appStore.showToast('操作成功', 'success')
```

### 10.2 错误处理

```typescript
import { handleError } from '@/services/errorHandler'
handleError(new Error('操作失败'))
```

### 10.3 国际化

```vue
<template>
  <h1>{{ $t('auth.login') }}</h1>
  <button v-t="'common.submit'">提交</button>
</template>

<script setup>
import { t, setLocale } from '@/i18n'
setLocale('en-US') // 切换语言
</script>
```

---

## 十一、项目结构

```
agierBro/
├── agierBro-vue/
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── sections/   # 语义 Section
│   │   │   ├── SchemaRenderer.vue
│   │   │   ├── ObjectForm.vue
│   │   │   ├── BottomNav.vue
│   │   │   └── ...
│   │   ├── composables/    # 组合式函数
│   │   │   ├── useFormValidator.ts
│   │   │   ├── useTheme.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── auth.ts           # Token 管理（Server 驱动）
│   │   │   ├── errorHandler.ts   # 错误处理
│   │   │   └── dataSourceMapper.ts
│   │   ├── stores/       # Pinia 状态
│   │   │   └── app.ts
│   │   ├── i18n/         # 国际化
│   │   │   └── index.ts
│   │   └── views/Entry.vue
│   └── public/api/
├── docs/
│   ├── CORE.md            # 本文档
│   ├── CHANGELOG.md       # 更新日志
│   ├── DATA_SOURCE_MAPPER.md
│   └── specs/             # 规范文档
└── README.md
```

---

## 十一、学习路径

### 1. 快速入门
1. 运行项目
2. 修改 `public/api/` 下的 JSON 文件
3. 查看效果

### 2. 理解协议
1. 阅读 [Schema 规范](./specs/SCHEMA_SPEC.md)
2. 阅读 [Tool 规范](./specs/TOOL_SPEC.md)

### 3. 开发应用
1. 定义后端 API 返回的数据和 Schema
2. 使用内置组件自动渲染

---

## 十二、版本信息

**当前版本:** 0.8.0

**最新版本特性:**
- ✅ Server 驱动认证授权（App 端无业务逻辑）
- ✅ 极简 URL 映射（仅 2 条规则）
- ✅ 移动端完整适配
- ✅ 触摸手势、下拉刷新
- ✅ 状态管理（Pinia）
- ✅ 错误处理增强
- ✅ 国际化支持（zh-CN/en-US）

详见：[CHANGELOG.md](./CHANGELOG.md)

---

## 十三、相关文档

| 文档 | 说明 |
|-----|------|
| [Schema 规范](./specs/SCHEMA_SPEC.md) | Schema 格式定义 |
| [Tool 规范](./specs/TOOL_SPEC.md) | Tool 协议定义 |
| [数据源映射](./DATA_SOURCE_MAPPER.md) | URL 映射规则 |
| [更新日志](./CHANGELOG.md) | 版本历史 |

---

**许可:** MIT License
