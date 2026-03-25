# AgierBro 模拟数据实施计划

**目标:** 用纯 JSON 模拟数据验证 App 机制完备性

---

## 实施步骤

### Step 1: 创建基础目录结构

```bash
cd agierBro-vue/public/api

# 创建目录
mkdir -p auth
mkdir -p editor/papers
mkdir -p editor/reviews
mkdir -p editor/reviewers
mkdir -p reviewer/tasks
mkdir -p reviewer/reviews
mkdir -p notifications
mkdir -p files/papers
mkdir -p avatars
```

### Step 2: 创建认证模块数据

#### 2.1 登录页

**文件:** `api/auth/login.json`

```json
{
  "username": "admin",
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
            "target": "/?role=editor"
          }
        }
      }
    ]
  }
}
```

**验证点:**
- [ ] 表单渲染正确
- [ ] 必填验证生效
- [ ] Tool 执行后跳转

#### 2.2 当前用户

**文件:** `api/auth/me.json`

```json
{
  "id": "editor-001",
  "username": "admin",
  "email": "admin@example.com",
  "role": "editor",
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
      }
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

**验证点:**
- [ ] 只读字段正确显示
- [ ] enum 字段显示为标签
- [ ] Tool 执行后刷新

---

### Step 3: 创建编辑后台数据

#### 3.1 论文列表页

**文件:** `api/editor/papers/index.json`

创建包含 3-5 篇论文的列表，验证：
- [ ] 表格布局（字段>4）
- [ ] 状态 enum 显示
- [ ] 点击跳转到详情
- [ ] Tool 按钮显示

#### 3.2 论文详情页

**文件:** `api/editor/papers/paper-001.json`

创建完整的论文详情，验证：
- [ ] 字段分组（基本信息/复杂字段）
- [ ] 嵌套对象显示（file）
- [ ] 数组显示（keywords）
- [ ] Tool 执行（分配评审）

---

### Step 4: 创建专家后台数据

#### 4.1 评审任务列表

**文件:** `api/reviewer/tasks/index.json`

验证：
- [ ] 卡片布局（字段 2-4）
- [ ] 状态显示
- [ ] 点击跳转

#### 4.2 评审详情页

**文件:** `api/reviewer/reviews/review-001.json`

验证：
- [ ] 富文本字段渲染
- [ ] 大段文本显示
- [ ] 表单编辑模式
- [ ] Tool 执行（提交评审）

---

### Step 5: 创建复合页面

#### 5.1 首页

**文件:** `api/index.json`

```json
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
        { "title": "立即登录", "url": "/auth/login", "variant": "primary" }
      ]
    }
  ]
}
```

验证：
- [ ] Section 渲染器工作
- [ ] 多个 Section 顺序显示
- [ ] 导航栏正确

---

### Step 6: 验证清单

#### 功能验证

| 功能 | 测试页面 | 验证项 | 状态 |
|-----|---------|--------|------|
| 表单渲染 | /auth/login | 输入框/密码框/必填验证 | [ ] |
| 列表渲染 | /editor/papers | 表格/卡片/按钮布局 | [ ] |
| 详情渲染 | /editor/papers/1 | 字段分组/嵌套对象 | [ ] |
| Tool 执行 | 所有页面 | HTTP/Navigate协议 | [ ] |
| Action 处理 | 所有页面 | message/navigate/reload | [ ] |
| 复合页面 | / | Section 渲染 | [ ] |
| enum 显示 | 所有页面 | 状态标签/颜色 | [ ] |
| 只读字段 | 详情页 | readOnly 生效 | [ ] |

#### 角色验证

| 角色 | 测试页面 | 验证项 | 状态 |
|-----|---------|--------|------|
| 编辑 | /editor/papers | 论文管理/分配评审 | [ ] |
| 专家 | /reviewer/tasks | 评审任务/提交意见 | [ ] |
| 游客 | / | 首页/登录 | [ ] |

#### 协议验证

| 协议特性 | 测试数据 | 验证项 | 状态 |
|---------|---------|--------|------|
| Schema 类型 | 所有页面 | @nav/@page/object | [ ] |
| Tool 定义 | 所有页面 | function/execution/response | [ ] |
| Action 类型 | 所有页面 | navigate/reload/message | [ ] |
| 字段约束 | 表单页 | required/format/enum | [ ] |

---

## 数据文件清单

### 必需文件

| 文件 | 用途 | 优先级 |
|-----|------|--------|
| `api/index.json` | 首页 | P0 |
| `api/auth/login.json` | 登录页 | P0 |
| `api/auth/me.json` | 当前用户 | P0 |
| `api/editor/papers/index.json` | 论文列表 | P0 |
| `api/editor/papers/paper-001.json` | 论文详情 | P0 |
| `api/reviewer/tasks/index.json` | 评审任务 | P0 |
| `api/reviewer/reviews/review-001.json` | 评审详情 | P0 |

### 可选文件

| 文件 | 用途 | 优先级 |
|-----|------|--------|
| `api/auth/register.json` | 注册页 | P1 |
| `api/notifications/index.json` | 通知列表 | P1 |
| `api/editor/reviewers/index.json` | 专家管理 | P2 |
| `api/editor/papers/new.json` | 创建论文 | P2 |

---

## 预期结果

### 验证通过的标志

1. **所有页面可访问**
   - 无 404 错误
   - 无 JS 错误

2. **所有功能可测试**
   - 表单可提交
   - Tool 可执行
   - Action 可处理

3. **所有角色可模拟**
   - 编辑功能正常
   - 专家功能正常
   - 游客功能正常

4. **协议完整验证**
   - Schema 类型识别正确
   - Tool 定义完整
   - Action 执行正确

---

## 常见问题

### Q1: 如何模拟不同用户登录？

**A:** 创建多个登录响应文件

```json
// api/auth/login-editor.json
{ "role": "editor", ... }

// api/auth/login-reviewer.json
{ "role": "reviewer", ... }
```

通过修改登录后的跳转 URL 模拟：
- `/auth/login?role=editor` → 编辑登录
- `/auth/login?role=reviewer` → 专家登录

### Q2: 如何模拟文件上传？

**A:** 使用预定义文件响应

```json
{
  "file": {
    "name": "paper.pdf",
    "size": 2048000,
    "url": "/files/papers/paper-001.pdf"
  }
}
```

上传操作模拟为：
```json
{
  "tools": [{
    "execution": {
      "protocol": "navigate",
      "navigate": { "target": "/editor/papers" }
    }
  }]
}
```

### Q3: 如何模拟权限控制？

**A:** 通过不同数据文件模拟

```
api/editor/  → 编辑看到的数据
api/reviewer/  → 专家看到的数据
```

编辑看不到专家的页面，专家看不到编辑的页面。

---

## 下一步

1. **创建基础数据** (1-2 天)
   - 认证模块
   - 编辑后台
   - 专家后台

2. **验证功能** (1 天)
   - 表单功能
   - Tool 执行
   - Action 处理

3. **完善数据** (1 天)
   - 添加更多示例
   - 优化数据结构

4. **文档记录** (持续)
   - 记录验证结果
   - 更新问题清单

---

**许可:** MIT
