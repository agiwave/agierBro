# AgierBro 文档中心

**版本:** 4.0  
**最后更新:** 2026-03-24

---

## 核心文档

| 文档 | 说明 | 适合 |
|-----|------|------|
| [DESIGN.md](./DESIGN.md) | 📘 **完整设计文档** - 统一语义类型，所有类型平级 | 所有开发者 ⭐ |
| [README.md](../README.md) | 🏠 **项目首页** - 快速开始 + 核心思想 | 初学者 |

---

## 技术规范

| 文档 | 说明 | 适合 |
|-----|------|------|
| [../agierBro-vue/src/specs/SEMANTIC_TYPE.md](../agierBro-vue/src/specs/SEMANTIC_TYPE.md) | 📝 **语义类型规范** - 统一语义类型定义 | 开发者 |

---

## 实施文档

| 文档 | 说明 | 适合 |
|-----|------|------|
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | ✅ **实施总结** - 完整模拟网站实施成果 | 项目实现 |

---

## 文档结构

```
docs/
├── README.md                        # 文档中心索引
├── DESIGN.md                        # 完整设计文档（主）⭐
├── IMPLEMENTATION_SUMMARY.md        # 实施总结
├── specs/                           # 技术规范
│   └── SEMANTIC_TYPE.md             # 语义类型规范
└── archive/                         # 归档文档（历史参考）
```

---

## 学习路径

### 初学者

1. [../README.md](../README.md) - 项目概览
2. [DESIGN.md](./DESIGN.md) - 核心设计
3. 运行示例

### 开发者

1. [DESIGN.md](./DESIGN.md) - 完整设计（统一语义类型）
2. [specs/SEMANTIC_TYPE.md](../agierBro-vue/src/specs/SEMANTIC_TYPE.md) - 语义类型规范
3. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 实施总结

---

## 核心设计速查

### 统一语义类型

```typescript
type SemanticType =
  // 导航与结构
  | 'nav' | 'tree' | 'tabs'
  
  // 页面区块
  | 'hero' | 'stats' | 'features' | 'cta' | 'footer'
  
  // 字段语义
  | 'id' | 'title' | 'status' | 'amount' | 'email' ...
```

### Schema 格式

```json
{
  "_schema": {
    "type": "object",
    "semantic": "nav"
  },
  "links": [...]
}
```

### 渲染决策

```
数据加载
    ↓
semantic: nav → NavLayout
semantic: tree → TreeLayout
semantic: tabs → TabsLayout
semantic: hero → HeroSection
...
```

---

## 文档维护

### 更新原则

- **核心文档** - 保持最新，反映当前设计
- **技术规范** - 详细完整，包含所有细节
- **归档文档** - 保留历史记录，标注为参考

### 文档整合

- 每次重大设计变更后更新核心文档
- 归档历史文档
- 保持文档间链接有效

---

**许可:** MIT
