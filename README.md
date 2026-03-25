# AgierBro

**数据驱动的通用 App 引擎**

> Server 关注数据和功能，App 专注呈现机制

---

## 快速开始

```bash
cd agierBro-vue
npm install
npm run dev
```

访问 http://localhost:3000

---

## 核心思想

**Server 职责：** 提供数据 + Schema + Tools  
**App 职责：** 理解 Schema + 识别语义 + 自主呈现

```
Server → { data, _schema, _tools } → App → UI
```

---

## 关键特性

- ✨ **Schema 驱动** - 数据自描述结构，前端自动渲染
- 🎯 **语义类型** - 统一语义类型体系，决定渲染方式
- 📋 **自动布局** - 根据字段数自动选择表格/卡片/按钮
- 🔧 **Tool 机制** - 支持 HTTP/Navigate 协议的操作定义
- 🧩 **通用组件** - 无业务耦合，完全复用
- 📱 **移动端适配** - 响应式布局、触摸手势、下拉刷新

---

## 文档

| 文档 | 说明 |
|-----|------|
| [**核心文档**](./docs/CORE.md) | 📘 快速开始、协议说明、使用指南 |
| [**使用指南**](./docs/GUIDE.md) | 📖 完整使用指南、最佳实践 |
| [**认证重构**](./docs/AUTH_REFACTOR.md) | 🔐 Server 驱动认证方案详解 |
| [**Schema 规范**](./docs/specs/SCHEMA_SPEC.md) | 📝 Schema 格式定义 |
| [**Tool 规范**](./docs/specs/TOOL_SPEC.md) | 🔧 Tool 协议定义 |
| [**数据源映射**](./docs/DATA_SOURCE_MAPPER.md) | 🗺️ URL 映射规则 |
| [**更新日志**](./docs/CHANGELOG.md) | 📅 版本历史 |

---

## 示例

### 后端 API 返回

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

### 前端自动渲染

登录表单自动呈现，点击登录后执行 HTTP 请求并导航。

---

## URL 映射（极简）

```
1. /              → /api/index.json
2. /xxx           → /api/xxx.json（无论多少级）
```

| 前端 URL | 后端数据源 |
|---------|-----------|
| `/` | `/api/index.json` |
| `/auth/login` | `/api/auth/login.json` |
| `/editor/papers/paper-001` | `/api/editor/papers/paper-001.json` |

---

## 语义类型

| 类型 | 说明 | 类型 | 说明 |
|-----|------|-----|------|
| `nav` | 导航栏 | `hero` | Hero 区域 |
| `tree` | 树形菜单 | `stats` | 统计数据 |
| `tabs` | 标签页 | `features` | 功能列表 |
| `content` | 内容区块 | `cta` | 行动号召 |
| `list` | 列表区块 | `footer` | 页脚 |

**字段语义:** `email`, `phone`, `url`, `image`, `file`, `status`, `amount`, `date` 等

---

## 项目结构

```
agierBro/
├── agierBro-vue/       # Vue 参考实现
│   ├── src/
│   │   ├── components/ # 组件
│   │   ├── composables/# 组合式函数
│   │   ├── services/   # 服务
│   │   └── views/      # 视图
│   └── public/api/     # 示例数据
├── docs/               # 文档
│   ├── CORE.md         # 核心文档
│   ├── specs/          # 规范文档
│   └── ...
└── README.md           # 本文件
```

---

## 版本

**当前版本:** 0.9.0

**最新版本特性:**
- ✅ 企业级功能完善（错误边界、全局 Toast、状态管理）
- ✅ API 服务增强（缓存、重试、超时）
- ✅ 性能优化（虚拟滚动、图片懒加载）
- ✅ Server 驱动认证授权（App 端无业务逻辑）
- ✅ 完整的用户管理 CRUD 示例
- ✅ 测试覆盖 29+ 用例
- ✅ 移动端完整适配
- ✅ 触摸手势、下拉刷新
- ✅ 表单验证、文件上传、主题切换

详见：[CHANGELOG.md](docs/CHANGELOG.md)

---

## 许可

MIT License
