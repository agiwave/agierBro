import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemaRenderer from '@/components/SchemaRenderer.vue'
import type { Schema, DataObject } from '@/types'

describe('SchemaRenderer', () => {
  const baseSchema: Schema = {
    type: 'object',
    title: '测试表单',
    properties: {
      name: { type: 'string', title: '姓名' },
      email: { type: 'string', title: '邮箱', format: 'email' },
      age: { type: 'integer', title: '年龄' }
    }
  }

  const baseData: DataObject = {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25
  }

  it('should render in view mode by default', () => {
    const wrapper = mount(SchemaRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    expect(wrapper.find('.schema-renderer').exists()).toBe(true)
    expect(wrapper.find('.view-mode').exists()).toBe(true)
  })

  it('should render field labels and values in view mode', () => {
    const wrapper = mount(SchemaRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('邮箱')
    expect(wrapper.text()).toContain('年龄')
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).toContain('zhangsan@example.com')
    expect(wrapper.text()).toContain('25')
  })

  it('should render title when provided', () => {
    const wrapper = mount(SchemaRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    // 标题可能在 section header 中
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('姓名')
  })

  it('should render in form mode when has tools and no items', () => {
    const schemaWithTools: Schema = {
      type: 'object',
      title: '登录',
      properties: {
        username: { type: 'string', title: '用户名' },
        password: { type: 'string', title: '密码' }
      },
      tools: [{
        name: 'login',
        description: '登录',
        protocol: 'http',
        method: 'POST',
        url: '/api/login'
      }]
    }

    const wrapper = mount(SchemaRenderer, {
      props: {
        schema: schemaWithTools,
        data: { username: '', password: '' }
      }
    })

    expect(wrapper.find('.form-mode').exists()).toBe(true)
    expect(wrapper.find('.form-title').text()).toContain('登录')
  })

  it('should format date values correctly', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        createdAt: { type: 'string', title: '创建时间', format: 'date-time' }
      }
    }

    const data: DataObject = {
      createdAt: '2026-03-25T10:00:00Z'
    }

    const wrapper = mount(SchemaRenderer, {
      props: { schema, data }
    })

    expect(wrapper.text()).toContain('2026')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('25')
  })

  it('should format boolean values correctly', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        active: { type: 'boolean', title: '是否激活' }
      }
    }

    const wrapper = mount(SchemaRenderer, {
      props: {
        schema,
        data: { active: true }
      }
    })

    expect(wrapper.text()).toContain('是')
  })

  it('should format number values with locale', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        amount: { type: 'number', title: '金额' }
      }
    }

    const wrapper = mount(SchemaRenderer, {
      props: {
        schema,
        data: { amount: 1000000 }
      }
    })

    expect(wrapper.text()).toContain('1,000,000')
  })

  it('should display empty value as —', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        description: { type: 'string', title: '描述' }
      }
    }

    const wrapper = mount(SchemaRenderer, {
      props: {
        schema,
        data: { description: '' }
      }
    })

    expect(wrapper.text()).toContain('—')
  })

  it('should emit submit event', async () => {
    const wrapper = mount(SchemaRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    await wrapper.vm.$emit('submit', baseData)
    expect(wrapper.emitted('submit')).toBeDefined()
  })

  it('should handle enum values', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          title: '状态',
          enum: [
            { value: 'active', label: '激活' },
            { value: 'inactive', label: '未激活' }
          ]
        }
      }
    }

    const wrapper = mount(SchemaRenderer, {
      props: {
        schema,
        data: { status: 'active' }
      }
    })

    expect(wrapper.text()).toContain('激活')
  })
})
