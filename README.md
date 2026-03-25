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

**Server 职责：** 提供数据 + 能力（Tools）
**App 职责：** 理解 Schema + 识别语义 + 自主呈现

```
Server → { data, _schema, _tools } → App → UI
```

---

## 关键特性

### 核心能力

- ✨ **Schema 驱动** - 数据自描述结构，前端自动渲染
- 🎯 **语义类型** - 统一语义类型体系，决定渲染方式
- 📋 **自动布局** - 根据字段数自动选择表格/卡片/按钮布局
- 🔧 **Tool 机制** - 支持 HTTP/Navigate 协议的操作定义
- 🧩 **通用组件** - 无业务耦合，完全复用

### 增强功能（v0.6.0）

- 📝 **表单验证** - 必填/长度/范围/格式/正则等多种验证
- 📎 **文件上传** - 拖拽上传、多文件、进度显示、文件预览
- 🔍 **列表增强** - 搜索、筛选、分页、排序、视图切换
- 🎨 **主题切换** - 亮色/暗色主题、自定义主题色、系统跟随
- 🗺️ **通用映射** - 可配置的前端 URL 到后端数据源映射

---

## 文档

| 文档 | 说明 |
|-----|------|
| [**设计文档**](./docs/DESIGN.md) | 📘 完整设计文档 |
| [**Schema 规范**](./docs/specs/SCHEMA_SPEC.md) | 📝 Schema 格式定义 |
| [**Tool 规范**](./docs/specs/TOOL_SPEC.md) | 🔧 Tool 协议定义 |
| [**语义类型**](./docs/specs/SCHEMA_SPEC.md#语义类型) | 🏷️ 统一语义类型体系 |
| [**数据源映射器**](./docs/DATA_SOURCE_MAPPER.md) | 🗺️ URL 映射规则说明 |
| [**更新日志**](./docs/CHANGELOG.md) | 📅 版本更新记录 |

---

## 示例

### 后端 API 返回

```json
{
  "id": "ORD-001",
  "name": "订单 A",
  "status": "draft",
  "_schema": {
    "type": "object",
    "title": "订单详情",
    "properties": {
      "id": { "type": "string", "title": "订单 ID", "readOnly": true },
      "name": { "type": "string", "title": "订单名称", "required": true },
      "status": {
        "type": "string",
        "title": "状态",
        "enum": [
          { "value": "draft", "label": "草稿" },
          { "value": "pending", "label": "待审核" }
        ]
      }
    },
    "tools": [
      {
        "name": "submit_order",
        "description": "提交订单审核",
        "protocol": "http",
        "method": "POST",
        "url": "/api/orders/ORD-001/submit",
        "onSuccess": [
          { "type": "message", "message": "提交成功", "level": "success" },
          { "type": "navigate", "target": "/orders" }
        ]
      }
    ]
  }
}
```

### 前端自动渲染

```
详情页面自动分组：
├── 基本信息（简单字段合并）
│   ├── 订单 ID: ORD-001
│   ├── 订单名称：订单 A
│   └── 状态：草稿
└── 操作按钮
    └── [提交审核]
```

---

## 语义类型

AgierBro 使用统一的语义类型体系，所有类型平级，无特殊前缀：

### 结构类型
| 类型 | 说明 | 渲染组件 |
|-----|------|---------|
| `nav` | 导航栏 | NavLayout |
| `tree` | 树形菜单 | TreeLayout |
| `tabs` | 标签页 | TabsLayout |

### 页面区块
| 类型 | 说明 | 渲染组件 |
|-----|------|---------|
| `hero` | Hero 区域 | HeroSection |
| `stats` | 统计数据 | StatsSection |
| `features` | 功能列表 | FeaturesSection |
| `cta` | 行动号召 | CtaSection |
| `footer` | 页脚 | FooterSection |
| `content` | 内容区块 | ContentSection |
| `list` | 列表区块 | ListSection |

### 字段语义
| 类型 | 说明 | 渲染优化 |
|-----|------|---------|
| `email` | 邮箱 | 邮件链接 |
| `phone` | 电话 | 电话链接 |
| `url` | 链接 | 超链接 |
| `image` | 图片 | 图片显示 |
| `file` | 文件 | 文件下载 |
| `status` | 状态 | 状态标签 |
| `amount` | 金额 | 货币格式化 |
| `date` | 日期 | 日期格式化 |

完整类型定义见：[Schema 规范](./docs/specs/SCHEMA_SPEC.md#语义类型)

---

## 项目结构

```
agierBro/
├── agierBro-vue/               # Vue 参考实现
│   ├── src/
│   │   ├── components/         # 组件
│   │   │   ├── sections/       # 语义 Section 组件
│   │   │   │   ├── HeroSection.vue
│   │   │   │   ├── StatsSection.vue
│   │   │   │   ├── ContentSection.vue
│   │   │   │   ├── ListSection.vue
│   │   │   │   └── ...
│   │   │   ├── FileUploader.vue    # 文件上传
│   │   │   ├── ListEnhanced.vue    # 增强列表
│   │   │   ├── SchemaRenderer.vue  # Schema 渲染器
│   │   │   ├── ObjectForm.vue      # 表单组件
│   │   │   ├── ThemeSwitcher.vue   # 主题切换
│   │   │   └── ...
│   │   ├── composables/        # 组合式函数
│   │   │   ├── useFormValidator.ts   # 表单验证
│   │   │   ├── useTheme.ts         # 主题管理
│   │   │   ├── useToolExecutor.ts  # Tool 执行
│   │   │   └── ...
│   │   ├── services/           # 服务
│   │   │   ├── api.ts                # API 服务
│   │   │   ├── dataSourceMapper.ts   # 数据源映射器
│   │   │   └── ...
│   │   ├── types/            # 类型定义
│   │   ├── views/            # 视图
│   │   │   └── Entry.vue           # 统一入口
│   │   └── router/           # 路由配置
│   ├── public/api/           # 静态 API 数据（示例）
│   └── package.json
├── docs/                     # 文档
│   ├── specs/                # 规范文档
│   │   ├── SCHEMA_SPEC.md    # Schema 规范
│   │   └── TOOL_SPEC.md      # Tool 规范
│   ├── DESIGN.md             # 设计文档
│   ├── DATA_SOURCE_MAPPER.md # 数据源映射器
│   ├── CHANGELOG.md          # 更新日志
│   └── ...
└── README.md                 # 本文件
```

---

## 学习路径

### 1. 快速入门

```bash
# 1. 运行项目
cd agierBro-vue
npm install
npm run dev

# 2. 访问示例页面
# http://localhost:3000

# 3. 修改示例数据
# 编辑 public/api/ 下的 JSON 文件
```

### 2. 理解协议

1. 阅读 [Schema 规范](./docs/specs/SCHEMA_SPEC.md) - 理解数据格式
2. 阅读 [Tool 规范](./docs/specs/TOOL_SPEC.md) - 理解操作定义
3. 理解 [语义类型](./docs/specs/SCHEMA_SPEC.md#语义类型) - 理解渲染选择

### 3. 开发应用

1. 定义后端 API 返回的数据和 Schema
2. 配置 [数据源映射规则](./docs/DATA_SOURCE_MAPPER.md)
3. 使用内置组件自动渲染
4. 根据需要扩展组件和验证规则

---

## 核心设计

### 渲染决策树

```
数据加载
    ↓
获取 semantic 类型
    ↓
nav ──────→ NavLayout
tree ─────→ TreeLayout
tabs ─────→ TabsLayout
hero ─────→ HeroSection
stats ────→ StatsSection
features ─→ FeaturesSection
cta ──────→ CtaSection
footer ───→ FooterSection
content ──→ ContentSection
list ─────→ ListSection
无/其他 ──→ SectionBlock (通用渲染)
```

### 列表自动布局

对于列表数据，根据可见字段数自动选择布局：

| 可见字段数 | 布局 | 组件 |
|-----------|------|------|
| 1 | 按钮布局 | ListRenderer |
| 2-4 | 卡片布局 | ListRenderer |
| > 4 | 表格布局 | ListRenderer |

### URL 映射规则

默认的前端 URL 到后端数据源映射规则：

| 前端 URL | 后端数据源 |
|---------|-----------|
| `/` | `/api/index.json` |
| `/:entity` | `/api/:entity/index.json` |
| `/:entity/:sub` | `/api/:entity/:sub/index.json` |
| `/:entity/:sub/:id` | `/api/:entity/:sub/:id.json` |
| `/test/:page` | `/api/test/:page.json` |
| `/actions/:action` | `/api/actions/:action.json` |

详见：[数据源映射器文档](./docs/DATA_SOURCE_MAPPER.md)

---

## 版本信息

**当前版本:** 0.6.0

**最新版本特性:**
- ✅ 表单验证机制
- ✅ 文件上传支持
- ✅ 列表增强（搜索/筛选/分页）
- ✅ 主题切换（亮色/暗色）
- ✅ 通用数据源映射器

详见：[更新日志](./docs/CHANGELOG.md)

---

## 社区

- 📧 问题反馈：GitHub Issues
- 💡 建议：GitHub Discussions

---

## 许可

MIT License
