/**
 * 下拉刷新 Composable
 * 
 * 使用示例:
 * const { isRefreshing, pullDistance, handlers } = usePullToRefresh(loadData)
 * <div v-bind="handlers">...</div>
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: {
    threshold?: number
    maxDistance?: number
  } = {}
) {
  const {
    threshold = 80,
    maxDistance = 150
  } = options

  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const isPulling = ref(false)
  const startY = ref(0)

  let touchTarget: HTMLElement | null = null

  function handleTouchStart(e: TouchEvent) {
    // 只有在顶部时才允许下拉
    if (window.scrollY > 0) return

    touchTarget = e.currentTarget as HTMLElement
    startY.value = e.touches[0].clientY
    isPulling.value = true
    pullDistance.value = 0
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isPulling.value || !touchTarget) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.value

    // 只有在向下拉且未刷新时才计算
    if (diff > 0) {
      // 阻尼效果
      pullDistance.value = Math.min(diff * 0.5, maxDistance)
      e.preventDefault()
    }
  }

  async function handleTouchEnd() {
    if (!isPulling.value) return

    isPulling.value = false

    // 达到阈值则触发刷新
    if (pullDistance.value >= threshold && !isRefreshing.value) {
      isRefreshing.value = true
      pullDistance.value = 0

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        isRefreshing.value = false
      }
    } else {
      pullDistance.value = 0
    }

    touchTarget = null
  }

  const handlers = {
    touchstart: handleTouchStart,
    touchmove: handleTouchMove,
    touchend: handleTouchEnd,
    touchcancel: handleTouchEnd
  }

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    handlers
  }
}
