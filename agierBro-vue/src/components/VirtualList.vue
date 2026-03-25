<template>
  <div class="virtual-list" :style="{ height: `${height}px`, overflow: 'auto' }" ref="containerRef">
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div
        v-for="item in visibleItems"
        :key="item.key"
        class="virtual-item"
        :style="{
          position: 'absolute',
          top: `${item.top}px`,
          left: 0,
          right: 0,
          height: `${itemHeight}px`
        }"
      >
        <slot :item="item.data" :index="item.index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  items: any[]
  itemHeight: number
  height: number
  overscan?: number
}>()

const overscan = props.overscan ?? 5
const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)

// 计算可见区域
const visibleCount = computed(() => Math.ceil(props.height / props.itemHeight))
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
const endIndex = computed(() =>
  Math.min(props.items.length - 1, startIndex.value + visibleCount.value + overscan)
)

// 计算可见项
const visibleItems = computed(() => {
  const start = Math.max(0, startIndex.value - overscan)
  const end = endIndex.value

  return props.items.slice(start, end + 1).map((item, index) => ({
    key: item.id ?? item.key ?? start + index,
    data: item,
    index: start + index,
    top: (start + index) * props.itemHeight
  }))
})

// 总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 滚动处理
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  containerRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.virtual-list {
  contain: strict;
  overflow: auto;
  will-change: scroll-position;
}

.virtual-item {
  will-change: transform;
}
</style>
