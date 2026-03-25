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
- 📋 **自动布局** - 根据字段数自动选择表格/卡片/按钮布局
- 🔧 **Tool 机制** - 支持 HTTP/Navigate 协议的操作定义
- 🧩 **通用组件** - 无业务耦合，完全复用
- 🗺️ **极简映射** - 前端 URL 到后端数据源的简单映射（仅 2 条规则）

---

## 文档

| 文档 | 说明 |
|-----|------|
| [**Schema 规范**](./docs/specs/SCHEMA_SPEC.md) | 📝 Schema 格式定义 |
| [**Tool 规范**](./docs/specs/TOOL_SPEC.md) | 🔧 Tool 协议定义 |
| [**数据源映射**](./docs/DATA_SOURCE_MAPPER.md) | 🗺️ URL 映射规则（仅 2 条） |
| [**更新日志**](./docs/CHANGELOG.md) | 📅 版本更新记录 |

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
    "tools": [
      {
        "name": "login",
        "description": "登录系统",
        "protocol": "http",
        "method": "POST",
        "url": "/api/auth/login",
        "onSuccess": [
          { "type": "message", "message": "登录成功", "level": "success" },
          { "type": "navigate", "target": "/" }
        ]
      }
    ]
  }
}
```

### 前端自动渲染

登录表单自动呈现，点击登录后执行 HTTP 请求并导航。

---

## 语义类型

所有语义类型平级，无特殊前缀：

| 类型 | 说明 | 渲染组件 |
|-----|------|---------|
| `nav` | 导航栏 | SectionNav |
| `tree` | 树形菜单 | TreeLayout |
| `tabs` | 标签页 | TabsLayout |
| `hero` | Hero 区域 | HeroSection |
| `stats` | 统计数据 | StatsSection |
| `features` | 功能列表 | FeaturesSection |
| `content` | 内容区块 | ContentSection |
| `list` | 列表区块 | ListSection |
| `cta` | 行动号召 | CtaSection |
| `footer` | 页脚 | FooterSection |

**字段语义**: `email`, `phone`, `url`, `image`, `file`, `status`, `amount`, `date` 等

完整类型定义见：[Schema 规范](./docs/specs/SCHEMA_SPEC.md)

---

## 项目结构

```
agierBro/
├── agierBro-vue/           # Vue 参考实现
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── sections/   # 语义 Section
│   │   │   ├── SchemaRenderer.vue
│   │   │   ├── ObjectForm.vue
│   │   │   ├── FileUploader.vue
│   │   │   ├── ThemeSwitcher.vue
│   │   │   └── ...
│   │   ├── composables/    # 组合式函数
│   │   │   ├── useFormValidator.ts
│   │   │   ├── useTheme.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── dataSourceMapper.ts
│   │   └── views/Entry.vue
│   └── public/api/         # 示例数据
├── docs/
│   ├── specs/              # 规范
│   ├── CHANGELOG.md
│   └── DATA_SOURCE_MAPPER.md
└── README.md
```

---

## 核心设计

### 渲染决策

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

### 列表自动布局

| 可见字段数 | 布局 |
|-----------|------|
| 1 | 按钮 |
| 2-4 | 卡片 |
| > 4 | 表格 |

### URL 映射规则（极简）

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

详见：[数据源映射文档](./docs/DATA_SOURCE_MAPPER.md)

---

## 学习路径

### 1. 快速入门

```bash
cd agierBro-vue
npm install
npm run dev
```

访问 http://localhost:3000，修改 `public/api/` 下的 JSON 文件查看效果。

### 2. 理解协议

1. [Schema 规范](./docs/specs/SCHEMA_SPEC.md) - 数据格式
2. [Tool 规范](./docs/specs/TOOL_SPEC.md) - 操作定义
3. [数据源映射](./docs/DATA_SOURCE_MAPPER.md) - URL 规则

### 3. 开发应用

1. 定义后端 API 返回的数据和 Schema
2. 使用内置组件自动渲染
3. 根据需要扩展组件

---

## 版本信息

**当前版本:** 0.6.1

**最新版本特性:**
- ✅ 极简数据源映射规则（仅 2 条）
- ✅ 工具调用表单支持（登录/注册）
- ✅ 表单验证、文件上传、主题切换

详见：[更新日志](./docs/CHANGELOG.md)

---

## 许可

MIT License
