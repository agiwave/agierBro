import { describe, it, expect, beforeEach } from 'vitest'
import { useFormValidator } from '@/composables/useFormValidator'
import type { Schema } from '@/types'

describe('useFormValidator', () => {
  const { validate, validateField } = useFormValidator()

  it('should pass validation for valid data', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        username: { type: 'string', title: '用户名', required: true },
        email: { type: 'string', title: '邮箱', format: 'email', required: true },
        age: { type: 'integer', title: '年龄', minimum: 0, maximum: 150 }
      }
    }

    const data = {
      username: 'admin',
      email: 'admin@example.com',
      age: 25
    }

    const result = validate(schema, data)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('should fail validation for missing required field', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        username: { type: 'string', title: '用户名', required: true }
      }
    }

    const data = {}

    const result = validate(schema, data)
    expect(result.valid).toBe(false)
    expect(result.errors.username).toContain('必填')
  })

  it('should validate email format', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        email: { type: 'string', title: '邮箱', format: 'email', required: true }
      }
    }

    const result = validate(schema, { email: 'invalid' })
    expect(result.valid).toBe(false)
    expect(result.errors.email).toContain('邮箱')
  })

  it('should validate number range', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        age: { type: 'integer', title: '年龄', minimum: 0, maximum: 150, required: true }
      }
    }

    const result1 = validate(schema, { age: -1 })
    expect(result1.valid).toBe(false)
    expect(result1.errors.age).toContain('不能小于')

    const result2 = validate(schema, { age: 200 })
    expect(result2.valid).toBe(false)
    expect(result2.errors.age).toContain('不能大于')
  })

  it('should validate string length', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        username: { type: 'string', title: '用户名', minLength: 3, maxLength: 10, required: true }
      }
    }

    const result1 = validate(schema, { username: 'ab' })
    expect(result1.valid).toBe(false)
    expect(result1.errors.username).toContain('少于')

    const result2 = validate(schema, { username: 'verylongusername' })
    expect(result2.valid).toBe(false)
    expect(result2.errors.username).toContain('超过')
  })

  it('should validate enum values', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          title: '状态',
          required: true,
          enum: [
            { value: 'active', label: '激活' },
            { value: 'inactive', label: '未激活' }
          ]
        }
      }
    }

    const result = validate(schema, { status: 'invalid' })
    expect(result.valid).toBe(false)
    expect(result.errors.status).toContain('不在允许范围内')
  })

  it('should validate phone format', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        phone: { type: 'string', title: '手机号', format: 'phone', required: true }
      }
    }

    const result = validate(schema, { phone: '12345678901' })
    expect(result.valid).toBe(false)
    expect(result.errors.phone).toContain('手机号')
  })

  it('should pass validation for optional empty fields', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        username: { type: 'string', title: '用户名', required: true },
        nickname: { type: 'string', title: '昵称' }
      }
    }

    const result = validate(schema, { username: 'admin', nickname: '' })
    expect(result.valid).toBe(true)
  })

  it('should validate array items', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          title: '标签',
          required: true,
          minLength: 1,
          items: { type: 'string' }
        }
      }
    }

    const result = validate(schema, { tags: [] })
    expect(result.valid).toBe(false)
    expect(result.errors.tags).toContain('至少需要')
  })
})
