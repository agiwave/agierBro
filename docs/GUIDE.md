# AgierBro 使用指南

**版本:** v0.9.0
**日期:** 2026-03-25

---

## 一、快速开始

### 1.1 安装依赖

```bash
cd agierBro-vue
npm install
```

### 1.2 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 1.3 构建生产版本

```bash
npm run build
```

---

## 二、核心概念

### 2.1 Server 驱动架构

```
Server → { data, _schema, _tools } → App → UI
```

| 角色 | 职责 |
|------|------|
| **Server** | 提供数据 + Schema + Tools |
| **App** | 理解 Schema + 识别语义 + 自主呈现 |

### 2.2 Schema 结构

```json
{
  "业务数据": "...",
  "_schema": {
    "type": "object",
    "title": "页面标题",
    "semantic": "nav",
    "properties": { ... },
    "tools": [ ... ]
  }
}
```

### 2.3 语义类型

所有语义类型平级，无特殊前缀：

| 类型 | 说明 | 示例场景 |
|------|------|---------|
| `nav` | 导航栏 | 页面顶部导航 |
| `hero` | Hero 区域 | 首页宣传区域 |
| `stats` | 统计数据 | 仪表盘统计卡片 |
| `features` | 功能列表 | 特性介绍 |
| `content` | 内容区块 | 文章/描述内容 |
| `cta` | 行动号召 | 注册/购买按钮 |
| `footer` | 页脚 | 版权信息 |
| `list` | 列表区块 | 数据列表 |

---

## 三、使用指南

### 3.1 创建页面

**步骤 1:** 在 `public/api/` 下创建 JSON 文件

```json
// public/api/hello.json
{
  "message": "Hello, AgierBro!",
  "_schema": {
    "type": "object",
    "title": "欢迎",
    "properties": {
      "message": { "type": "string", "title": "消息" }
    }
  }
}
```

**步骤 2:** 访问对应 URL

```
http://localhost:3000/hello
```

### 3.2 创建列表页面

```json
// public/api/products.json
{
  "title": "产品列表",
  "items": [
    { "id": 1, "name": "产品 A", "price": 100 },
    { "id": 2, "name": "产品 B", "price": 200 }
  ],
  "_schema": {
    "type": "object",
    "title": "产品列表",
    "properties": {
      "title": { "type": "string", "title": "标题" },
      "items": {
        "type": "array",
        "title": "产品",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "integer", "title": "ID" },
            "name": { "type": "string", "title": "名称" },
            "price": { "type": "number", "title": "价格" }
          }
        }
      }
    }
  }
}
```

### 3.3 添加工具（操作按钮）

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

### 3.4 表单验证

```json
{
  "email": "",
  "age": 0,
  "_schema": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "title": "邮箱",
        "required": true,
        "format": "email"
      },
      "age": {
        "type": "integer",
        "title": "年龄",
        "minimum": 0,
        "maximum": 150
      }
    }
  }
}
```

---

## 四、最佳实践

### 4.1 Schema 设计

**✅ 推荐：**
```json
{
  "_schema": {
    "type": "object",
    "title": "清晰的标题",
    "groups": [
      {
        "key": "basic",
        "title": "基本信息",
        "fields": ["name", "email"]
      }
    ],
    "properties": {
      "name": { "type": "string", "title": "姓名", "required": true }
    }
  }
}
```

**❌ 避免：**
- 缺少 `title` 字段
- 字段类型不明确
- 缺少必要的验证规则

### 4.2 Tool 设计

**✅ 推荐：**
```json
{
  "tools": [{
    "name": "submit",
    "description": "提交表单",
    "protocol": "http",
    "method": "POST",
    "url": "/api/submit",
    "onSuccess": [
      { "type": "message", "message": "提交成功", "level": "success" },
      { "type": "navigate", "target": "/list" }
    ],
    "onError": [
      { "type": "message", "message": "提交失败", "level": "error" }
    ]
  }]
}
```

### 4.3 认证授权（Server 驱动）

**Server 端逻辑：**

```typescript
// Node.js 示例
app.get('/api/admin', (req, res) => {
  // 1. 检查认证
  if (!req.user) {
    return res.json({
      username: "",
      password: "",
      _schema: { /* 登录表单 Schema */ }
    })
  }

  // 2. 检查权限
  if (!req.user.hasPermission('admin')) {
    return res.status(403).json({
      code: 403,
      message: "无权限访问",
      _schema: { /* 403 提示 Schema */ }
    })
  }

  // 3. 返回正常数据
  res.json({ /* 业务数据 */ })
})
```

**App 端：** 无需任何认证逻辑，自动渲染 Server 返回的内容。

### 4.4 性能优化

**图片懒加载：**
```vue
<img v-lazy="imageUrl" alt="" />
```

**大数据列表使用虚拟滚动：**
```vue
<VirtualList
  :items="largeList"
  :item-height="50"
  :height="400"
>
  <template #default="{ item }">
    <div>{{ item.name }}</div>
  </template>
</VirtualList>
```

---

## 五、API 服务

### 5.1 请求方法

```typescript
import { get, post, put, del } from '@/services/api'

// GET 请求（带缓存和重试）
const data = await get('/api/users')

// POST 请求
const result = await post('/api/users', { name: 'John' })

// 自定义配置
const data = await get('/api/users', {
  cache: true,      // 启用缓存
  timeout: 5000,    // 超时时间
  retries: 3        // 重试次数
})
```

### 5.2 自动功能

- ✅ 自动携带 Token
- ✅ 请求缓存（5 分钟 TTL）
- ✅ 自动重试（指数退避）
- ✅ 超时处理（30 秒默认）

---

## 六、状态管理

### 6.1 使用 Pinia Store

```typescript
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 显示 Toast
appStore.showSuccess('操作成功')
appStore.showError('操作失败')
appStore.showWarning('警告信息')
appStore.showInfo('提示信息')

// 控制 Loading
appStore.setLoading(true)
// 或自动管理
await appStore.withLoading(promise)

// 主题切换
appStore.toggleTheme()
appStore.setTheme('dark')
```

### 6.2 全局 Toast

```vue
<template>
  <GlobalToast />
</template>
```

---

## 七、错误处理

### 7.1 错误边界组件

```vue
<template>
  <ErrorBoundary
    title="页面加载失败"
    :show-retry="true"
    @reset="loadData"
  >
    <YourComponent />
  </ErrorBoundary>
</template>
```

### 7.2 全局错误处理

```typescript
import { handleError } from '@/services/errorHandler'

try {
  // 可能出错的代码
} catch (error) {
  handleError(error)
}
```

---

## 八、工具指令

### 8.1 触摸手势

```vue
<!-- 点击 -->
<div v-touch="{ onTap: handleTap }">点击我</div>

<!-- 滑动 -->
<div v-touch="{ onSwipeLeft: next, onSwipeRight: prev }">
  滑动切换
</div>

<!-- 长按 -->
<button v-longpress="showMenu">长按显示菜单</button>
```

### 8.2 图片懒加载

```vue
<img v-lazy="imageUrl" alt="描述" />
```

---

## 九、常见问题

### Q1: 如何实现认证？

**A:** 认证完全由 Server 控制。Server 根据用户状态返回不同的 Schema：
- 未登录 → 返回登录表单
- 无权限 → 返回 403 提示
- 正常 → 返回业务数据

App 端只需自动携带 Token 即可。

### Q2: 如何自定义组件？

**A:** 在 `src/components/sections/` 下创建对应语义类型的组件：

```vue
<!-- src/components/sections/CustomSection.vue -->
<template>
  <div class="custom-section">
    <!-- 自定义渲染逻辑 -->
  </div>
</template>
```

### Q3: 如何禁用请求缓存？

**A:** 
```typescript
const data = await get('/api/data', { cache: false })
```

### Q4: 如何清除缓存？

**A:**
```typescript
import { clearCache } from '@/services/api'
clearCache() // 清除所有缓存
clearCache('/api/users') // 清除特定 URL 缓存
```

---

## 十、版本信息

**当前版本:** 0.9.0

**核心功能:**
- ✅ Schema 驱动渲染
- ✅ Server 驱动认证授权
- ✅ 请求缓存/重试/超时
- ✅ 表单验证
- ✅ 移动端适配
- ✅ 触摸手势
- ✅ 虚拟滚动
- ✅ 图片懒加载
- ✅ 全局状态管理
- ✅ 错误边界

---

**许可:** MIT License
