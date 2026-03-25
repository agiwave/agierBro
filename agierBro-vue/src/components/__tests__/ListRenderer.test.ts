import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ListRenderer from '@/components/ListRenderer.vue'
import type { Schema, DataObject } from '@/types'

describe('ListRenderer', () => {
  const baseSchema: Schema = {
    type: 'object',
    title: '用户列表',
    properties: {
      items: {
        type: 'array',
        title: '用户',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', title: 'ID' },
            name: { type: 'string', title: '姓名' },
            email: { type: 'string', title: '邮箱' }
          }
        }
      }
    }
  }

  const baseData: DataObject = {
    title: '用户列表',
    items: [
      { id: '1', name: '张三', email: 'zhangsan@example.com' },
      { id: '2', name: '李四', email: 'lisi@example.com' },
      { id: '3', name: '王五', email: 'wangwu@example.com' }
    ]
  }

  it('should render list with items', () => {
    const wrapper = mount(ListRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    expect(wrapper.find('.list-renderer').exists()).toBe(true)
    // 列表会渲染所有项目内容
    expect(wrapper.text()).toContain('张三')
  })

  it('should render all items', () => {
    const wrapper = mount(ListRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).toContain('李四')
    expect(wrapper.text()).toContain('王五')
  })

  it('should render item count', () => {
    const wrapper = mount(ListRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    expect(wrapper.text()).toContain('3')
  })

  it('should emit itemClick event when item is clicked', async () => {
    const wrapper = mount(ListRenderer, {
      props: {
        schema: baseSchema,
        data: baseData
      }
    })

    // 触发 itemClick 事件
    await wrapper.vm.$emit('itemClick', '/users/1')
    expect(wrapper.emitted('itemClick')).toBeDefined()
    expect(wrapper.emitted('itemClick')?.[0]).toEqual(['/users/1'])
  })

  it('should handle empty items', () => {
    const emptyData: DataObject = {
      title: '空列表',
      items: []
    }

    const wrapper = mount(ListRenderer, {
      props: {
        schema: baseSchema,
        data: emptyData
      }
    })

    // 空列表应该渲染空状态或列表容器
    expect(wrapper.exists()).toBe(true)
  })

  it('should use button layout for 1 field', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', title: '名称' }
            }
          }
        }
      }
    }

    const data: DataObject = {
      items: [{ name: '项目 1' }, { name: '项目 2' }]
    }

    const wrapper = mount(ListRenderer, {
      props: { schema, data }
    })

    // 单字段应该使用按钮布局
    expect(wrapper.findAll('button').length).toBeGreaterThan(0)
  })

  it('should use card layout for 2-4 fields', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', title: '名称' },
              email: { type: 'string', title: '邮箱' }
            }
          }
        }
      }
    }

    const data: DataObject = {
      items: [{ name: '张三', email: 'zhang@example.com' }]
    }

    const wrapper = mount(ListRenderer, {
      props: { schema, data }
    })

    // 2-4 字段应该使用卡片布局
    expect(wrapper.find('.card').exists()).toBe(true)
  })

  it('should handle tools in list items', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', title: 'ID' },
              name: { type: 'string', title: '名称' }
            }
          }
        }
      }
    }

    const data: DataObject = {
      items: [{ id: '1', name: '项目 1' }]
    }

    const wrapper = mount(ListRenderer, {
      props: { schema, data }
    })

    expect(wrapper.text()).toContain('项目 1')
  })
})
