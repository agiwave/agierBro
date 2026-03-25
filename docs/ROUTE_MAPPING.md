# AgierBro 路由映射验证

**日期:** 2026-03-24  
**状态:** ✅ 已验证

---

## 路由规则

```
/                           → /api/index.json
/:entity                    → /api/:entity/index.json
/:entity/:sub               → /api/:entity/:sub/index.json
/:entity/:sub/:id           → /api/:entity/:sub/:id.json
```

---

## 文件结构

```
public/api/
├── index.json                          # ← /
├── auth/
│   ├── login.json                      # ← /auth/login
│   ├── register.json                   # ← /auth/register
│   └── me.json                         # ← /auth/me
├── editor/
│   ├── index.json                      # ← /editor
│   ├── papers/
│   │   ├── index.json                  # ← /editor/papers
│   │   ├── new.json                    # ← /editor/papers/new
│   │   └── paper-001.json              # ← /editor/papers/paper-001
│   ├── reviewers/
│   │   └── index.json                  # ← /editor/reviewers
│   └── reviews/
│       └── index.json                  # ← /editor/reviews
├── reviewer/
│   ├── index.json                      # ← /reviewer
│   ├── tasks/
│   │   └── index.json                  # ← /reviewer/tasks
│   └── reviews/
│       └── review-001.json             # ← /reviewer/reviews/review-001
├── notifications/
│   └── index.json                      # ← /notifications
└── actions/
    ├── login.json                      # ← /actions/login
    └── ...
```

---

## 路由映射表

| URL | API 路径 | 文件 | 状态 |
|-----|---------|------|------|
| `/` | `/api/index.json` | ✅ |
| `/editor` | `/api/editor/index.json` | ✅ |
| `/editor/papers` | `/api/editor/papers/index.json` | ✅ |
| `/editor/papers/new` | `/api/editor/papers/new.json` | ✅ |
| `/editor/papers/paper-001` | `/api/editor/papers/paper-001.json` | ✅ |
| `/editor/reviewers` | `/api/editor/reviewers/index.json` | ✅ |
| `/editor/reviews` | `/api/editor/reviews/index.json` | ✅ |
| `/reviewer` | `/api/reviewer/index.json` | ✅ |
| `/reviewer/tasks` | `/api/reviewer/tasks/index.json` | ✅ |
| `/reviewer/reviews/review-001` | `/api/reviewer/reviews/review-001.json` | ✅ |
| `/notifications` | `/api/notifications/index.json` | ✅ |
| `/auth/login` | `/api/auth/login.json` | ✅ |
| `/auth/register` | `/api/auth/register.json` | ✅ |
| `/auth/me` | `/api/auth/me.json` | ✅ |

---

## 清理的文件

以下旧文件已删除：

| 文件 | 原因 |
|-----|------|
| `reviewer.json` | 与 `reviewer/index.json` 冲突 |
| `editor.json` | 与 `editor/index.json` 冲突 |
| `editor/papers.json` | 与 `editor/papers/index.json` 冲突 |
| `reviewer/tasks.json` | 与 `reviewer/tasks/index.json` 冲突 |
| `login.json`, `register.json` | 根目录旧文件 |
| `orders.json`, `users.json` | 根目录旧文件 |
| `tabs.json`, `tree.json` | 根目录旧文件 |
| `mock-*.json` | 测试文件 |

---

## 验证步骤

### 1. 访问首页
```
URL: http://localhost:3000/
API: /api/index.json
预期：显示复合页面（nav + hero + stats + features + cta + footer）
```

### 2. 访问编辑后台
```
URL: http://localhost:3000/editor
API: /api/editor/index.json
预期：显示 DashboardLayout（标题 + 统计 + 菜单）
```

### 3. 访问论文列表
```
URL: http://localhost:3000/editor/papers
API: /api/editor/papers/index.json
预期：显示表格布局的论文列表
```

### 4. 访问专家后台
```
URL: http://localhost:3000/reviewer
API: /api/reviewer/index.json
预期：显示 DashboardLayout（标题 + 统计 + 菜单）
```

### 5. 访问评审任务
```
URL: http://localhost:3000/reviewer/tasks
API: /api/reviewer/tasks/index.json
预期：显示卡片布局的任务列表
```

---

## 核心改进

### 之前（错误）
```
/:entity → /api/:entity.json
问题：与目录结构冲突
```

### 现在（正确）
```
/:entity → /api/:entity/index.json
优点：与目录结构一致，清晰明了
```

---

## 总结

### 清理成果

1. ✅ **删除冲突文件** - 11 个旧文件
2. ✅ **统一路由规则** - `/:entity` → `/api/:entity/index.json`
3. ✅ **简化代码** - 移除 fallback 机制

### 验证结果

```
✅ 构建成功 - 无编译错误
✅ 106 modules transformed
✅ built in 2.15s
```

---

**许可:** MIT
