/**
 * 简易国际化支持
 */

export type Locale = 'zh-CN' | 'en-US'

export interface Translation {
  [key: string]: string | Translation
}

export interface LocaleMessages {
  'zh-CN': Translation
  'en-US': Translation
}

// 默认语言
let currentLocale: Locale = 'zh-CN'

// 语言包
const messages: LocaleMessages = {
  'zh-CN': {
    // 通用
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.submit': '提交',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.close': '关闭',
    'common.back': '返回',
    'common.refresh': '刷新',
    
    // 表单
    'form.required': '必填',
    'form.invalid': '格式不正确',
    'form.tooShort': '长度太短',
    'form.tooLong': '长度太长',
    
    // 认证
    'auth.login': '登录',
    'auth.logout': '登出',
    'auth.register': '注册',
    'auth.username': '用户名',
    'auth.password': '密码',
    'auth.email': '邮箱',
    'auth.remember': '记住我',
    'auth.forgotPassword': '忘记密码',
    
    // 导航
    'nav.home': '首页',
    'nav.profile': '个人',
    'nav.settings': '设置',
    
    // 错误
    'error.network': '网络错误',
    'error.timeout': '请求超时',
    'error.unauthorized': '未授权',
    'error.notFound': '未找到',
    'error.server': '服务器错误'
  },
  'en-US': {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.refresh': 'Refresh',
    
    // Form
    'form.required': 'Required',
    'form.invalid': 'Invalid format',
    'form.tooShort': 'Too short',
    'form.tooLong': 'Too long',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.email': 'Email',
    'auth.remember': 'Remember me',
    'auth.forgotPassword': 'Forgot password',
    
    // Navigation
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Errors
    'error.network': 'Network error',
    'error.timeout': 'Request timeout',
    'error.unauthorized': 'Unauthorized',
    'error.notFound': 'Not found',
    'error.server': 'Server error'
  }
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
 * 获取嵌套消息
 */
function getMessage(obj: Translation, key: string): string | null {
  const parts = key.split('.')
  let current: Translation | string = obj
  
  for (const part of parts) {
    if (typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return null
    }
  }
  
  return typeof current === 'string' ? current : null
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
