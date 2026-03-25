# AgierBro 规范文档

**版本:** 1.0.0  
**最后更新:** 2024-03-18

---

## 核心规范

### 1. Schema 规范

**文档:** [SCHEMA_SPEC.md](./SCHEMA_SPEC.md)

**说明:** 定义数据对象的结构、约束和渲染规则。

**核心内容:**
- Schema 结构
- 字段定义（类型、约束、可见性）
- 地址规则（`_address`）
- 枚举定义
- 语义标签
- 验证规则

**示例:**
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "title": "ID", "visible": false },
    "name": { "type": "string", "title": "名称" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "_address": "/orders/items/{id}.json"
      }
    }
  }
}
```

### 2. Tool Metadata 规范

**文档:** [TOOL_METADATA_SPEC.md](./TOOL_METADATA_SPEC.md)

**说明:** 定义工具（操作）的执行方式和结果处理规则。

**核心内容:**
- Tool 结构
- HTTP 配置（方法、URL、占位符）
- UI 配置（按钮样式、确认提示）
- 动作定义（navigate/reload/message/close/reset）
- 响应格式
- 错误处理

**示例:**
```json
{
  "name": "submit",
  "metadata": {
    "http": { "method": "POST", "url": "/api/orders/{id}/submit" },
    "ui": { "variant": "primary", "label": "提交", "confirm": "确认提交吗？" },
    "onSuccess": [
      { "type": "message", "message": "提交成功", "level": "success" },
      { "type": "navigate", "target": "/orders" }
    ]
  }
}
```

---

## 设计文档

### SCHEMA_DESIGN.md

**说明:** Schema 设计思想和架构原则。

**核心内容:**
- 设计理念
- 架构分层
- 数据模型

### TOOL_CALL_DESIGN.md

**说明:** Tool Call 机制设计。

**核心内容:**
- Tool Call 流程
- 与 LLM Tool 的兼容性
- 执行机制

---

## 规范索引

| 规范 | 版本 | 状态 | 日期 |
|-----|------|------|------|
| [SCHEMA_SPEC](./SCHEMA_SPEC.md) | 1.0.0 | ✅ 正式 | 2024-03-18 |
| [TOOL_METADATA_SPEC](./TOOL_METADATA_SPEC.md) | 1.0.0 | ✅ 正式 | 2024-03-18 |

---

## 快速开始

### 定义 Schema

```json
{
  "type": "object",
  "title": "订单",
  "properties": {
    "id": { "type": "string", "title": "订单编号" },
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
      "name": "submit",
      "metadata": {
        "http": { "method": "POST", "url": "/api/orders/{id}/submit" },
        "onSuccess": [
          { "type": "message", "message": "提交成功", "level": "success" }
        ]
      }
    }
  ]
}
```

### 定义 Tool

参考 [TOOL_METADATA_SPEC.md](./TOOL_METADATA_SPEC.md)

---

## 版本管理

### 规范版本

| 版本 | 日期 | 变更 |
|-----|------|------|
| 1.0.0 | 2024-03-18 | 初始版本 |

### 兼容性

- 主版本号变更：不向后兼容
- 次版本号变更：向后兼容新增功能
- 修订号变更：向后兼容问题修正

---

## 反馈和贡献

如有问题或建议，请通过以下方式反馈：

- GitHub Issues: https://github.com/agiwave/agierBro/issues
- 讨论区：https://github.com/agiwave/agierBro/discussions

---

**最后更新:** 2024-03-18  
**维护者:** AgierBro Team
