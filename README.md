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

**Server 职责：** 提供 数据 + 能力（Tools）  
**App 职责：** 理解 Schema + 识别语义 + 自主呈现

```
Server → { data, _schema, _tools } → App → UI
```

---

## 关键特性

- ✨ **三层设计** - Builtin Schema → Semantic Type → Schema Structure
- 🎯 **语义驱动** - 通过 semantic 类型选择渲染组件
- 📋 **自动布局** - 根据字段数选择表格/卡片/按钮
- 🔧 **Tool 机制** - 对齐 OpenAI Tool API
- 🧩 **通用组件** - 无业务耦合，完全复用

---

## 文档

| 文档 | 说明 |
|-----|------|
| [**设计文档**](./docs/DESIGN.md) | 📘 完整设计（统一语义类型，所有类型平级） |
| [**语义类型规范**](./agierBro-vue/src/specs/SEMANTIC_TYPE.md) | 📝 统一语义类型定义 |
| [**实施总结**](./docs/IMPLEMENTATION_SUMMARY.md) | ✅ 完整模拟网站实施成果 |

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
        "type": "function",
        "function": {
          "name": "submit_order",
          "description": "提交订单审核",
          "parameters": {
            "type": "object",
            "properties": {
              "id": { "type": "string" }
            }
          }
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/orders/ORD-001/submit"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "提交成功", "level": "success" },
            { "type": "navigate", "target": "/orders" }
          ]
        }
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

## 项目结构

```
agierBro/
├── agierBro-vue/           # Vue 参考实现
│   ├── src/
│   │   ├── components/
│   │   │   ├── ListRenderer.vue     # 统一列表渲染
│   │   │   ├── SchemaRenderer.vue   # 统一详情/表单
│   │   │   ├── SectionRenderer.vue  # Section 渲染
│   │   │   └── sections/            # 语义 Section 组件
│   │   └── views/
│   │       └── Entry.vue            # 统一入口
│   └── public/api/       # 静态 API 数据
├── docs/                 # 文档
│   ├── DESIGN.md                # 设计文档（主）
│   ├── SEMANTIC_TYPE_DESIGN.md  # 语义类型设计
│   ├── IMPLEMENTATION_PLAN.md   # 实施计划
│   └── ...
└── README.md             # 本文件
```

---

## 学习路径

### 1. 快速入门

1. 运行项目，查看示例页面
2. 阅读 [设计文档](./docs/DESIGN.md)
3. 修改 `public/api/` 下的示例数据

### 2. 理解协议

1. 学习三层设计（Builtin → Semantic → Schema）
2. 理解 Semantic Type 的作用
3. 掌握 Tool 定义和执行

### 3. 开发应用

1. 参考 [实施计划](./docs/IMPLEMENTATION_PLAN.md)
2. 实现用户认证、文件上传等功能
3. 开发完整的业务系统

---

## 核心设计

### 三层架构

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Builtin Schema (特殊交互)                          │
│ @nav, @tree, @tabs - 前端特殊处理                           │
└─────────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Semantic Type (渲染提示)                           │
│ hero, stats, features, cta, footer - 选择 Section 组件       │
└─────────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Schema Structure (结构定义)                        │
│ type, properties - 通用 SchemaRenderer 渲染                  │
└─────────────────────────────────────────────────────────────┘
```

### 渲染决策

```
数据加载
    ↓
判断 _schema 是否为内置类型
    ├── @nav → NavLayout
    ├── @tree → TreeLayout
    ├── @tabs → TabsLayout
    └── object → 继续判断
        ↓
    查看 semantic 类型
        ├── hero → HeroSection
        ├── stats → StatsSection
        ├── features → FeaturesSection
        ├── cta → CtaSection
        ├── footer → FooterSection
        └── 无/其他 → SectionBlock (通用渲染)
```

---

## 社区

- 📧 问题反馈：GitHub Issues
- 💡 建议：GitHub Discussions

---

## 许可

MIT License
