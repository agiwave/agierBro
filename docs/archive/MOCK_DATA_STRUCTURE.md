# AgierBro 完整模拟数据结构

**目标:** 用 JSON 数据模拟完整的论文评审系统

---

## 用户认证模块

### /api/auth/login.json

```json
{
  "username": "",
  "password": "",
  "_schema": {
    "type": "object",
    "title": "登录",
    "description": "使用账号密码登录系统",
    "properties": {
      "username": { 
        "type": "string", 
        "title": "用户名", 
        "required": true,
        "placeholder": "请输入用户名"
      },
      "password": { 
        "type": "string", 
        "title": "密码", 
        "format": "password",
        "required": true,
        "placeholder": "请输入密码"
      }
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
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/auth/login"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "navigate", "target": "/" },
            { "type": "reload" }
          ],
          "onError": [
            { "type": "message", "message": "用户名或密码错误", "level": "error" }
          ]
        }
      }
    ]
  }
}
```

### /api/auth/register.json

```json
{
  "username": "",
  "email": "",
  "password": "",
  "confirm_password": "",
  "affiliation": "",
  "_schema": {
    "type": "object",
    "title": "注册账号",
    "description": "创建新账号",
    "properties": {
      "username": { 
        "type": "string", 
        "title": "用户名", 
        "required": true,
        "minLength": 3,
        "maxLength": 20
      },
      "email": { 
        "type": "string", 
        "title": "邮箱", 
        "format": "email",
        "required": true
      },
      "password": { 
        "type": "string", 
        "title": "密码", 
        "format": "password",
        "required": true,
        "minLength": 6
      },
      "confirm_password": { 
        "type": "string", 
        "title": "确认密码", 
        "format": "password",
        "required": true
      },
      "affiliation": { 
        "type": "string", 
        "title": "所在单位", 
        "required": true
      }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "register",
          "description": "注册新账号",
          "parameters": {
            "type": "object",
            "properties": {
              "username": { "type": "string" },
              "email": { "type": "string" },
              "password": { "type": "string" },
              "confirm_password": { "type": "string" },
              "affiliation": { "type": "string" }
            },
            "required": ["username", "email", "password", "affiliation"]
          }
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/auth/register"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "注册成功，请登录", "level": "success" },
            { "type": "navigate", "target": "/auth/login" }
          ]
        }
      }
    ]
  }
}
```

### /api/auth/me.json

```json
{
  "id": "editor-001",
  "username": "admin",
  "email": "admin@example.com",
  "role": "editor",
  "avatar": "/avatars/admin.png",
  "affiliation": "XX 大学",
  "created_at": "2024-01-01T00:00:00Z",
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
      "avatar": { "type": "string", "title": "头像", "readOnly": true },
      "affiliation": { "type": "string", "title": "所在单位", "readOnly": true },
      "created_at": { "type": "string", "format": "date-time", "title": "注册时间", "readOnly": true }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "logout",
          "description": "退出登录",
          "parameters": {}
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/auth/logout"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "navigate", "target": "/auth/login" },
            { "type": "reload" }
          ]
        }
      },
      {
        "type": "function",
        "function": {
          "name": "edit_profile",
          "description": "编辑资料",
          "parameters": {
            "type": "object",
            "properties": {
              "email": { "type": "string" },
              "affiliation": { "type": "string" }
            }
          }
        },
        "execution": {
          "protocol": "navigate",
          "navigate": {
            "target": "/auth/profile/edit"
          }
        }
      }
    ]
  }
}
```

---

## 编辑后台模块

### /api/editor/papers/index.json

```json
{
  "items": [
    {
      "id": "paper-001",
      "title": "基于深度学习的图像识别研究",
      "author": "张三",
      "author_email": "zhangsan@example.com",
      "status": "pending_review",
      "submitted_at": "2024-03-20",
      "reviewer": null
    },
    {
      "id": "paper-002",
      "title": "自然语言处理中的注意力机制研究",
      "author": "李四",
      "author_email": "lisi@example.com",
      "status": "reviewing",
      "submitted_at": "2024-03-18",
      "reviewer": "王五"
    },
    {
      "id": "paper-003",
      "title": "强化学习在机器人控制中的应用",
      "author": "王五",
      "author_email": "wangwu@example.com",
      "status": "reviewed",
      "submitted_at": "2024-03-10",
      "reviewer": "赵六"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "size": 10
  },
  "_schema": {
    "type": "object",
    "title": "论文管理",
    "description": "管理所有投稿论文",
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
            "author_email": { "type": "string", "title": "邮箱" },
            "status": { 
              "type": "string", 
              "title": "状态",
              "enum": [
                { "value": "pending_review", "label": "待分配" },
                { "value": "reviewing", "label": "评审中" },
                { "value": "reviewed", "label": "已评审" }
              ]
            },
            "submitted_at": { "type": "string", "title": "提交时间" },
            "reviewer": { "type": "string", "title": "评审专家" }
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

### /api/editor/papers/:id.json

```json
{
  "id": "paper-001",
  "title": "基于深度学习的图像识别研究",
  "abstract": "本文提出了一种新的基于深度学习的图像识别方法...",
  "keywords": ["深度学习", "图像识别", "CNN", "注意力机制"],
  "author_name": "张三",
  "author_email": "zhangsan@example.com",
  "author_affiliation": "XX 大学计算机学院",
  "status": "pending_review",
  "submitted_at": "2024-03-20T10:00:00Z",
  "file": {
    "name": "paper.pdf",
    "size": 2048000,
    "url": "/files/papers/paper-001.pdf"
  },
  "reviewer": null,
  "reviews": [],
  "_schema": {
    "type": "object",
    "title": "论文详情",
    "order": ["id", "title", "abstract", "keywords", "author_name", "author_email", "author_affiliation", "status", "file", "reviewer", "reviews"],
    "properties": {
      "id": { "type": "string", "title": "编号", "readOnly": true },
      "title": { "type": "string", "title": "标题", "readOnly": true },
      "abstract": { "type": "string", "title": "摘要", "readOnly": true },
      "keywords": { "type": "array", "title": "关键词", "items": { "type": "string" }, "readOnly": true },
      "author_name": { "type": "string", "title": "作者", "readOnly": true },
      "author_email": { "type": "string", "title": "邮箱", "readOnly": true },
      "author_affiliation": { "type": "string", "title": "单位", "readOnly": true },
      "status": { "type": "string", "title": "状态", "readOnly": true },
      "submitted_at": { "type": "string", "format": "date-time", "title": "提交时间", "readOnly": true },
      "file": { 
        "type": "object", 
        "title": "论文附件",
        "readOnly": true,
        "properties": {
          "name": { "type": "string", "title": "文件名" },
          "size": { "type": "number", "title": "文件大小" },
          "url": { "type": "string", "title": "下载链接" }
        }
      },
      "reviewer": { "type": "string", "title": "评审专家", "readOnly": true },
      "reviews": {
        "type": "array",
        "title": "评审意见",
        "items": {
          "type": "object",
          "properties": {
            "reviewer": { "type": "string" },
            "content": { "type": "string" },
            "recommendation": { "type": "string" },
            "created_at": { "type": "string" }
          }
        }
      }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "assign_reviewer",
          "description": "分配评审专家",
          "parameters": {
            "type": "object",
            "properties": {
              "reviewer_id": { 
                "type": "string", 
                "title": "评审专家",
                "enum": [
                  { "value": "reviewer-001", "label": "王五 (XX 大学)" },
                  { "value": "reviewer-002", "label": "赵六 (YY 研究所)" }
                ]
              }
            },
            "required": ["reviewer_id"]
          }
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/editor/papers/paper-001/assign"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "分配成功", "level": "success" },
            { "type": "reload" }
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

---

## 专家后台模块

### /api/reviewer/tasks/index.json

```json
{
  "items": [
    {
      "id": "review-001",
      "paper_id": "paper-001",
      "paper_title": "基于深度学习的图像识别研究",
      "paper_author": "张三",
      "status": "pending",
      "assigned_at": "2024-03-21",
      "due_date": "2024-04-04"
    },
    {
      "id": "review-002",
      "paper_id": "paper-004",
      "paper_title": "机器学习在金融风控中的应用",
      "paper_author": "陈七",
      "status": "submitted",
      "assigned_at": "2024-03-15",
      "due_date": "2024-03-29",
      "submitted_at": "2024-03-20"
    }
  ],
  "_schema": {
    "type": "object",
    "title": "评审任务",
    "description": "我的评审任务列表",
    "properties": {
      "items": {
        "type": "array",
        "title": "任务列表",
        "items": {
          "type": "object",
          "_address": "/reviewer/reviews/{id}.json",
          "properties": {
            "id": { "type": "string", "title": "任务编号" },
            "paper_title": { "type": "string", "title": "论文标题" },
            "paper_author": { "type": "string", "title": "作者" },
            "status": { 
              "type": "string", 
              "title": "状态",
              "enum": [
                { "value": "pending", "label": "待评审" },
                { "value": "submitted", "label": "已提交" }
              ]
            },
            "assigned_at": { "type": "string", "title": "分配时间" },
            "due_date": { "type": "string", "title": "截止日期" }
          }
        }
      }
    }
  }
}
```

### /api/reviewer/reviews/:id.json

```json
{
  "id": "review-001",
  "paper_id": "paper-001",
  "paper_title": "基于深度学习的图像识别研究",
  "paper_author": "张三",
  "paper_abstract": "本文提出了一种新的基于深度学习的图像识别方法...",
  "status": "pending",
  "assigned_at": "2024-03-21T09:00:00Z",
  "due_date": "2024-04-04T23:59:59Z",
  "review_content": "",
  "recommendation": "",
  "confidential_comments": "",
  "_schema": {
    "type": "object",
    "title": "论文评审",
    "description": "请仔细阅读论文并填写评审意见",
    "order": ["paper_title", "paper_author", "paper_abstract", "status", "due_date", "review_content", "recommendation", "confidential_comments"],
    "properties": {
      "id": { "type": "string", "title": "评审编号", "readOnly": true },
      "paper_id": { "type": "string", "title": "论文 ID", "readOnly": true },
      "paper_title": { "type": "string", "title": "论文标题", "readOnly": true },
      "paper_author": { "type": "string", "title": "作者", "readOnly": true },
      "paper_abstract": { "type": "string", "title": "摘要", "readOnly": true },
      "status": { 
        "type": "string", 
        "title": "评审状态",
        "enum": [
          { "value": "pending", "label": "待评审" },
          { "value": "submitted", "label": "已提交" }
        ],
        "readOnly": true 
      },
      "assigned_at": { "type": "string", "format": "date-time", "title": "分配时间", "readOnly": true },
      "due_date": { "type": "string", "format": "date-time", "title": "截止日期", "readOnly": true },
      "review_content": { 
        "type": "string", 
        "title": "评审意见", 
        "format": "rich-text",
        "required": true,
        "description": "请详细说明论文的优缺点、创新性和不足"
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
          ],
          "onError": [
            { "type": "message", "message": "提交失败", "level": "error" }
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

---

## 通知模块

### /api/notifications/index.json

```json
{
  "items": [
    {
      "id": "notif-001",
      "title": "新评审任务",
      "content": "您有一篇新的论文需要评审：《基于深度学习的图像识别研究》",
      "type": "task",
      "read": false,
      "created_at": "2024-03-21T09:00:00Z",
      "link": "/reviewer/tasks"
    },
    {
      "id": "notif-002",
      "title": "评审截止日期提醒",
      "content": "您评审的《机器学习在金融风控中的应用》将于 3 天后截止",
      "type": "reminder",
      "read": false,
      "created_at": "2024-03-24T09:00:00Z",
      "link": "/reviewer/reviews/review-002"
    },
    {
      "id": "notif-003",
      "title": "系统维护通知",
      "content": "系统将于本周末进行维护升级，届时可能无法访问",
      "type": "system",
      "read": true,
      "created_at": "2024-03-20T09:00:00Z",
      "link": null
    }
  ],
  "_schema": {
    "type": "object",
    "title": "我的通知",
    "properties": {
      "items": {
        "type": "array",
        "title": "通知列表",
        "items": {
          "type": "object",
          "_address": "/notifications/{id}.json",
          "properties": {
            "id": { "type": "string", "title": "编号" },
            "title": { "type": "string", "title": "标题" },
            "content": { "type": "string", "title": "内容" },
            "type": { 
              "type": "string",
              "enum": [
                { "value": "task", "label": "任务" },
                { "value": "reminder", "label": "提醒" },
                { "value": "system", "label": "系统" }
              ]
            },
            "read": { "type": "boolean", "title": "已读" },
            "created_at": { "type": "string", "format": "date-time", "title": "时间" }
          }
        }
      }
    },
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "mark_all_read",
          "description": "标记全部为已读",
          "parameters": {}
        },
        "execution": {
          "protocol": "http",
          "http": {
            "method": "POST",
            "url": "/api/notifications/mark-all-read"
          }
        },
        "response": {
          "onSuccess": [
            { "type": "message", "message": "已标记全部为已读", "level": "success" },
            { "type": "reload" }
          ]
        }
      }
    ]
  }
}
```

---

## 验证清单

### 页面类型验证

- [ ] 登录页（表单）
- [ ] 注册页（表单）
- [ ] 列表页（表格布局）
- [ ] 详情页（分组展示）
- [ ] 复合页（Section 组成）
- [ ] 通知页（列表 + 操作）

### 功能验证

- [ ] 表单提交
- [ ] Tool 执行
- [ ] Action 处理
- [ ] 状态展示
- [ ] 权限控制（通过不同数据模拟）
- [ ] 文件下载

### 角色验证

- [ ] 编辑视角
- [ ] 专家视角
- [ ] 游客视角

---

**许可:** MIT
