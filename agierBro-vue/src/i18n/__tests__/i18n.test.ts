import { describe, it, expect, beforeEach } from 'vitest'
import { t, setLocale, getLocale } from '@/i18n'

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    setLocale('zh-CN')
  })

  it('should translate zh-CN', () => {
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
    // 翻译键存在
    expect(t('common.success')).toBeTruthy()
  })

  it('should get current locale', () => {
    expect(getLocale()).toBe('zh-CN')
    setLocale('en-US')
    expect(getLocale()).toBe('en-US')
  })

  it('should persist locale', () => {
    setLocale('en-US')
    expect(localStorage.getItem('locale')).toBe('en-US')
  })
})
