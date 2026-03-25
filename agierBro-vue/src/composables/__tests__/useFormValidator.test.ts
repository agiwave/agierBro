import { describe, it, expect } from 'vitest'
import { useFormValidator } from '@/composables/useFormValidator'

describe('Form Validator', () => {
  const { validate, validateSingleField } = useFormValidator()

  it('should validate required field', () => {
    const schema = {
      type: 'object',
      properties: {
        username: { type: 'string', required: true, title: '用户名' }
      }
    }
    
    const result = validate(schema, { username: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.username).toContain('必填')
  })

  it('should validate minLength', () => {
    const schema = {
      type: 'object',
      properties: {
        password: { type: 'string', minLength: 6, title: '密码' }
      }
    }
    
    const result = validate(schema, { password: '123' })
    expect(result.valid).toBe(false)
    expect(result.errors.password).toContain('6')
  })

  it('should validate maxLength', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', maxLength: 10, title: '名称' }
      }
    }
    
    const result = validate(schema, { name: '12345678901' })
    expect(result.valid).toBe(false)
  })

  it('should validate email format', () => {
    const schema = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', title: '邮箱' }
      }
    }
    
    const result = validate(schema, { email: 'invalid' })
    expect(result.valid).toBe(false)
    
    const validResult = validate(schema, { email: 'test@example.com' })
    expect(validResult.valid).toBe(true)
  })

  it('should validate number range', () => {
    const schema = {
      type: 'object',
      properties: {
        age: { type: 'number', minimum: 0, maximum: 150, title: '年龄' }
      }
    }
    
    const result = validate(schema, { age: -1 })
    expect(result.valid).toBe(false)
    
    const result2 = validate(schema, { age: 200 })
    expect(result2.valid).toBe(false)
  })

  it('should validate enum', () => {
    const schema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            { value: 'active', label: '激活' },
            { value: 'inactive', label: '未激活' }
          ],
          title: '状态'
        }
      }
    }
    
    const result = validate(schema, { status: 'unknown' })
    expect(result.valid).toBe(false)
    
    const validResult = validate(schema, { status: 'active' })
    expect(validResult.valid).toBe(true)
  })

  it('should pass valid data', () => {
    const schema = {
      type: 'object',
      properties: {
        username: { type: 'string', required: true },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', minimum: 0 }
      }
    }
    
    const result = validate(schema, {
      username: 'admin',
      email: 'admin@example.com',
      age: 25
    })
    
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })
})
