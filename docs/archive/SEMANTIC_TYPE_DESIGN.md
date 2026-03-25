# Semantic Type 设计方案

**日期:** 2026-03-24  
**核心:** 使用 Semantic Type 标识数据用途，前端选择渲染方式

---

## 设计原则

### 1. Schema 定义结构

```typescript
interface Schema {
  type: 'object' | 'array'
  title?: string
  properties: Record<string, Field>
  semantic?: SemanticType  // ← 语义类型标识
}
```

### 2. Semantic Type 标识用途

```typescript
type SemanticType =
  // 页面区块
  | 'hero'        // Hero 区域
  | 'stats'       // 统计数据
  | 'features'    // 功能列表
  | 'cta'         // 行动号召
  | 'footer'      // 页脚
  
  // 字段语义
  | 'title'       // 标题
  | 'status'      // 状态
  | 'amount'      // 金额
  | 'email'       // 邮箱
  // ...
```

### 3. 特殊交互预定义

```typescript
type BuiltinSchema = 
  | '@nav'   // 导航（链接跳转）
  | '@tree'  // 树形（节点展开）
  | '@tabs'  // 标签（内容切换）
```

**为什么这些预定义？**
- 交互逻辑固定
- UI 模式固定
- 无业务含义

---

## 数据结构示例

```json
{
  "items": [
    {
      "_schema": "@nav",  // 预定义类型（特殊交互）
      "links": [...]
    },
    {
      "_schema": {
        "type": "object",
        "semantic": "hero"  // 语义类型（渲染提示）
      },
      "title": "...",
      "actions": [...]
    },
    {
      "_schema": {
        "type": "object",
        "semantic": "stats"
      },
      "items": [...]
    }
  ]
}
```

---

## 渲染决策树

```
数据加载
    ↓
判断 _schema 是否为内置类型
    ├── @nav → NavLayout (特殊交互)
    ├── @tree → TreeLayout
    ├── @tabs → TabsLayout
    └── object → 继续判断
        ↓
    查看 semantic 类型
        ├── hero → HeroSection
        ├── stats → StatsSection
        ├── features → FeaturesSection
        ├── cta → CtaSection
        ├── footer → FooterSection
        └── 无/其他 → SectionBlock (通用渲染)
```

---

## 组件体系

### 特殊交互组件（3 个）

| 组件 | Schema | 交互 |
|-----|--------|------|
| NavLayout | `@nav` | 链接跳转 |
| TreeLayout | `@tree` | 节点展开 |
| TabsLayout | `@tabs` | 标签切换 |

### 语义 Section 组件（5 个）

| 组件 | Semantic | 用途 |
|-----|----------|------|
| HeroSection | `hero` | Hero 区域 |
| StatsSection | `stats` | 统计数据 |
| FeaturesSection | `features` | 功能列表 |
| CtaSection | `cta` | 行动号召 |
| FooterSection | `footer` | 页脚 |

### 通用组件（2 个）

| 组件 | 用途 |
|-----|------|
| SectionBlock | 通用区块渲染（Schema 驱动） |
| ListRenderer | 列表渲染（自动布局） |
| SchemaRenderer | 详情/表单渲染 |

---

## 优势对比

### 之前（错误）

```json
{
  "_type": "hero"  // 硬编码类型
}
```

**问题：**
- `_type` 不是标准字段
- 无法在 Schema 中定义结构
- 结构与类型分离

### 现在（正确）

```json
{
  "_schema": {
    "type": "object",
    "semantic": "hero",  // 标准 Schema 字段
    "properties": {...}  // 结构定义
  }
}
```

**优点：**
- `semantic` 是 Schema 标准字段
- 结构和语义在一起
- 可扩展（添加新 semantic 类型）

---

## 字段级 Semantic

Semantic 不仅用于区块，也用于字段：

```json
{
  "_schema": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "semantic": "email",  // 字段语义
        "format": "email"
      },
      "status": {
        "type": "string",
        "semantic": "status"  // 状态字段
      },
      "amount": {
        "type": "number",
        "semantic": "amount"  // 金额字段
      }
    }
  }
}
```

**前端可根据字段语义优化渲染：**
- `email` → 邮件链接
- `status` → 状态标签
- `amount` → 货币格式化

---

## 扩展性

### 添加新语义类型

1. **定义 Semantic Type**

```typescript
type SemanticType = 
  | 'hero'
  | 'testimonial'  // 新增：用户评价
  | 'faq'          // 新增：常见问题
```

2. **创建 Section 组件**

```vue
<!-- TestimonialSection.vue -->
<template>
  <section class="section section-testimonial">
    <!-- 渲染逻辑 -->
  </section>
</template>
```

3. **更新 SectionRenderer**

```typescript
<TestimonialSection v-else-if="semanticType === 'testimonial'" :data="data" />
```

**无需修改现有代码！**

---

## 验证结果

### 构建状态

```
✅ 构建成功 - 无编译错误
✅ 类型检查通过 - TypeScript 无错误
✅ 103 modules transformed
✅ built in 2.09s
```

### 文件统计

| 类别 | 数量 |
|-----|------|
| 特殊交互组件 | 3 个 |
| 语义 Section 组件 | 5 个 |
| 通用组件 | 3 个 |
| **总计** | **11 个** |

### CSS 大小

| 指标 | 大小 |
|-----|------|
| 总 CSS | 19.54 KB |
| Gzip 后 | 3.84 KB |

---

## 核心思想

> **Schema 定义结构，Semantic Type 标识用途，前端选择渲染**

### 三层设计

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Builtin Schema (特殊交互)                          │
│ - @nav, @tree, @tabs                                        │
│ - 前端特殊处理                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Semantic Type (渲染提示)                           │
│ - hero, stats, features, cta, footer                        │
│ - 前端选择 Section 组件                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Schema Structure (结构定义)                        │
│ - type, properties, order                                   │
│ - 通用 SchemaRenderer 渲染                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 总结

### 设计成果

1. ✅ **Semantic Type** - 标准化语义标识
2. ✅ **特殊交互预定义** - @nav/@tree/@tabs
3. ✅ **通用区块渲染** - SectionBlock + SchemaRenderer
4. ✅ **字段级语义** - 支持字段语义优化

### 核心优势

- ✅ 结构清晰 - Schema 定义结构，Semantic 标识用途
- ✅ 易于扩展 - 添加新 semantic 类型即可
- ✅ 向后兼容 - 不影响现有功能
- ✅ 字段级优化 - 支持字段语义渲染

---

**许可:** MIT
