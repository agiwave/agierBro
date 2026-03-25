# 文档整理报告

**日期:** 2026-03-24  
**范围:** docs/specs/ 目录

---

## 整理前状态

### 文件列表（6 个）

| 文件 | 状态 | 问题 |
|-----|------|------|
| README.md | 简单索引 | 内容过少 |
| SCHEMA_SPEC.md | 正式规范 | 包含过时内容 |
| SCHEMA_DESIGN.md | 设计文档 | 与 SCHEMA_SPEC 重复 |
| SEMANTIC_TYPE_DESIGN.md | 设计方案 | 已过时（使用 @前缀） |
| TOOL_SPEC.md | 正式规范 | 包含过时内容 |
| TOOL_CALL_DESIGN.md | 设计文档 | 与 TOOL_SPEC 重复 |

### 主要问题

1. **内容重复** - SCHEMA_SPEC 和 SCHEMA_DESIGN 内容重叠
2. **设计过时** - SEMANTIC_TYPE_DESIGN 使用旧的 @前缀设计
3. **规范分散** - Tool 相关内容分散在 TOOL_SPEC 和 TOOL_CALL_DESIGN

---

## 整理后状态

### 文件列表（3 个）

| 文件 | 说明 | 状态 |
|-----|------|------|
| README.md | 规范索引 | ✅ 新建 |
| SCHEMA_SPEC.md | Schema 规范（统一） | ✅ 更新 |
| TOOL_SPEC.md | Tool 规范（统一） | ✅ 更新 |

### 归档文件（4 个）

已移动到 `docs/archive/`:

| 文件 | 原因 |
|-----|------|
| SCHEMA_DESIGN.md | 与 SCHEMA_SPEC 重复 |
| SEMANTIC_TYPE_DESIGN.md | 设计过时（@前缀） |
| TOOL_CALL_DESIGN.md | 与 TOOL_SPEC 重复 |
| README.md (旧) | 内容过少 |

---

## 核心改进

### 1. Schema 规范统一

**之前:**
- SCHEMA_SPEC.md - 544 行，包含 Schema 引用规则等过时内容
- SCHEMA_DESIGN.md - 520 行，重复描述 Schema 结构

**现在:**
- SCHEMA_SPEC.md - 精简为统一规范，聚焦核心内容
  - Schema 结构
  - 语义类型
  - 使用示例
  - 渲染决策
  - 最佳实践

### 2. Tool 规范统一

**之前:**
- TOOL_SPEC.md - 354 行，包含旧版 Tool 结构
- TOOL_CALL_DESIGN.md - 345 行，重复描述 Tool Call 流程

**现在:**
- TOOL_SPEC.md - 精简为统一规范
  - Tool 结构（简化版）
  - Action 类型
  - 使用示例
  - 执行流程
  - 最佳实践

### 3. 语义类型更新

**之前:**
```typescript
// 旧设计（有过时前缀）
type BuiltinSchema = '@nav' | '@tree' | '@tabs'
type SemanticType = 'hero' | 'stats' | 'features'
```

**现在:**
```typescript
// 新设计（统一平级）
type SemanticType =
  | 'nav' | 'tree' | 'tabs'
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
  // ...
```

---

## 文档结构

### 整理前

```
docs/specs/
├── README.md                 # 简单索引
├── SCHEMA_SPEC.md            # 544 行
├── SCHEMA_DESIGN.md          # 520 行（重复）
├── SEMANTIC_TYPE_DESIGN.md   # 318 行（过时）
├── TOOL_SPEC.md              # 354 行
├── TOOL_CALL_DESIGN.md       # 345 行（重复）
└── ...
```

### 整理后

```
docs/specs/
├── README.md                 # 新建索引
├── SCHEMA_SPEC.md            # 统一规范
├── TOOL_SPEC.md              # 统一规范
└── archive/                  # 归档文档
    ├── SCHEMA_DESIGN.md
    ├── SEMANTIC_TYPE_DESIGN.md
    ├── TOOL_CALL_DESIGN.md
    └── README.md (旧)
```

---

## 内容对比

### SCHEMA_SPEC.md

| 章节 | 之前 | 现在 | 改进 |
|-----|------|------|------|
| 概述 | ✅ | ✅ | 简化 |
| Schema 引用规则 | ✅ | ❌ | 删除（过时） |
| Schema 结构 | ✅ | ✅ | 精简 |
| 语义类型 | ⚠️ | ✅ | 更新为 v4.1 |
| 使用示例 | ✅ | ✅ | 优化 |
| 渲染决策 | ❌ | ✅ | 新增 |
| 最佳实践 | ❌ | ✅ | 新增 |
| 与 Tool 关系 | ❌ | ✅ | 新增 |

### TOOL_SPEC.md

| 章节 | 之前 | 现在 | 改进 |
|-----|------|------|------|
| 概述 | ✅ | ✅ | 简化 |
| Tool 结构 | ✅ | ✅ | 简化（删除嵌套） |
| Action | ✅ | ✅ | 更新（添加 message） |
| 使用示例 | ✅ | ✅ | 优化 |
| Tool Call 流程 | ✅ | ✅ | 简化 |
| 最佳实践 | ❌ | ✅ | 新增 |

---

## 关键变更

### 1. Tool 结构简化

**之前（嵌套 3 层）:**
```typescript
interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters?: Schema
  }
  execution: {
    protocol: 'http' | 'mcp' | 'navigate'
    http?: { method: string; url: string }
    navigate?: { target: string }
  }
  response?: {
    onSuccess?: Action[]
    onError?: Action[]
  }
}
```

**现在（扁平结构）:**
```typescript
interface Tool {
  name: string
  description: string
  parameters?: Schema
  protocol: 'http' | 'mcp' | 'navigate'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string
  onSuccess?: Action[]
  onError?: Action[]
}
```

### 2. Action 类型扩展

**之前:**
```typescript
type ActionType = 'navigate' | 'reload' | 'back' | 'custom'
```

**现在:**
```typescript
type ActionType = 'navigate' | 'reload' | 'back' | 'message' | 'custom'
```

**新增:** `message` 类型，用于显示消息提示

### 3. 语义类型统一

**之前:**
```typescript
// 分离设计
type BuiltinSchema = '@nav' | '@tree' | '@tabs'
type SemanticType = 'hero' | 'stats' | 'features'
```

**现在:**
```typescript
// 统一设计
type SemanticType =
  | 'nav' | 'tree' | 'tabs'
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
  // ...
```

---

## 文档质量提升

### 精简内容

| 指标 | 之前 | 现在 | 改进 |
|-----|------|------|------|
| 文件数 | 6 个 | 3 个 | -50% |
| 总行数 | ~2100 行 | ~600 行 | -71% |
| 重复内容 | 多处 | 无 | ✅ |
| 过时内容 | 有 | 无 | ✅ |

### 提升方面

1. **结构清晰** - 每个规范一个文件
2. **内容精简** - 删除冗余和过时内容
3. **设计统一** - 语义类型统一为平级
4. **易于维护** - 规范集中，易于查找和更新

---

## 使用指南

### 开发者

1. **查看规范** - 阅读 `SCHEMA_SPEC.md` 和 `TOOL_SPEC.md`
2. **理解语义** - 了解语义类型的使用
3. **参考示例** - 按照示例编写 API 数据

### API 开发者

1. **遵循规范** - 按照 Schema 和 Tool 规范定义 API
2. **使用语义** - 为数据和字段添加 semantic 类型
3. **定义操作** - 在 Schema 的 tools 字段中定义 Tool

### 前端开发者

1. **理解渲染** - 根据 semantic 类型选择渲染组件
2. **执行 Tool** - 按照 Tool 规范执行操作
3. **处理 Action** - 根据 Action 类型执行相应操作

---

## 总结

### 整理成果

1. ✅ **删除重复** - 合并 SCHEMA_SPEC 和 SCHEMA_DESIGN
2. ✅ **更新设计** - 语义类型统一为平级
3. ✅ **简化结构** - Tool 结构从 3 层简化为扁平
4. ✅ **新增内容** - 添加最佳实践、渲染决策等

### 文档质量

- ✅ **简洁** - 内容精简 71%
- ✅ **清晰** - 结构清晰，易于理解
- ✅ **统一** - 设计规范统一
- ✅ **易维护** - 文件少，易于更新

---

**许可:** MIT
