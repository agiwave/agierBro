/**
 * 主题管理 Composable
 *
 * 支持亮色/暗色主题切换
 * 支持主题持久化（localStorage）
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  borderRadius: number
}

const STORAGE_KEY = 'agierbro_theme'

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#1890ff',
  borderRadius: 4
}

export function useTheme() {
  /**
   * 获取当前主题配置
   */
  function getTheme(): ThemeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...defaultTheme, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.warn('Failed to load theme:', e)
    }
    return defaultTheme
  }

  /**
   * 保存主题配置
   */
  function saveTheme(config: Partial<ThemeConfig>) {
    try {
      const current = getTheme()
      const updated = { ...current, ...config }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      applyTheme(updated)
    } catch (e) {
      console.warn('Failed to save theme:', e)
    }
  }

  /**
   * 应用主题
   */
  function applyTheme(config: ThemeConfig) {
    const root = document.documentElement
    const isDark = config.mode === 'dark' || (config.mode === 'system' && isSystemDark())

    // 设置暗色模式
    if (isDark) {
      root.classList.add('dark-theme')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark-theme')
      root.setAttribute('data-theme', 'light')
    }

    // 设置主题色
    root.style.setProperty('--primary-color', config.primaryColor)
    root.style.setProperty('--primary-hover', adjustColor(config.primaryColor, 0.1))
    root.style.setProperty('--primary-active', adjustColor(config.primaryColor, -0.1))

    // 设置圆角
    root.style.setProperty('--border-radius', `${config.borderRadius}px`)
    root.style.setProperty('--border-radius-lg', `${config.borderRadius + 4}px`)
    root.style.setProperty('--border-radius-sm', `${config.borderRadius - 2}px`)
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    const config = getTheme()
    applyTheme(config)

    // 监听系统主题变化
    if (config.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => applyTheme(config))
    }
  }

  /**
   * 切换主题模式
   */
  function toggleTheme() {
    const current = getTheme()
    const next: ThemeMode = current.mode === 'light' ? 'dark' : 'light'
    saveTheme({ mode: next })
    return next
  }

  /**
   * 设置主题模式
   */
  function setThemeMode(mode: ThemeMode) {
    saveTheme({ mode })
  }

  /**
   * 设置主题色
   */
  function setPrimaryColor(color: string) {
    saveTheme({ primaryColor: color })
  }

  /**
   * 设置圆角
   */
  function setBorderRadius(radius: number) {
    saveTheme({ borderRadius: Math.max(0, Math.min(16, radius)) })
  }

  /**
   * 判断系统是否为暗色模式
   */
  function isSystemDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * 调整颜色亮度
   */
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount)))
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount)))
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount)))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  /**
   * 获取当前主题模式
   */
  function getThemeMode(): ThemeMode {
    return getTheme().mode
  }

  /**
   * 判断是否为暗色模式
   */
  function isDark(): boolean {
    const config = getTheme()
    return config.mode === 'dark' || (config.mode === 'system' && isSystemDark())
  }

  return {
    // 状态
    getTheme,
    getThemeMode,
    isDark,
    isSystemDark,

    // 方法
    initTheme,
    applyTheme,
    toggleTheme,
    setThemeMode,
    setPrimaryColor,
    setBorderRadius
  }
}
