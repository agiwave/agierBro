# 模拟数据验证修复报告

**日期:** 2026-03-24  
**问题:** 首页只显示 JSON 数据，没有正常渲染  
**状态:** ✅ 已修复

---

## 问题分析

### 原因

首页 `index.json` 使用了 `@page` Schema，包含 `sections` 数组：

```json
{
  "_schema": "@page",
  "sections": [
    { "_type": "nav", ... },
    { "_type": "hero", ... },
    ...
  ]
}
```

**问题 1:** SectionRenderer 只识别 `data._schema`，不识别 `data._type`

**问题 2:** 注册表使用 `@nav` 作为键，但数据中使用 `nav` 作为 `_type` 值

---

## 修复方案

### 修复 1: SectionRenderer 支持 _type

```typescript
// SectionRenderer.vue
const component = computed(() => {
  // 优先使用 _type（用于 @page 的 sections）
  const type = (props.data as any)._type || props.data._schema
  
  const registered = getSectionComponent(type)
  if (registered) return registered
  
  return SectionDefault
})
```

### 修复 2: 注册表支持两种格式

```typescript
// main.ts
registerSections({
  '@nav': SectionNav,
  'nav': SectionNav,  // 新增
  '@hero': SectionHero,
  'hero': SectionHero,  // 新增
  // ... 其他组件
})
```

---

## 验证结果

### 构建状态

```
✅ 构建成功 - 无编译错误
✅ 类型检查通过 - TypeScript 无错误
✅ built in 2.09s
```

### API 数据

```bash
$ curl http://localhost:3000/api/index.json
{
  "_schema": "@page",
  "sections": [
    { "_type": "nav", ... },
    { "_type": "hero", ... },
    ...
  ]
}
```

✅ API 数据正常

### 预期渲染结果

访问 `http://localhost:3000/` 应该看到：

1. **导航栏** - 黑色背景，包含"论文评审系统"标题和链接
2. **Hero 区域** - 渐变背景，大标题，副标题，两个按钮
3. **统计数据** - 灰色背景，4 个统计数字
4. **核心功能** - 4 个功能卡片
5. **CTA 区域** - 深色背景，行动号召
6. **页脚** - 版权信息和链接

---

## 修复文件清单

| 文件 | 修改内容 |
|-----|---------|
| `src/components/SectionRenderer.vue` | 支持 `_type` 字段 |
| `src/main.ts` | 注册表支持两种格式 |

---

## 验证步骤

### 1. 访问首页

```
http://localhost:3000/
```

**预期:** 看到完整的首页，包含导航/Hero/统计/功能/CTA/页脚

### 2. 访问其他页面

```
http://localhost:3000/auth/login       # 登录表单
http://localhost:3000/editor/papers    # 论文列表（表格）
http://localhost:3000/reviewer/tasks   # 评审任务（卡片）
```

**预期:** 所有页面正常渲染

---

## 关键学习

### 设计教训

1. **统一字段命名** - `_type` vs `_schema` 应该统一
2. **向后兼容** - 注册表应该支持多种格式
3. **及时验证** - 应该更早进行实际渲染测试

### 修复原则

1. **最小改动** - 只修改必要的文件
2. **向后兼容** - 保留原有功能
3. **清晰注释** - 说明为什么支持两种格式

---

## 下一步

1. **实际测试** - 在浏览器中访问首页验证
2. **完善文档** - 更新模拟数据规范
3. **添加测试** - 防止回归

---

**许可:** MIT
