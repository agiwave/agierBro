# AgierBro v6.0 示例数据验证报告

**日期:** 2026-03-29
**版本:** v6.0.0

---

## 📊 验证摘要

| 项目 | 数量 | 状态 |
|-----|------|------|
| 总文件数 | 40 | ✓ |
| 有效 v6.0 格式 | 40 | ✓ 100% |
| 数据展示文件 (in 为空) | 31 | ✓ |
| 表单输入文件 (in 有定义) | 9 | ✓ |
| 无效格式 | 0 | ✓ |
| 构建测试 | - | ✓ 通过 |
| 类型检查 | - | ✓ 通过 |

---

## 📁 文件分类

### 数据展示文件 (31 个)

这些文件的 `_schema.in` 为空，前端将以 **view 模式** 展示数据。

| 文件路径 | 说明 |
|---------|------|
| `index.json` | 首页 |
| `about.json` | 关于页面 |
| `auth.json` | 认证中心 |
| `auth/me.json` | 个人信息 |
| `users/index.json` | 用户列表 |
| `users/user-001/index.json` | 用户详情 |
| `users.json` | 用户管理（旧路径） |
| `editor.json` | 编辑后台 |
| `editor/papers.json` | 论文列表 |
| `editor/papers/paper-001.json` | 论文详情 |
| `editor/reviewers.json` | 专家列表 |
| `editor/reviews.json` | 评审列表 |
| `editor/submit.json` | 提交（数据） |
| `reviewer.json` | 专家后台 |
| `reviewer/tasks.json` | 评审任务列表 |
| `reviewer/review/TASK-001.json` | 评审任务详情 |
| `notifications.json` | 通知列表 |
| `notifications/list.json` | 通知列表（备用） |
| `orders/ORD-002.json` | 订单详情 |
| `orders/order-001/index.json` | 订单详情 |
| `orders/order-001/approve.json` | 批准订单（确认页） |
| `actions/approve-order.json` | 批准操作 |
| `actions/assign.json` | 分配操作 |
| `actions/login.json` | 登录操作 |
| `actions/register.json` | 注册操作 |
| `actions/reject-order.json` | 拒绝操作 |
| `actions/submit-order.json` | 提交操作 |
| `actions/submit-review.json` | 提交评审 |
| `actions/update-user.json` | 更新用户 |
| `test/buttons.json` | 测试按钮 |
| `test/tabs.json` | 测试标签页 |
| `test/tree.json` | 测试树形菜单 |

### 表单输入文件 (9 个)

这些文件的 `_schema.in` 包含输入参数定义，前端将以 **edit 模式** 呈现表单。

| 文件路径 | 输入参数 | 说明 |
|---------|---------|------|
| `auth/login.json` | username, password | 登录表单 |
| `auth/register.json` | username, email, password | 注册表单 |
| `users/create.json` | username, email, password, role | 创建用户表单 |
| `users/user-001/edit.json` | username, email, role, status | 编辑用户表单 |
| `editor/papers/new.json` | title, abstract, keywords | 提交论文表单 |
| `orders/ORD-001.json` | status, comment | 订单处理表单 |
| `orders/order-001/reject.json` | order_id, reason | 拒绝订单表单 |
| `reviewer/reviews/review-001.json` | review_content, recommendation | 论文评审表单 |

---

## ✅ 验证检查清单

### 1. Schema 格式检查

- [x] 所有文件包含 `_schema` 字段
- [x] 所有 `_schema` 包含 `in` 字段
- [x] 所有 `_schema` 包含 `out` 字段
- [x] 无旧格式残留（`type` 在根级）
- [x] 无旧格式 `tools` 在 schema 内

### 2. 数据展示文件检查

- [x] `in` 为空对象 `{}` 或无 `properties`
- [x] `out` 包含完整的 `properties` 定义
- [x] 包含实际业务数据

### 3. 表单输入文件检查

- [x] `in` 包含 `properties` 定义
- [x] `in.properties` 包含 `required` 字段
- [x] `out` 包含返回数据结构
- [x] 包含 `protocol` 和 `url` 字段（HTTP 工具）

### 4. 工具定义检查

- [x] `_tools` 数组在根级（不在 schema 内）
- [x] 工具包含 `name`, `displayName`, `description`
- [x] 工具包含 `protocol` 字段
- [x] Navigate 工具包含 `target`
- [x] HTTP 工具包含 `method` 和 `url`

### 5. 构建验证

- [x] TypeScript 类型检查通过
- [x] Vite 构建成功
- [x] 无编译错误
- [x] 无类型错误

---

## 📋 示例数据格式

### 数据展示格式

```json
{
  "id": "user-001",
  "username": "admin",
  "_schema": {
    "in": {},
    "out": {
      "type": "object",
      "title": "用户详情",
      "properties": {
        "id": { "type": "string", "title": "ID" },
        "username": { "type": "string", "title": "用户名" }
      }
    }
  },
  "_tools": [
    {
      "name": "edit",
      "displayName": "编辑",
      "protocol": "navigate",
      "target": "/users/user-001/edit"
    }
  ]
}
```

### 表单输入格式

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

---

## 🔄 已删除的冗余文件

| 文件 | 原因 |
|-----|------|
| `users/user-001.json` | 与 `users/user-001/index.json` 重复 |

---

## 🎯 前端行为验证

### 数据展示页面

| URL | 预期行为 | 文件 |
|-----|---------|------|
| `/` | 展示首页内容 | `index.json` |
| `/about` | 展示关于页面 | `about.json` |
| `/users` | 展示用户列表 | `users/index.json` |
| `/users/user-001` | 展示用户详情 | `users/user-001/index.json` |
| `/editor` | 展示编辑后台 | `editor.json` |

### 表单输入页面

| URL | 预期行为 | 文件 |
|-----|---------|------|
| `/auth/login` | 呈现登录表单 | `auth/login.json` |
| `/auth/register` | 呈现注册表单 | `auth/register.json` |
| `/users/create` | 呈现创建用户表单 | `users/create.json` |
| `/users/user-001/edit` | 呈现编辑用户表单 | `users/user-001/edit.json` |
| `/orders/order-001/reject` | 呈现拒绝订单表单 | `orders/order-001/reject.json` |

---

## 📝 建议与注意事项

### 1. URL 路径规范

所有资源路径应遵循：
- 资源集合：`/api/{resource}/index.json`
- 资源详情：`/api/{resource}/{id}/index.json`
- 资源操作：`/api/{resource}/{id}/{action}.json`

### 2. 工具定义规范

- 使用 `_tools` 数组定义后续可执行操作
- Navigate 工具使用 `target` 字段
- HTTP 工具使用 `method` 和 `url` 字段

### 3. 表单验证

- 必填字段使用 `required: true`
- 格式验证使用 `format` 字段（email, password, phone 等）
- 长度约束使用 `minLength` / `maxLength`

---

## ✅ 验证结论

**所有 40 个示例数据文件已成功转换为 v6.0 格式，符合以下标准：**

1. ✓ 100% 文件包含有效的 `_schema.in` 和 `_schema.out`
2. ✓ 数据展示文件 `in` 为空
3. ✓ 表单输入文件 `in` 包含完整属性定义
4. ✓ 所有工具定义迁移到 `_tools` 数组
5. ✓ 构建和类型检查通过
6. ✓ 无旧格式残留

**项目已准备好进行功能测试！**

---

**报告生成时间:** 2026-03-29
**验证工具:** Python 3.x + 自定义检查脚本
