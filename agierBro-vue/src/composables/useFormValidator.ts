/**
 * 表单验证 Composable
 *
 * 基于 Schema 定义进行验证
 * 支持：必填、长度、范围、格式、正则表达式等
 */

import type { Schema, Field, DataObject } from '@/types'

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface FieldError {
  key: string
  message: string
}

export function useFormValidator() {
  /**
   * 验证整个表单数据
   */
  function validate(schema: Schema, data: DataObject): ValidationResult {
    const errors: Record<string, string> = {}
    const properties = schema.properties || {}

    for (const [key, field] of Object.entries(properties)) {
      const error = validateField(key, field, data[key])
      if (error) {
        errors[key] = error
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * 验证单个字段
   */
  function validateField(
    key: string,
    field: Field,
    value: any
  ): string | null {
    // 空值处理
    if (value === null || value === undefined || value === '') {
      if (field.required) {
        return `${field.title || formatLabel(key)} 是必填项`
      }
      return null
    }

    // 字符串验证
    if (field.type === 'string') {
      const stringError = validateString(key, field, value as string)
      if (stringError) return stringError
    }

    // 数字验证
    if (field.type === 'number' || field.type === 'integer') {
      const numberError = validateNumber(key, field, value as number)
      if (numberError) return numberError
    }

    // 数组验证
    if (field.type === 'array' && Array.isArray(value)) {
      const arrayError = validateArray(key, field, value)
      if (arrayError) return arrayError
    }

    // 枚举验证
    if (field.enum && !field.enum.some(e => e.value === value)) {
      return `${field.title || formatLabel(key)} 的值不在允许范围内`
    }

    // 格式验证
    if (field.format) {
      const formatError = validateFormat(key, field, value)
      if (formatError) return formatError
    }

    // 正则表达式验证
    if (field.pattern) {
      try {
        const regex = new RegExp(field.pattern)
        if (!regex.test(value)) {
          return `${field.title || formatLabel(key)} 格式不正确`
        }
      } catch (e) {
        console.warn('Invalid regex pattern:', field.pattern)
      }
    }

    return null
  }

  /**
   * 字符串验证
   */
  function validateString(
    key: string,
    field: Field,
    value: string
  ): string | null {
    // 最小长度
    if (field.minLength !== undefined && value.length < field.minLength) {
      return `${field.title || formatLabel(key)} 长度不能少于 ${field.minLength} 个字符`
    }

    // 最大长度
    if (field.maxLength !== undefined && value.length > field.maxLength) {
      return `${field.title || formatLabel(key)} 长度不能超过 ${field.maxLength} 个字符`
    }

    return null
  }

  /**
   * 数字验证
   */
  function validateNumber(
    key: string,
    field: Field,
    value: number
  ): string | null {
    // 最小值
    if (field.minimum !== undefined && value < field.minimum) {
      return `${field.title || formatLabel(key)} 不能小于 ${field.minimum}`
    }

    // 最大值
    if (field.maximum !== undefined && value > field.maximum) {
      return `${field.title || formatLabel(key)} 不能大于 ${field.maximum}`
    }

    // 整数验证
    if (field.type === 'integer' && !Number.isInteger(value)) {
      return `${field.title || formatLabel(key)} 必须是整数`
    }

    return null
  }

  /**
   * 数组验证
   */
  function validateArray(
    key: string,
    field: Field,
    value: any[]
  ): string | null {
    // 最小元素数
    if (field.minLength !== undefined && value.length < field.minLength) {
      return `${field.title || formatLabel(key)} 至少需要 ${field.minLength} 项`
    }

    // 最大元素数
    if (field.maxLength !== undefined && value.length > field.maxLength) {
      return `${field.title || formatLabel(key)} 最多只能有 ${field.maxLength} 项`
    }

    // 验证数组元素
    if (field.items) {
      for (let i = 0; i < value.length; i++) {
        const itemError = validateField(`${key}[${i}]`, field.items, value[i])
        if (itemError) {
          return `第 ${i + 1} 项：${itemError}`
        }
      }
    }

    return null
  }

  /**
   * 格式验证
   */
  function validateFormat(
    key: string,
    field: Field,
    value: any
  ): string | null {
    const format = field.format

    switch (format) {
      case 'email':
        if (!isValidEmail(value)) {
          return `${field.title || formatLabel(key)} 必须是有效的邮箱地址`
        }
        break

      case 'url':
        if (!isValidUrl(value)) {
          return `${field.title || formatLabel(key)} 必须是有效的 URL`
        }
        break

      case 'date':
        if (!isValidDate(value)) {
          return `${field.title || formatLabel(key)} 必须是有效的日期`
        }
        break

      case 'date-time':
        if (!isValidDateTime(value)) {
          return `${field.title || formatLabel(key)} 必须是有效的日期时间`
        }
        break

      case 'phone':
        if (!isValidPhone(value)) {
          return `${field.title || formatLabel(key)} 必须是有效的手机号`
        }
        break
    }

    return null
  }

  /**
   * 验证邮箱格式
   */
  function isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  /**
   * 验证 URL 格式
   */
  function isValidUrl(value: string): boolean {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证日期格式
   */
  function isValidDate(value: string): boolean {
    const date = new Date(value)
    return !isNaN(date.getTime()) && !isNaN(date.getDate())
  }

  /**
   * 验证日期时间格式
   */
  function isValidDateTime(value: string): boolean {
    return isValidDate(value)
  }

  /**
   * 验证手机号格式（中国大陆）
   */
  function isValidPhone(value: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(value)
  }

  /**
   * 格式化字段标签
   */
  function formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  /**
   * 验证单个字段（暴露给外部使用）
   */
  function validateSingleField(
    schema: Schema,
    key: string,
    value: any
  ): string | null {
    const field = schema.properties?.[key]
    if (!field) return null
    return validateField(key, field, value)
  }

  return {
    validate,
    validateField,
    validateSingleField,
    // 导出工具函数
    isValidEmail,
    isValidUrl,
    isValidDate,
    isValidPhone
  }
}
