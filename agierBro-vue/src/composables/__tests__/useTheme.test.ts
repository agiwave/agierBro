import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from '@/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })
  })

  it('should return default theme', () => {
    const theme = useTheme()
    expect(theme.getTheme()).toEqual({
      mode: 'light',
      primaryColor: '#1890ff',
      borderRadius: 4
    })
  })

  it('should toggle theme', () => {
    const theme = useTheme()

    // 初始为 light
    expect(theme.getThemeMode()).toBe('light')

    // 切换为 dark
    const next = theme.toggleTheme()
    expect(next).toBe('dark')
    expect(theme.getThemeMode()).toBe('dark')

    // 再切换回 light
    const next2 = theme.toggleTheme()
    expect(next2).toBe('light')
  })

  it('should set theme mode', () => {
    const theme = useTheme()

    theme.setThemeMode('dark')
    expect(theme.getThemeMode()).toBe('dark')

    theme.setThemeMode('light')
    expect(theme.getThemeMode()).toBe('light')
  })

  it('should check if dark mode', () => {
    const theme = useTheme()

    // 初始为 light
    expect(theme.isDark()).toBe(false)

    // 切换为 dark
    theme.toggleTheme()
    expect(theme.isDark()).toBe(true)
  })

  it('should clamp border radius between 0 and 16', () => {
    const theme = useTheme()

    theme.setBorderRadius(-5)
    expect(theme.getTheme().borderRadius).toBe(0)

    theme.setBorderRadius(20)
    expect(theme.getTheme().borderRadius).toBe(16)

    theme.setBorderRadius(8)
    expect(theme.getTheme().borderRadius).toBe(8)
  })

  it('should handle system dark mode', () => {
    const theme = useTheme()

    // 测试系统主题检测
    expect(typeof theme.isSystemDark()).toBe('boolean')
  })

  it('should adjust color brightness', () => {
    const theme = useTheme()

    // 不应该抛出错误
    expect(() => theme.setPrimaryColor('#1890ff')).not.toThrow()
  })
})
