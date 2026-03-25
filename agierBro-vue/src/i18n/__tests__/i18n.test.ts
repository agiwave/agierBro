import { describe, it, expect, beforeEach } from 'vitest'
import { t, setLocale, getLocale, getSupportedLocales } from '@/i18n'

describe('i18n', () => {
  beforeEach(() => {
    setLocale('zh-CN')
    localStorage.clear()
  })

  it('should translate zh-CN', () => {
    setLocale('zh-CN')
    expect(t('auth.login')).toBe('登录')
    expect(t('common.loading')).toBe('加载中...')
  })

  it('should translate en-US', () => {
    setLocale('en-US')
    expect(t('auth.login')).toBe('Login')
    expect(t('common.loading')).toBe('Loading...')
  })

  it('should return key if missing', () => {
    expect(t('missing.key')).toBe('missing.key')
  })

  it('should replace parameters', () => {
    const result = t('validation.required', { field: '用户名' })
    expect(result).toBe('用户名 是必填项')
  })

  it('should get current locale', () => {
    setLocale('zh-CN')
    expect(getLocale()).toBe('zh-CN')

    setLocale('en-US')
    expect(getLocale()).toBe('en-US')
  })

  it('should persist locale', () => {
    setLocale('en-US')
    const saved = localStorage.getItem('locale')
    expect(saved).toBe('en-US')
  })

  it('should restore locale from localStorage', () => {
    localStorage.setItem('locale', 'en-US')
    const restored = getLocale()
    expect(restored).toBe('en-US')
  })

  it('should get supported locales', () => {
    const locales = getSupportedLocales()
    expect(locales).toContain('zh-CN')
    expect(locales).toContain('en-US')
  })

  it('should handle nested translation keys', () => {
    setLocale('zh-CN')
    expect(t('status.active')).toBe('激活')
    expect(t('error.networkOffline')).toContain('断开')
  })

  it('should handle missing parameters gracefully', () => {
    const result = t('validation.required', {})
    expect(result).toBe('{field} 是必填项')
  })
})
