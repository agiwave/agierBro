<template>
  <div class="nav-layout">
    <!-- 顶部导航栏 -->
    <header class="nav-header">
      <div class="nav-container">
        <div class="nav-brand">{{ data?.title || 'AgierBro' }}</div>
        <nav class="nav-menu">
          <a
            v-for="(link, index) in links"
            :key="index"
            :class="['nav-link', { active: activeIndex === index }]"
            @click.prevent="handleClick(link, index)"
          >
            <span v-if="link.icon" class="nav-icon">{{ link.icon }}</span>
            {{ link.title }}
          </a>
        </nav>
      </div>
    </header>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DataObject } from '@/types'
const props = defineProps<{ data: DataObject | null }>()
const router = useRouter()
const activeIndex = ref(0)
const links = computed(() => props.data?.links || [])
function handleClick(link: typeof links.value[number], index: number) {
  activeIndex.value = index
  const url = link.url.replace('.json', '')
  // 所有链接都在新页面打开（路由跳转）
  router.push(url)
}
// 初始化
if (links.value.length > 0) {
  handleClick(links.value[0], 0)
}
</script>
<style scoped>
.nav-layout { min-height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }
.nav-header { background: #fff; border-bottom: 1px solid #e8e8e8; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 100; }
.nav-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.nav-brand { font-size: 20px; font-weight: 600; color: #1890ff; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
.nav-menu { display: flex; gap: 8px; padding: 16px 0; }
.nav-link { display: flex; align-items: center; gap: 6px; padding: 8px 16px; color: #666; text-decoration: none; border-radius: 4px; font-size: 14px; transition: all 0.3s; cursor: pointer; }
.nav-link:hover { background: #f5f5f5; color: #1890ff; }
.nav-link.active { background: #e6f7ff; color: #1890ff; font-weight: 500; }
.nav-icon { font-size: 16px; }
@media (max-width: 768px) {
  .nav-container { padding: 0 16px; }
  .nav-brand { font-size: 18px; padding: 12px 0; }
  .nav-menu { gap: 4px; overflow-x: auto; padding: 12px 0; }
  .nav-link { padding: 6px 12px; font-size: 13px; white-space: nowrap; }
}
</style>
