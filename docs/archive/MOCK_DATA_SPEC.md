# AgierBro 模拟数据规范

**目标:** 用纯 JSON 数据模拟完整网站，验证 App 机制完备性

---

## 设计原则

### 1. 数据完整性

模拟数据应包含：
- ✅ 所有业务实体（论文/用户/评审等）
- ✅ 所有操作（增删改查）
- ✅ 所有状态流转（草稿→待审核→已审核）
- ✅ 所有用户角色（编辑/专家/管理员）

### 2. 协议规范性

所有数据遵循：
- ✅ Schema 自描述
- ✅ Tool 定义完整
- ✅ Action 处理明确

### 3. 场景覆盖

覆盖所有典型场景：
- ✅ 列表展示（表格/卡片/按钮）
- ✅ 详情展示（分组/嵌套）
- ✅ 表单编辑（创建/更新）
- ✅ 复合页面（首页/仪表板）
- ✅ 文件操作（上传/下载）
- ✅ 状态变更（审核/分配）

---

## 数据结构设计

### 核心实体

```
论文评审系统
├── 用户 (User)
│   ├── 编辑 (Editor)
│   └── 评审专家 (Reviewer)
│
├── 论文 (Paper)
│   ├── 基本信息
│   ├── 作者信息
│   ├── 附件文件
│   └── 评审状态
│
├── 评审 (Review)
│   ├── 评审意见
│   ├── 评审结论
│   └── 评审附件
│
└── 通知 (Notification)
    ├── 系统通知
    └── 任务通知
```

---

## 模拟数据组织

### 目录结构

```
public/api/
├── index.json              # 首页
├── auth/
│   ├── login.json          # 登录页
│   ├── register.json       # 注册页
│   └── me.json             # 当前用户
│
├── editor/                 # 编辑后台
│   ├── papers/
│   │   ├── index.json      # 论文列表
│   │   └── :id.json        # 论文详情
│   ├── reviews/
│   │   └── index.json      # 评审管理
│   └── reviewers/
│       └── index.json      # 专家管理
│
├── reviewer/               # 专家后台
│   ├── tasks/
│   │   └── index.json      # 评审任务
│   └── reviews/
│       └── :id.json        # 评审详情
│
├── papers/                 # 公共论文访问
│   └── :id.json
│
├── notifications/          # 通知
│   └── index.json
│
└── actions/                # 操作响应
    ├── submit.json
    ├── assign.json
    └── review.json
```

---

## 关键设计

### 1. 认证模拟

**设计思路：** 通过不同用户登录返回不同的数据

```json
// auth/login.json - 登录表单
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "title": "登录",
    "properties": {
      "username": { "type": "string", "title": "用户名", "required": true },
      "password": { "type": "string", "title": "密码", "format": "password", "required": true }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "login",
          "description": "登录系统",
          "parameters": {
            "type": "object",
            "properties": {
              "username": { "type": "string" },
              "password": { "type": "string" }
            },
            "required": ["username", "password"]
          }
        },
        "execution": {
          "protocol": "navigate",
          "navigate": {
            "target": "/?role=editor"  // 模拟不同角色
          }
        }
      }
    ]
  }
}
```

```json
// auth/me.json - 当前用户信息（模拟已登录）
{
  "id": "editor-001",
  "username": "admin",
  "email": "admin@example.com",
  "role": "editor",
  "avatar": "/avatars/admin.png",
  "_schema": {
    "type": "object",
    "title": "个人信息",
    "properties": {
      "id": { "type": "string", "title": "用户 ID", "readOnly": true },
      "username": { "type": "string", "title": "用户名", "readOnly": true },
      "email": { "type": "string", "title": "邮箱", "readOnly": true },
      "role": { 
        "type": "string", 
        "title": "角色",
        "enum": [
          { "value": "editor", "label": "编辑" },
          { "value": "reviewer", "label": "评审专家" }
        ],
        "readOnly": true 
      },
      "avatar": { "type": "string", "title": "头像", "readOnly": true }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "logout",
          "description": "退出登录"
        },
        "execution": {
          "protocol": "navigate",
          "navigate": {
            "target": "/auth/login"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "reload" }
          ]
        }
      }
    ]
  }
}
```

### 2. 列表分页模拟

```json
// editor/papers/index.json
{
  "items": [
    {
      "id": "paper-001",
      "title": "基于深度学习的图像识别研究",
      "author": "张三",
      "status": "pending_review",
      "submitted_at": "2024-03-20"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "size": 10
  },
  "_schema": {
    "type": "object",
    "title": "论文管理",
    "properties": {
      "items": {
        "type": "array",
        "title": "论文列表",
        "items": {
          "type": "object",
          "_address": "/editor/papers/{id}.json",
          "properties": {
            "id": { "type": "string", "title": "编号" },
            "title": { "type": "string", "title": "标题" },
            "author": { "type": "string", "title": "作者" },
            "status": { 
              "type": "string", 
              "title": "状态",
              "enum": [
                { "value": "pending_review", "label": "待分配" },
                { "value": "reviewing", "label": "评审中" },
                { "value": "reviewed", "label": "已评审" }
              ]
            },
            "submitted_at": { "type": "string", "title": "提交时间" }
          }
        }
      }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "create_paper",
          "description": "创建新论文",
          "parameters": {}
        },
        "execution": {
          "protocol": "navigate",
          "navigate": {
            "target": "/editor/papers/new"
          }
        }
      }
    ]
  }
}
```

### 3. 复杂表单模拟

```json
// editor/papers/new.json
{
  "title": "",
  "abstract": "",
  "keywords": [],
  "author_name": "",
  "author_email": "",
  "author_affiliation": "",
  "file": null,
  "_schema": {
    "type": "object",
    "title": "提交论文",
    "description": "请填写论文信息并提交",
    "order": ["title", "abstract", "keywords", "author_name", "author_email", "author_affiliation", "file"],
    "properties": {
      "title": { 
        "type": "string", 
        "title": "论文标题", 
        "required": true,
        "maxLength": 100
      },
      "abstract": { 
        "type": "string", 
        "title": "摘要", 
        "required": true,
        "format": "text",
        "maxLength": 1000
      },
      "keywords": { 
        "type": "array", 
        "title": "关键词",
        "items": { "type": "string" },
        "required": true
      },
      "author_name": { 
        "type": "string", 
        "title": "作者姓名", 
        "required": true 
      },
      "author_email": { 
        "type": "string", 
        "title": "作者邮箱", 
        "format": "email",
        "required": true 
      },
      "author_affiliation": { 
        "type": "string", 
        "title": "作者单位", 
        "required": true 
      },
      "file": { 
        "type": "object", 
        "title": "论文附件",
        "required": true,
        "properties": {
          "name": { "type": "string", "title": "文件名" },
          "size": { "type": "number", "title": "文件大小" },
          "url": { "type": "string", "title": "文件路径" }
        }
      }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "submit_paper",
          "description": "提交论文",
          "parameters": {
            "type": "object",
            "properties": {
              "title": { "type": "string" },
              "abstract": { "type": "string" },
              "keywords": { "type": "array" },
              "author_name": { "type": "string" },
              "author_email": { "type": "string" },
              "author_affiliation": { "type": "string" },
              "file": { "type": "object" }
            },
            "required": ["title", "author_name", "author_email", "file"]
          }
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/editor/papers"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "论文提交成功", "level": "success" },
            { "type": "navigate", "target": "/editor/papers" }
          ]
        }
      }
    ]
  }
}
```

### 4. 评审流程模拟

```json
// reviewer/reviews/123.json - 评审详情页
{
  "id": "review-001",
  "paper_id": "paper-001",
  "paper_title": "基于深度学习的图像识别研究",
  "status": "pending",
  "assigned_at": "2024-03-21",
  "due_date": "2024-04-04",
  "review_content": "",
  "recommendation": "",
  "confidential_comments": "",
  "_schema": {
    "type": "object",
    "title": "论文评审",
    "description": "请仔细阅读论文并填写评审意见",
    "order": ["paper_title", "status", "due_date", "review_content", "recommendation", "confidential_comments"],
    "properties": {
      "id": { "type": "string", "title": "评审编号", "readOnly": true },
      "paper_id": { "type": "string", "title": "论文 ID", "readOnly": true },
      "paper_title": { "type": "string", "title": "论文标题", "readOnly": true },
      "status": { 
        "type": "string", 
        "title": "评审状态",
        "enum": [
          { "value": "pending", "label": "待评审" },
          { "value": "submitted", "label": "已提交" }
        ],
        "readOnly": true 
      },
      "assigned_at": { "type": "string", "title": "分配时间", "readOnly": true },
      "due_date": { "type": "string", "title": "截止日期", "readOnly": true },
      "review_content": { 
        "type": "string", 
        "title": "评审意见", 
        "format": "rich-text",
        "required": true,
        "description": "请详细说明论文的优缺点"
      },
      "recommendation": { 
        "type": "string", 
        "title": "评审结论",
        "enum": [
          { "value": "accept", "label": "接收", "color": "green" },
          { "value": "minor_revision", "label": "小修", "color": "blue" },
          { "value": "major_revision", "label": "大修", "color": "orange" },
          { "value": "reject", "label": "拒稿", "color": "red" }
        ],
        "required": true
      },
      "confidential_comments": { 
        "type": "string", 
        "title": "保密意见",
        "format": "text",
        "description": "仅编辑可见（可选）"
      }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "submit_review",
          "description": "提交评审意见",
          "parameters": {
            "type": "object",
            "properties": {
              "review_content": { "type": "string" },
              "recommendation": { "type": "string" },
              "confidential_comments": { "type": "string" }
            },
            "required": ["review_content", "recommendation"]
          }
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/reviewer/reviews/review-001/submit"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "评审意见已提交", "level": "success" },
            { "type": "navigate", "target": "/reviewer/tasks" }
          ]
        }
      },
      {
        "type": "function",
        "function": {
          "name": "download_paper",
          "description": "下载论文",
          "parameters": {}
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "GET",
            "url": "/api/files/papers/paper-001.pdf"
          }
        }
      }
    ]
  }
}
```

### 5. 复合页面模拟

```json
// index.json - 首页（复合页面）
{
  "_schema": "@page",
  "sections": [
    {
      "_type": "nav",
      "title": "论文评审系统",
      "links": [
        { "title": "首页", "url": "/" },
        { "title": "编辑后台", "url": "/editor" },
        { "title": "专家后台", "url": "/reviewer" },
        { "title": "登录", "url": "/auth/login" }
      ]
    },
    {
      "_type": "hero",
      "title": "论文评审系统",
      "subtitle": "高效、专业、智能的学术评审平台",
      "description": "连接编辑与评审专家，简化论文评审流程",
      "actions": [
        { "title": "立即登录", "url": "/auth/login", "variant": "primary" },
        { "title": "注册账号", "url": "/auth/register", "variant": "secondary" }
      ]
    },
    {
      "_type": "stats",
      "items": [
        { "number": "10,000+", "label": "注册论文" },
        { "number": "500+", "label": "评审专家" },
        { "number": "98%", "label": "按时完成率" }
      ]
    },
    {
      "_type": "features",
      "title": "核心功能",
      "items": [
        {
          "icon": "📄",
          "title": "论文管理",
          "description": "便捷的论文提交、跟踪和管理系统",
          "link": { "title": "编辑后台 →", "url": "/editor" }
        },
        {
          "icon": "📋",
          "title": "智能评审",
          "description": "自动分配评审任务，实时跟踪评审进度",
          "link": { "title": "评审任务 →", "url": "/reviewer/tasks" }
        }
      ]
    },
    {
      "_type": "footer",
      "copyright": "© 2024 论文评审系统",
      "links": [
        { "title": "关于我们", "url": "/about" },
        { "title": "联系方式", "url": "/contact" }
      ]
    }
  ]
}
```

---

## 验证清单

### 功能验证

- [ ] 登录/注册流程
- [ ] 列表展示（表格/卡片/按钮）
- [ ] 详情展示（分组/嵌套）
- [ ] 表单创建/编辑
- [ ] Tool 执行（HTTP/Navigate）
- [ ] Action 处理（message/navigate/reload）
- [ ] 复合页面渲染
- [ ] 文件上传/下载
- [ ] 状态流转

### 角色验证

- [ ] 编辑视角（论文管理/分配评审）
- [ ] 专家视角（评审任务/提交意见）
- [ ] 游客视角（首页/登录）

### 协议验证

- [ ] Schema 类型识别
- [ ] Tool 定义完整性
- [ ] Action 执行正确性
- [ ] 错误处理

---

**许可:** MIT
