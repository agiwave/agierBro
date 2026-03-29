# AgierBro

**数据驱动的通用 App 引擎 v6.0**

> Server 关注数据和功能，App 专注呈现机制
> 
> **一切皆工具描述** - in/out 分离的纯工具描述架构

---

## 快速开始

```bash
cd agierBro-vue
npm install
npm run dev
```

访问 http://localhost:3000

---

## 核心思想 (v6.0)

**Server 职责：** 提供工具描述（in/out Schema）
**App 职责：** 理解 Schema + 识别语义 + 自主呈现

```
Server → { _schema: { in, out } } → App → UI
                    ↑
          in: 输入参数（需要表单？）
          out: 输出描述（渲染数据）
```

**纯工具描述架构：**
- **`in`** - 工具的输入参数描述（调用工具需要什么）
- **`out`** - 工具的输出描述（工具返回什么数据）
- **`in` 为空** → 数据展示（view 模式）
- **`in` 有定义** → 表单输入（edit 模式）

---

## 关键特性

- ✨ **Schema 驱动** - 数据自描述结构，前端自动渲染
- 🎯 **语义类型** - 统一语义类型体系，决定渲染方式
- 📋 **自动布局** - 根据字段数自动选择表格/卡片/按钮
- 🔧 **纯工具描述** - in/out 分离，统一架构
- 🧩 **通用组件** - 无业务耦合，完全复用
- 📱 **移动端适配** - 响应式布局、触摸手势、下拉刷新

---

## 文档

| 文档 | 说明 |
|-----|------|
| [**架构文档**](./docs/ARCHITECTURE_V6.md) | 📘 v6.0 架构详解（in/out 工具描述） |
| [**路由重构**](./docs/ROUTING_REFACTOR.md) | 🔄 统一分形路由规则说明 |
| [**验证报告**](./docs/VALIDATION_REPORT.md) | ✅ 示例数据验证报告 |
| [**规范文档**](./docs/specs/) | 📝 Schema/Tool 规范定义 |
| [**更新日志**](./docs/CHANGELOG.md) | 📅 版本历史 |

---

## URL 映射（统一分形规则）

```
/xxx/yyy/zzz → /api/xxx/yyy/zzz.json
```

| 前端 URL | 后端数据源 | 说明 |
|---------|-----------|------|
| `/` | `/api/index.json` | 首页 |
| `/users` | `/api/users.json` | 用户列表 |
| `/users/001` | `/api/users/001.json` | 用户详情 |
| `/users/001/edit` | `/api/users/001/edit.json` | 编辑用户 |
| `/editor/papers/paper-001` | `/api/editor/papers/paper-001.json` | 论文详情 |

---

## 示例

### 数据展示（in 为空）

```json
{
  "id": "user-001",
  "username": "admin",
  "email": "admin@example.com",
  "_schema": {
    "in": {},
    "out": {
      "type": "object",
      "title": "用户详情",
      "properties": {
        "id": { "type": "string", "title": "ID" },
        "username": { "type": "string", "title": "用户名" },
        "email": { "type": "string", "title": "邮箱" }
      }
    }
  }
}
```

**前端行为：** `in` 为空 → `mode = 'view'` → 展示数据

### 表单输入（in 有定义）

```json
{
  "_schema": {
    "in": {
      "type": "object",
      "title": "登录",
      "properties": {
        "username": {
          "type": "string",
          "title": "用户名",
          "required": true
        },
        "password": {
          "type": "string",
          "title": "密码",
          "format": "password",
          "required": true
        }
      }
    },
    "out": {
      "type": "object",
      "properties": {
        "access_token": { "type": "string" },
        "message": { "type": "string" }
      }
    }
  },
  "protocol": "http",
  "method": "POST",
  "url": "/api/auth/login.json"
}
```

**前端行为：** `in` 有 `required` 字段 → `mode = 'edit'` → 呈现表单

### 前端智能判断

```typescript
// 核心判断逻辑
if (needsInput(data)) {
  mode.value = 'edit'   // 需要输入，呈现表单
} else {
  mode.value = 'view'   // 无需输入，展示数据
}
```

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
│   │   ├── services/   # 服务（API、in/out 提取）
│   │   ├── stores/     # 状态管理
│   │   └── views/      # 视图（Entry.vue）
│   └── public/api/     # 示例数据（in/out 格式）
├── docs/               # 文档
│   ├── ARCHITECTURE_V6.md  # 🔄 架构详解
│   ├── CORE.md         # 核心文档
│   ├── specs/          # 规范文档
│   └── ...
└── README.md           # 本文件
```

---

## 版本

**当前版本:** 6.0.0

**v6.0 新特性:**
- ✅ **纯工具描述** - 所有接口返回 in/out Schema
- ✅ **in/out 分离** - 输入输出明确分离
- ✅ **统一判断逻辑** - `needsInput()` 决定呈现方式
- ✅ **清晰资源层级** - 支持服务器端统一路由规则

**历史版本:**
- 5.0.0 - 统一工具模型
- 0.9.0 - 移动端完整适配、测试覆盖
- 0.8.0 - Server 驱动认证授权

详见：[CHANGELOG.md](docs/CHANGELOG.md)

---

## 许可

MIT License
