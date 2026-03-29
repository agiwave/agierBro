<template>
  <nav class="section-nav">
    <div class="nav-container">
      <div v-if="data.icon || data.title" class="nav-brand">
        <span v-if="data.icon" class="nav-icon">{{ data.icon }}</span>
        <span v-if="data.title" class="nav-title">{{ data.title }}</span>
      </div>
      
      <!-- 链接列表 -->
      <div v-if="data.links" class="nav-links">
        <a v-for="(link, index) in data.links" :key="index" :href="link.url" class="nav-link">
          {{ link.title }}
        </a>
      </div>

      <!-- 树形菜单 -->
      <div v-if="data.items && variant === 'tree'" class="nav-tree">
        <div v-for="(item, index) in data.items" :key="index" class="tree-item">
          <span v-if="item.icon" class="tree-icon">{{ item.icon }}</span>
          <span class="tree-title">{{ item.title }}</span>
          <p v-if="item.content" class="tree-content">{{ item.content }}</p>
          <div v-if="item.children" class="tree-children">
            <div v-for="(child, ci) in item.children" :key="ci" class="tree-child">
              <a :href="child.url" class="child-link">{{ child.title }}</a>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页 -->
      <div v-if="data.items && variant === 'tabs'" class="nav-tabs">
        <a
          v-for="(item, index) in data.items"
          :key="index"
          :href="item.url || '#'"
          :class="['tab-item', { active: index === activeTab }]"
          @click.prevent="activeTab = index"
        >
          {{ item.title }}
        </a>
        <div v-if="data.items[activeTab]?.content" class="tab-content">
          {{ data.items[activeTab].content }}
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DataObject } from '@/types'

defineProps<{
  data: DataObject
  variant?: 'default' | 'tree' | 'tabs'
}>()

const activeTab = ref(0)
</script>

<style scoped>
.section-nav {
  background: var(--bg-color-elevated);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-md) var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--font-size-lg);
  color: var(--text-color);
}

.nav-icon {
  font-size: 24px;
}

.nav-links {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: background 0.3s;
}

.nav-link:hover {
  background: var(--bg-color-secondary);
  color: var(--primary-color);
}

/* 树形菜单 */
.nav-tree {
  width: 100%;
}

.tree-item {
  padding: var(--spacing-md);
  border-left: 2px solid var(--border-color);
  margin-bottom: var(--spacing-sm);
}

.tree-icon {
  margin-right: var(--spacing-sm);
}

.tree-title {
  font-weight: 600;
  color: var(--text-color);
}

.tree-content {
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
  margin-top: var(--spacing-xs);
}

.tree-children {
  margin-top: var(--spacing-sm);
  padding-left: var(--spacing-lg);
}

.child-link {
  display: block;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
}

.child-link:hover {
  text-decoration: underline;
}

/* 标签页 */
.nav-tabs {
  width: 100%;
}

.tab-item {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-color-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item.active,
.tab-item:hover {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-color-secondary);
  border-radius: var(--border-radius);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-xs);
  }

  .nav-link {
    padding: var(--spacing-sm);
  }
}
</style>
