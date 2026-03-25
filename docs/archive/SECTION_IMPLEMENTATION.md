# Section 机制实施报告

**日期:** 2026-03-24  
**目标:** 移除 HomePage.vue 特殊组件，实现通用 Section 渲染机制

---

## 问题分析

### 原有实现

```
HomePage.vue (特殊组件)
├── 硬编码组件映射
│   ├── '@nav' → NavLayout
│   ├── '@hero' → HeroSection
│   ├── '@stats' → StatsSection
│   └── ...
└── 遍历 items 渲染
```

**问题：**
1. ❌ HomePage.vue 是特殊处理，不符合通用机制
2. ❌ 组件映射硬编码在组件内部
3. ❌ 无法扩展自定义 Section
4. ❌ 与项目"业务无关"的理念相悖

---

## 解决方案

### 核心思路

**将首页视为 Section 列表，通过通用机制渲染：**

```
Entry.vue (统一入口)
├── 识别 Section 列表
│   └── items.every(item => item._schema)
├── SectionList (通用容器)
│   └── 遍历 items
└── SectionRenderer (动态组件)
    └── 从注册表获取组件
```

---

## 实施内容

### 1. 组件注册系统

**文件:** `src/composables/useSectionRegistry.ts`

```typescript
const sectionRegistry = new Map<string, any>()

export function registerSections(sections: Record<string, any>) {
  Object.entries(sections).forEach(([type, component]) => {
    sectionRegistry.set(type, component)
  })
}

export function getSectionComponent(type: string): any {
  return sectionRegistry.get(type) || null
}
```

**功能：**
- 全局组件注册表
- 动态查找组件
- 支持运行时扩展

---

### 2. Section 组件

**目录:** `src/components/sections/`

| 组件 | 类型 | 说明 |
|-----|------|------|
| SectionNav | `@nav` | 导航栏 |
| SectionHero | `@hero` | 主视觉 |
| SectionStats | `@stats` | 统计 |
| SectionFeatures | `@features` | 功能 |
| SectionCta | `@cta` | 行动号召 |
| SectionFooter | `@footer` | 页脚 |
| SectionContent | `@content` | 内容 |
| SectionList | `@list` | 列表 |
| SectionDefault | 默认 | 未注册时的回退 |

**组件规范：**
```vue
<template>
  <section class="section section-xxx">
    <!-- 渲染 data -->
  </section>
</template>

<script setup>
defineProps<{ data: any }>()
</script>
```

---

### 3. SectionRenderer 组件

**文件:** `src/components/SectionRenderer.vue`

```vue
<template>
  <component :is="component" :data="data" />
</template>

<script setup>
const component = computed(() => {
  const schema = props.data._schema
  return getSectionComponent(schema) || SectionDefault
})
</script>
```

**功能：**
- 动态组件加载
- 注册表查找
- 默认回退

---

### 4. SectionList 组件

**文件:** `src/components/SectionList.vue`

```vue
<template>
  <div class="section-list">
    <SectionRenderer
      v-for="(item, index) in items"
      :key="index"
      :data="item"
    />
  </div>
</template>
```

**功能：**
- 遍历 Section 列表
- 委托 SectionRenderer 渲染

---

### 5. Entry.vue 更新

**识别逻辑：**

```typescript
// Section 列表：items 数组且每个元素都有 _schema
const isSectionList = computed(() => {
  const items = data.value?.items
  if (!items || items.length === 0) return false
  return items.every((item: any) => item._schema)
})

// 普通列表：items 数组但元素没有 _schema
const isItemList = computed(() => {
  const items = data.value?.items
  if (!items || items.length === 0) return false
  return !items.every((item: any) => item._schema)
})
```

**模板：**

```vue
<SectionList
  v-else-if="isSectionList"
  :items="(data.items || []) as DataObject[]"
/>
```

---

### 6. 主入口注册

**文件:** `src/main.ts`

```typescript
import { registerSections } from './composables/useSectionRegistry'
import {
  SectionNav,
  SectionHero,
  SectionStats,
  SectionFeatures,
  SectionCta,
  SectionFooter,
  SectionContent,
  SectionList
} from './components/sections'

registerSections({
  '@nav': SectionNav,
  '@hero': SectionHero,
  '@stats': SectionStats,
  '@features': SectionFeatures,
  '@cta': SectionCta,
  '@footer': SectionFooter,
  '@content': SectionContent,
  '@list': SectionList
})
```

---

## 文件清单

### 新增文件

| 文件 | 说明 |
|-----|------|
| `src/composables/useSectionRegistry.ts` | 组件注册系统 |
| `src/components/SectionRenderer.vue` | 动态组件渲染器 |
| `src/components/SectionList.vue` | Section 列表容器 |
| `src/components/sections/SectionNav.vue` | 导航组件 |
| `src/components/sections/SectionHero.vue` | Hero 组件 |
| `src/components/sections/SectionStats.vue` | 统计组件 |
| `src/components/sections/SectionFeatures.vue` | 功能组件 |
| `src/components/sections/SectionCta.vue` | CTA 组件 |
| `src/components/sections/SectionFooter.vue` | 页脚组件 |
| `src/components/sections/SectionContent.vue` | 内容组件 |
| `src/components/sections/SectionList.vue` | 列表组件 |
| `src/components/sections/SectionDefault.vue` | 默认组件 |
| `docs/SECTION_MECHANISM.md` | Section 机制文档 |

### 删除文件

| 文件 | 说明 |
|-----|------|
| `src/components/HomePage.vue` | 特殊组件（已删除） |
| `src/components/sections/HeroSection.vue` | 旧命名 |
| `src/components/sections/FeaturesSection.vue` | 旧命名 |
| `src/components/sections/StatsSection.vue` | 旧命名 |
| `src/components/sections/CtaSection.vue` | 旧命名 |
| `src/components/sections/FooterSection.vue` | 旧命名 |

### 修改文件

| 文件 | 修改内容 |
|-----|---------|
| `src/main.ts` | 添加 Section 注册 |
| `src/views/Entry.vue` | 添加 Section 列表识别 |
| `docs/PROTOCOL_V2.md` | 添加 Section 机制说明 |

---

## 对比分析

### 之前（HomePage.vue）

```
❌ 特殊组件
❌ 硬编码映射
❌ 无法扩展
❌ 违反通用原则
```

### 现在（Section 机制）

```
✅ 通用机制
✅ 注册表查找
✅ 支持扩展
✅ 符合通用原则
```

---

## 使用示例

### API 响应

```json
{
  "items": [
    {
      "_schema": "@nav",
      "title": "网站",
      "links": [...]
    },
    {
      "_schema": "@hero",
      "title": "欢迎",
      "actions": [...]
    }
  ]
}
```

### 自动渲染

```
Entry.vue
  → isSectionList = true
  → SectionList
    → SectionRenderer (@nav)
      → SectionNav
    → SectionRenderer (@hero)
      → SectionHero
```

---

## 扩展指南

### 添加自定义 Section

1. **创建组件**

```vue
<!-- SectionCustom.vue -->
<template>
  <section class="section section-custom">
    <h2>{{ data.title }}</h2>
  </section>
</template>

<script setup>
defineProps<{ data: any }>()
</script>
```

2. **注册组件**

```typescript
// main.ts
import SectionCustom from './components/sections/SectionCustom.vue'

registerSections({
  '@custom': SectionCustom
})
```

3. **API 使用**

```json
{
  "items": [
    {
      "_schema": "@custom",
      "title": "自定义区块"
    }
  ]
}
```

---

## 验证结果

```bash
npm run build

# 输出
✓ 106 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-BD5rlE6x.css    7.07 kB │ gzip:  1.73 kB
dist/assets/Entry-HgWp_a6p.css   13.66 kB │ gzip:  2.83 kB
dist/assets/Entry-Cl2Acc-3.js    25.60 kB │ gzip:  8.33 kB
dist/assets/index-oH-jlrvW.js   106.48 kB │ gzip: 40.93 kB
✓ built in 1.99s
```

✅ 构建成功，无错误

---

## 核心优势

### 1. 通用性

- 无特殊组件
- 通过注册表动态加载
- 适用于任何页面

### 2. 可扩展

- 轻松添加新 Section
- 无需修改核心代码
- 支持懒加载

### 3. 业务无关

- 前端不关心业务
- 后端定义页面结构
- 通过 `_schema` 解耦

### 4. 类型安全

- 可选 TypeScript 支持
- 组件类型推断
- 编译时检查

---

## 下一步

### 短期

1. ✅ 完成 Section 机制实现
2. ✅ 删除 HomePage.vue
3. ✅ 更新文档

### 中期

1. 添加 Section 动画效果
2. 实现 Section 缓存
3. 支持 Section 嵌套

### 长期

1. Section 可视化编辑器
2. Section 模板市场
3. 跨平台 Section 库

---

## 总结

通过实现通用的 Section 机制，我们成功移除了 HomePage.vue 特殊组件，使项目更加符合"业务无关"的设计理念。

**关键成果：**
- ✅ 通用 Section 渲染机制
- ✅ 组件注册系统
- ✅ 易于扩展
- ✅ 完全类型安全（可选）
- ✅ 构建成功

**核心理念：**
> 页面由 Section 组成，Section 通过注册表动态加载，前端不关心业务逻辑。

---

**许可:** MIT
