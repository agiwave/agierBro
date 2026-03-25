/**
 * 简易国际化支持
 */

import { zhCN, enUS } from './locales'

export type Locale = 'zh-CN' | 'en-US'

export interface Translation {
  [key: string]: string
}

export interface LocaleMessages {
  'zh-CN': Translation
  'en-US': Translation
}

// 默认语言
let currentLocale: Locale = 'zh-CN'

// 语言包（使用扁平化格式）
const messages: LocaleMessages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

/**
 * 设置当前语言
 */
export function setLocale(locale: Locale) {
  currentLocale = locale
  document.documentElement.lang = locale
  localStorage.setItem('locale', locale)
}

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  // 从 localStorage 恢复
  const stored = localStorage.getItem('locale') as Locale
  if (stored && stored in messages) {
    currentLocale = stored
  }
  return currentLocale
}

/**
 * 翻译函数
 */
export function t(key: string, params?: Record<string, string>): string {
  const locale = currentLocale
  const message = getMessage(messages[locale], key)
  
  if (!message) {
    console.warn(`Translation missing for key: ${key}`)
    return key
  }
  
  // 替换参数
  if (params) {
    return message.replace(/\{(\w+)\}/g, (_, name) => params[name] || `{${name}}`)
  }
  
  return message
}

/**
 * 获取消息（支持扁平化键名）
 */
function getMessage(obj: Translation, key: string): string | null {
  // 直接查找扁平化键名
  if (key in obj) {
    return obj[key]
  }
  return null
}

/**
 * 获取所有支持的语言
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(messages) as Locale[]
}

/**
 * Vue 插件
 */
export function createI18nPlugin() {
  return {
    install(app: any) {
      // 全局方法
      app.config.globalProperties.$t = t
      
      // 提供语言切换
      app.provide('locale', {
        locale: currentLocale,
        setLocale,
        t
      })
    }
  }
}

// 导出翻译指令
export const vT = {
  mounted(el: HTMLElement, binding: { value: string }) {
    el.textContent = t(binding.value)
  },
  updated(el: HTMLElement, binding: { value: string }) {
    el.textContent = t(binding.value)
  }
}
