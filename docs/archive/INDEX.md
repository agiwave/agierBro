# AgierBro 文档索引

**更新日期:** 2026-03-24

---

## 快速导航

| 我想... | 看这个 |
|--------|--------|
| 快速了解项目 | [README.md](../README.md) |
| 开始开发 | [docs/README.md](./README.md) |
| 实现完整网站 | [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) |
| 验证 App 机制 | [MOCK_IMPLEMENTATION.md](./MOCK_IMPLEMENTATION.md) |
| 查看协议规范 | [protocol/README.md](./protocol/README.md) |

---

## 核心文档

### 1. [README.md](./README.md) - 核心文档

**内容:**
- 快速开始
- 核心概念
- 协议规范
- 组件体系
- 开发指南
- 最佳实践
- 模拟数据验证

**适合:** 开发者快速上手

---

### 2. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - 实施计划

**内容:**
- 现状分析（已有能力/缺失能力）
- 核心功能实现方案
- 论文评审系统实现
- 实施路线图
- 关键代码示例

**适合:** 想要实现完整网站的开发者

**预计工时:** 4 周

---

### 3. [MOCK_IMPLEMENTATION.md](./MOCK_IMPLEMENTATION.md) - 模拟数据实施

**内容:**
- 实施步骤（6 步）
- 数据文件清单
- 验证清单
- 常见问题

**配套文档:**
- [MOCK_DATA_SPEC.md](./MOCK_DATA_SPEC.md) - 模拟数据规范
- [MOCK_DATA_STRUCTURE.md](./MOCK_DATA_STRUCTURE.md) - 模拟数据结构

**适合:** 想要验证 App 机制完备性的开发者

**预计工时:** 3-5 天

---

## 技术规范

### [protocol/README.md](./protocol/README.md) - 协议规范

**内容:**
- 数据结构
- Schema 定义
- Tool 定义
- Action 定义

**适合:** 后端开发者

---

### [specs/TOOL_SPEC.md](./specs/TOOL_SPEC.md) - Tool 规范

**内容:**
- Tool 定义
- Tool Call 机制
- 响应处理

**适合:** 后端开发者

---

## 归档文档

`archive/` 目录下是历史文档，包含设计过程和历次优化记录，供参考。

---

## 文档结构

```
docs/
├── README.md                    # 核心文档（必读）
├── IMPLEMENTATION_PLAN.md       # 实施计划（建站）
├── MOCK_IMPLEMENTATION.md       # 模拟数据实施（验证）
├── MOCK_DATA_SPEC.md            # 模拟数据规范
├── MOCK_DATA_STRUCTURE.md       # 模拟数据结构
├── GUIDE.md                     # 开发指南
├── IMPLEMENTATION_PLAN.md       # 实现完整网站
├── protocol/                    # 协议规范
│   └── README.md
├── specs/                       # 技术规范
│   ├── TOOL_CALL_DESIGN.md
│   └── TOOL_SPEC.md
└── archive/                     # 归档文档
    ├── DESIGN_ANALYSIS.md
    ├── DESIGN_REVIEW.md
    ├── DESIGN_SUMMARY.md
    ├── IMPLEMENTATION_REPORT.md
    ├── OPTIMIZATION_V3.md
    ├── SECTION_IMPLEMENTATION.md
    └── SECTION_MECHANISM.md
```

---

## 学习路径

### 初学者

1. [README.md](../README.md) - 了解项目
2. [docs/README.md](./README.md) - 学习核心概念
3. 运行示例项目

### 开发者

1. [docs/README.md](./README.md) - 核心文档
2. [protocol/README.md](./protocol/README.md) - 协议规范
3. [MOCK_IMPLEMENTATION.md](./MOCK_IMPLEMENTATION.md) - 模拟数据验证

### 项目实现

1. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - 实施计划
2. [MOCK_IMPLEMENTATION.md](./MOCK_IMPLEMENTATION.md) - 创建模拟数据
3. 按照计划逐步实现

---

## 文档维护

### 更新原则

- **核心文档** - 保持精简，只包含必要内容
- **技术文档** - 详细完整，包含所有细节
- **实施文档** - 实用导向，包含步骤和示例

### 文档整合

- 每 3 个月整合一次文档
- 归档历史文档
- 更新核心文档

---

**许可:** MIT
