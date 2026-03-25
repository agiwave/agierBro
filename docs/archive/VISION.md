# AgierBro 项目愿景

**版本:** 1.0.0  
**日期:** 2024-03-18  
**状态:** ✅ 核心理念明确

---

## 项目愿景

**构建一个数据驱动的通用 App 引擎，让服务器端通过 API 提供所有业务数据和能力，App 端像大语言模型一样理解并使用这些数据和能力。**

---

## 核心理念

### 1. 服务器端职责

**提供两样东西：**

1. **数据** - 业务数据本身
2. **能力** - 可以对这个数据执行的操作（Tools）

```json
{
  "// 1. 数据": "",
  "items": [
    { "id": "ORD-001", "customer_name": "张三", "status": "draft" }
  ],
  
  "// 2. 能力（通过 _schema 描述）": "",
  "_schema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": { ... }
      }
    },
    "tools": [
      {
        "name": "submit_order",
        "description": "提交订单审核",
        "input_schema": { ... },
        "protocol": "http",
        "url": "/api/orders/{id}/submit"
      }
    ]
  }
}
```

---

### 2. App 端职责

**像大语言模型一样理解和使用：**

1. **理解数据** - 通过 `_schema` 理解数据结构和含义
2. **发现能力** - 通过 `tools` 发现可以执行的操作
3. **自主选择** - 根据用户意图选择合适的 Tool
4. **执行操作** - 调用 Tool 并处理结果

```
┌─────────────────────────────────────────────────────────────┐
│                         App                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  理解层                                                │ │
│  │  - 解析 _schema                                        │ │
│  │  - 理解数据结构（@nav = 导航数据）                     │ │
│  │  - 发现可用 tools                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  决策层                                                │ │
│  │  - 根据用户意图选择 Tool                               │ │
│  │  - 准备输入参数                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  执行层                                                │ │
│  │  - 调用 Tool（HTTP/MCP）                               │ │
│  │  - 处理响应                                            │ │
│  │  - 执行 Action（navigate/reload 等）                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. _schema 的作用

**就像给 LLM 的 Tool Description：**

```json
// LLM Tool Calling
{
  "name": "get_weather",
  "description": "获取天气信息",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { 
        "type": "string", 
        "description": "城市名" 
      }
    }
  }
}

// AgierBro _schema
{
  "name": "submit_order",
  "description": "提交订单审核",
  "input_schema": {
    "type": "object",
    "properties": {
      "id": { 
        "type": "string", 
        "description": "订单 ID" 
      }
    }
  }
}
```

**_schema 告诉 App：**
- "我是什么类型的数据"（`@nav` = 导航数据）
- "我的字段含义是什么"（`properties`）
- "我可以执行什么操作"（`tools`）

---

## 关键概念

### 内置 Schema（数据结构类型）

| Schema | 含义 | App 理解 |
|-------|------|---------|
| **@nav** | 这是一个导航数据结构 | 包含多个链接，用户可以跳转 |
| **@tree** | 这是一个树状菜单结构 | 有层级关系，可以展开/折叠 |
| **@tabs** | 这是一个标签页结构 | 有多个标签，可以切换查看 |
| **@link** | 这是一个跳转链接 | 点击后跳转到目标地址 |
| **(无)** | 这是普通数据 | 根据 properties 自动渲染 |

**重要：**
- 这些不是"UI 指令"
- 而是"数据结构类型声明"
- App 理解后**自主决定**如何呈现

---

### Tools（能力定义）

**Tool 不是"按钮配置"，而是"数据对象可以执行的操作"：**

```json
{
  "name": "submit_order",
  "title": "提交审核",
  "description": "将订单提交到审核流程",
  "input_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" }
    }
  },
  "protocol": "http",
  "url": "/api/orders/{id}/submit",
  "action": {
    "type": "navigate",
    "target": "/orders"
  }
}
```

**App 理解后：**
1. 知道这个数据对象可以"提交审核"
2. 知道需要 `id` 参数
3. 知道调用后会跳转到 `/orders`
4. **自主决定**如何呈现（按钮、菜单项、快捷操作等）

---

## 架构对比

### 传统架构

```
Server → 返回数据 + UI 配置 → App 按配置渲染
         (按钮位置、颜色等)
```

**问题：**
- Server 关心 UI 细节
- App 是被动的渲染器
- 无法适应不同设备/场景

### AgierBro 架构

```
Server → 返回数据 + 能力描述 → App 理解并自主呈现
         (_schema + tools)
```

**优势：**
- Server 只关心业务
- App 是智能的执行引擎
- 可以适应不同设备/场景

---

## 类比说明

### AgierBro App 就像 LLM

| LLM | AgierBro App |
|-----|-------------|
| 接收 Tool Description | 接收 _schema |
| 理解每个 Tool 的用途 | 理解每个 Tool 的用途 |
| 根据用户意图选择 Tool | 根据用户操作选择 Tool |
| 构造参数调用 Tool | 构造参数调用 Tool |
| 处理 Tool 返回结果 | 处理 Tool 返回结果 |

**区别：**
- LLM 用自然语言交互
- AgierBro App 用 UI 交互

**本质相同：**
- 都是理解工具描述
- 都是自主选择工具
- 都是执行工具调用

---

## 设计原则

### 1. 数据自我描述

```json
{
  "_schema": "@nav",  // ← 告诉 App：我是导航数据
  "links": [...]
}
```

### 2. 能力明确定义

```json
{
  "tools": [
    {
      "name": "create_order",
      "description": "创建新订单",  // ← 清晰的描述
      "input_schema": { ... }       // ← 明确的参数
    }
  ]
}
```

### 3. App 自主决策

- Server 不告诉 App"用什么颜色"
- Server 不告诉 App"按钮放哪里"
- App 根据设备、场景、用户习惯**自主决定**

### 4. 协议标准化

- `_schema` 是数据类型的协议
- `tools` 是能力描述的协议
- `input_schema` 是参数定义的协议

---

## 实现状态

### 已完成

- ✅ 内置 Schema 识别（@nav/@tree/@tabs/@link）
- ✅ Tool 定义和执行
- ✅ Action 处理（navigate/reload/back）
- ✅ 通用数据渲染（ObjectList/ObjectDetail）

### 待完善

- ⏳ Tool 的 `description` 规范化
- ⏳ App 理解能力增强（支持更多 Schema 类型）
- ⏳ 文档完善（明确核心理念）

---

## 下一步行动

### 1. 完善 Tool 定义

确保每个 Tool 都有：
- 清晰的 `name` 和 `title`
- 详细的 `description`
- 完整的 `input_schema`

### 2. 增强 App 理解能力

- 支持动态 Schema 类型
- 支持更复杂的决策逻辑
- 支持用户行为学习

### 3. 文档更新

- 明确 `_schema` 是"数据自我描述"
- 明确 `tools` 是"能力定义"
- 明确 App 是"智能执行引擎"

---

**最后更新:** 2024-03-18  
**状态:** ✅ 核心理念明确，实现中
