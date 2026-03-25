import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { nextTick } from 'vue'

describe('usePullToRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial state', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { isRefreshing, pullDistance, isPulling } = usePullToRefresh(onRefresh)

    expect(isRefreshing.value).toBe(false)
    expect(pullDistance.value).toBe(0)
    expect(isPulling.value).toBe(false)
  })

  it('should return handlers', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers } = usePullToRefresh(onRefresh)

    expect(handlers.touchstart).toBeDefined()
    expect(handlers.touchmove).toBeDefined()
    expect(handlers.touchend).toBeDefined()
    expect(handlers.touchcancel).toBeDefined()
  })

  it('should handle touch start', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers, isPulling, pullDistance } = usePullToRefresh(onRefresh)

    const mockEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    // 模拟在顶部
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

    handlers.touchstart(mockEvent)

    expect(isPulling.value).toBe(true)
    expect(pullDistance.value).toBe(0)
  })

  it('should not start pull when scrolled down', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers, isPulling } = usePullToRefresh(onRefresh)

    const mockEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    // 模拟已滚动
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })

    handlers.touchstart(mockEvent)

    expect(isPulling.value).toBe(false)
  })

  it('should handle touch move', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers, pullDistance, isPulling } = usePullToRefresh(onRefresh)

    const startEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    handlers.touchstart(startEvent)

    const moveEvent = {
      touches: [{ clientY: 200 }],
      preventDefault: vi.fn(),
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    handlers.touchmove(moveEvent)
    await nextTick()

    expect(pullDistance.value).toBeGreaterThan(0)
    expect(moveEvent.preventDefault).toHaveBeenCalled()
  })

  it('should trigger refresh when threshold reached', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers, isRefreshing } = usePullToRefresh(onRefresh, { threshold: 80 })

    const startEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    handlers.touchstart(startEvent)

    // 模拟拉动超过阈值
    const moveEvent = {
      touches: [{ clientY: 300 }],
      preventDefault: vi.fn(),
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    handlers.touchmove(moveEvent)
    await nextTick()

    handlers.touchend()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(onRefresh).toHaveBeenCalled()
    // isRefreshing 在 refresh 完成后会变回 false
  })

  it('should not trigger refresh when threshold not reached', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers, isRefreshing } = usePullToRefresh(onRefresh, { threshold: 80 })

    const startEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    handlers.touchstart(startEvent)

    // 模拟拉动未超过阈值
    const moveEvent = {
      touches: [{ clientY: 150 }],
      preventDefault: vi.fn(),
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    handlers.touchmove(moveEvent)
    await nextTick()

    handlers.touchend()
    await nextTick()

    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('should handle refresh error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'))
    const { handlers, isRefreshing } = usePullToRefresh(onRefresh, { threshold: 80 })

    const startEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    handlers.touchstart(startEvent)

    const moveEvent = {
      touches: [{ clientY: 300 }],
      preventDefault: vi.fn(),
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    handlers.touchmove(moveEvent)
    await nextTick()

    handlers.touchend()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(isRefreshing.value).toBe(false)
    consoleSpy.mockRestore()
  })

  it('should handle touch cancel', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { handlers, isPulling } = usePullToRefresh(onRefresh)

    const startEvent = {
      touches: [{ clientY: 100 }],
      currentTarget: document.createElement('div')
    } as unknown as TouchEvent

    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    handlers.touchstart(startEvent)

    expect(isPulling.value).toBe(true)

    handlers.touchcancel()

    expect(isPulling.value).toBe(false)
  })
})
