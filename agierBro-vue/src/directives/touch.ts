/**
 * 触摸手势指令
 * 
 * 支持:
 * - tap (点击)
 * - swipeLeft (左滑)
 * - swipeRight (右滑)
 * - swipeUp (上滑)
 * - swipeDown (下滑)
 */

export interface TouchOptions {
  onTap?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefault?: boolean
}

export const vTouch = {
  mounted(el: HTMLElement, binding: { value: TouchOptions }) {
    const options = binding.value
    let startX = 0
    let startY = 0
    let startTime = 0
    let isMoving = false

    const threshold = options.threshold || 50

    function handleTouchStart(e: TouchEvent) {
      if (options.preventDefault) {
        e.preventDefault()
      }
      
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
      isMoving = false
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isMoving) {
        const touch = e.touches[0]
        const diffX = Math.abs(touch.clientX - startX)
        const diffY = Math.abs(touch.clientY - startY)
        
        // 判断是否开始滑动
        if (diffX > 10 || diffY > 10) {
          isMoving = true
        }
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (options.preventDefault) {
        e.preventDefault()
      }
      
      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY
      const diffTime = Date.now() - startTime
      const diffX = endX - startX
      const diffY = endY - startY

      // 点击判断 (移动距离小且时间短)
      if (!isMoving && Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && diffTime < 200) {
        options.onTap?.()
        return
      }

      // 滑动判断
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (Math.abs(diffX) > threshold) {
          diffX > 0 ? options.onSwipeRight?.() : options.onSwipeLeft?.()
        }
      } else {
        // 垂直滑动
        if (Math.abs(diffY) > threshold) {
          diffY > 0 ? options.onSwipeDown?.() : options.onSwipeUp?.()
        }
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: !options.preventDefault })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: !options.preventDefault })

    // 存储清理函数
    ;(el as any)._touchCleanup = () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  },

  beforeUnmount(el: HTMLElement) {
    if ((el as any)._touchCleanup) {
      ;(el as any)._touchCleanup()
    }
  }
}

/**
 * 长按指令
 */
export const vLongPress = {
  mounted(el: HTMLElement, binding: { value: () => void; arg?: string }) {
    let timer: number | null = null
    const duration = binding.arg ? parseInt(binding.arg) : 500

    function handleTouchStart() {
      timer = window.setTimeout(() => {
        binding.value()
        timer = null
      }, duration)
    }

    function handleTouchEnd() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    el.addEventListener('touchstart', handleTouchStart)
    el.addEventListener('touchend', handleTouchEnd)
    el.addEventListener('click', handleTouchEnd)

    // 存储清理函数
    ;(el as any)._longPressCleanup = () => {
      if (timer) clearTimeout(timer)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('click', handleTouchEnd)
    }
  },

  beforeUnmount(el: HTMLElement) {
    if ((el as any)._longPressCleanup) {
      ;(el as any)._longPressCleanup()
    }
  }
}
