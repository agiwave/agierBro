# 论文评审系统 - 演示指南

**版本:** 1.0.0  
**日期:** 2024-03-18  
**状态:** ✅ 可运行

---

## 系统概述

这是一个基于 AgierBro 架构的论文评审系统演示，展示了如何通过数据驱动的方式构建完整的 Web 应用。

**核心特点:**
- 所有页面和数据通过 API 提供
- `_schema` 描述数据结构和可用操作
- App 像 LLM 一样理解并使用数据/能力

---

## 访问地址

**http://localhost:3000**

---

## 系统结构

```
/ (首页 @nav)
├── /auth/login (登录)
├── /auth/register (注册)
├── /editor (编辑后台 @tree)
│   ├── /editor/papers (论文列表)
│   └── /editor/submit (提交评审)
└── /reviewer (专家后台 @tree)
    ├── /reviewer/tasks (评审任务)
    └── /reviewer/review/:id (填写评审)
```

---

## 用户角色

### 编辑（Editor）

**职责:**
- 提交论文评审需求
- 管理论文列表
- 查看评审结果

**访问路径:**
1. 访问首页 → 点击"编辑后台"
2. 或直接访问 `/editor`

### 评审专家（Reviewer）

**职责:**
- 查看分配的评审任务
- 填写评审意见
- 提交评审结果

**访问路径:**
1. 访问首页 → 点击"专家后台"
2. 或直接访问 `/reviewer`

---

## 测试场景

### 场景 1: 编辑提交论文评审

**路径:** 首页 → 编辑后台 → 论文管理 → 提交评审

**步骤:**
1. 访问 http://localhost:3000/
2. 点击"编辑后台"
3. 点击"提交评审"
4. 填写论文编号、选择评审专家、设置截止日期
5. 点击"提交评审请求"

**数据文件:** `/api/editor/submit.json`

---

### 场景 2: 专家查看评审任务

**路径:** 首页 → 专家后台 → 评审任务 → 待评审

**步骤:**
1. 访问 http://localhost:3000/
2. 点击"专家后台"
3. 点击"评审任务"
4. 查看待评审论文列表

**数据文件:** `/api/reviewer/tasks.json`

---

### 场景 3: 专家填写评审

**路径:** 首页 → 专家后台 → 评审任务 → 待评审 → 开始评审

**步骤:**
1. 访问 http://localhost:3000/reviewer/tasks
2. 点击"开始评审"
3. 填写评分、评审意见、评审结论
4. 点击"提交评审"

**数据文件:** `/api/reviewer/review/TASK-001.json`

---

## 数据结构说明

### 首页导航 (@nav)

```json
{
  "_schema": "@nav",
  "title": "论文评审系统",
  "links": [
    { "icon": "🏠", "title": "首页", "url": "/" },
    { "icon": "👤", "title": "登录", "url": "/auth/login" },
    { "icon": "👨‍💼", "title": "编辑后台", "url": "/editor" },
    { "icon": "👨‍🎓", "title": "专家后台", "url": "/reviewer" }
  ]
}
```

**含义:** "这是一个导航数据结构"

---

### 编辑后台 (@tree)

```json
{
  "_schema": "@tree",
  "title": "编辑后台",
  "nodes": [
    {
      "title": "论文管理",
      "icon": "📄",
      "content": "/api/editor/papers.json",
      "children": [...]
    }
  ]
}
```

**含义:** "这是一个树状菜单结构"

---

### 论文列表 (普通数据)

```json
{
  "items": [...],
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
        "name": "submit_review",
        "title": "提交评审",
        "description": "提交新的论文评审请求",
        "input_schema": { ... },
        "protocol": "http",
        "url": "/api/editor/submit"
      }
    ]
  }
}
```

**含义:** 
- 数据包含论文列表
- 可以执行"提交评审"操作

---

### 评审表单 (带 Tools 的对象)

```json
{
  "task_id": "TASK-001",
  "score": 80,
  "comments": "",
  "recommendation": "accept",
  "_schema": {
    "tools": [
      {
        "name": "submit_review",
        "title": "提交评审",
        "description": "提交评审结果",
        "input_schema": { ... },
        "protocol": "http",
        "url": "/api/reviewer/review/{task_id}/submit",
        "action": { "type": "navigate", "target": "/reviewer/tasks" }
      }
    ]
  }
}
```

**含义:**
- 这是评审表单数据
- 可以执行"提交评审"操作
- 提交后跳转到评审任务列表

---

## API 文件列表

| 文件 | 类型 | 说明 |
|-----|------|------|
| `/api/index.json` | @nav | 首页导航 |
| `/api/auth/login.json` | 表单 | 登录页面 |
| `/api/auth/register.json` | 表单 | 注册页面 |
| `/api/editor/index.json` | @tree | 编辑后台菜单 |
| `/api/editor/papers.json` | 列表 | 论文列表 |
| `/api/editor/submit.json` | 表单 | 提交评审 |
| `/api/reviewer/index.json` | @tree | 专家后台菜单 |
| `/api/reviewer/tasks.json` | 列表 | 评审任务列表 |
| `/api/reviewer/review/TASK-001.json` | 表单 | 填写评审 |

---

## 核心概念验证

### 1. 数据自我描述

```json
{ "_schema": "@nav" }  // 告诉 App：这是导航数据
{ "_schema": "@tree" } // 告诉 App：这是树状菜单
```

### 2. 能力定义

```json
{
  "tools": [
    {
      "name": "submit_review",
      "description": "提交评审结果",  // 清晰的描述
      "input_schema": { ... },       // 明确的参数
      "action": { "type": "navigate" } // 执行后的行为
    }
  ]
}
```

### 3. App 自主决策

- Server 不告诉 App"用蓝色按钮"
- Server 不告诉 App"按钮放右边"
- App 理解能力后**自主决定**如何呈现

---

## 下一步扩展

### 1. 完善登录流程

- 添加登录响应处理
- 添加用户会话管理
- 添加权限控制

### 2. 完善评审流程

- 添加评审结果存储
- 添加评审状态跟踪
- 添加通知机制

### 3. 添加更多功能

- 论文详情页面
- 评审历史记录
- 统计分析页面

---

**最后更新:** 2024-03-18  
**状态:** ✅ 可运行演示
