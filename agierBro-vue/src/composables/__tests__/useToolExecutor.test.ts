import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToolExecutor } from '@/composables/useToolExecutor'
import type { Tool } from '@/types'

describe('useToolExecutor', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should return execute and mergeArgs functions', () => {
    const { execute, mergeArgs } = useToolExecutor()

    expect(execute).toBeDefined()
    expect(mergeArgs).toBeDefined()
  })

  it('should execute http protocol tool', async () => {
    const { execute } = useToolExecutor()

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'submit',
      description: '提交表单',
      protocol: 'http',
      method: 'POST',
      url: '/api/submit'
    }

    const result = await execute(tool, { name: 'test' })

    expect(result.success).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      '/api/submit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' })
      })
    )
  })

  it('should execute http GET request without body', async () => {
    const { execute } = useToolExecutor()

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: [] }),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'fetch',
      description: '获取数据',
      protocol: 'http',
      method: 'GET',
      url: '/api/data'
    }

    await execute(tool, {})

    expect(fetch).toHaveBeenCalledWith(
      '/api/data',
      expect.not.objectContaining({
        body: expect.anything()
      })
    )
  })

  it('should execute navigate protocol tool', async () => {
    const { execute } = useToolExecutor()

    const tool: Tool = {
      name: 'goHome',
      description: '返回首页',
      protocol: 'navigate',
      target: '/'
    }

    const result = await execute(tool, {})

    expect(result.success).toBe(true)
    expect(result.navigateTo).toBe('/')
  })

  it('should execute navigate tool with params', async () => {
    const { execute } = useToolExecutor()

    const tool: Tool = {
      name: 'search',
      description: '搜索',
      protocol: 'navigate',
      target: '/search'
    }

    const result = await execute(tool, { q: 'test', page: 1 })

    expect(result.navigateTo).toBe('/search?q=test&page=1')
  })

  it('should handle http error response', async () => {
    const { execute } = useToolExecutor()

    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.resolve({ error: 'Server error' }),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'submit',
      description: '提交',
      protocol: 'http',
      method: 'POST',
      url: '/api/submit'
    }

    const result = await execute(tool, {})

    expect(result.success).toBe(false)
    expect(result.error).toContain('HTTP 500')
  })

  it('should use onError actions when http fails', async () => {
    const { execute } = useToolExecutor()

    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({}),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'submit',
      description: '提交',
      protocol: 'http',
      method: 'POST',
      url: '/api/submit',
      onError: [{ type: 'message', message: '提交失败', level: 'error' }]
    }

    const result = await execute(tool, {})

    expect(result.actions).toHaveLength(1)
    expect(result.actions?.[0].message).toBe('提交失败')
  })

  it('should use onSuccess actions when http succeeds', async () => {
    const { execute } = useToolExecutor()

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({}),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'submit',
      description: '提交',
      protocol: 'http',
      method: 'POST',
      url: '/api/submit',
      onSuccess: [{ type: 'message', message: '提交成功', level: 'success' }]
    }

    const result = await execute(tool, {})

    expect(result.actions).toHaveLength(1)
    expect(result.actions?.[0].message).toBe('提交成功')
  })

  it('should handle mcp protocol (not implemented)', async () => {
    const { execute } = useToolExecutor()

    const tool: Tool = {
      name: 'mcpTool',
      description: 'MCP 工具',
      protocol: 'mcp'
    }

    const result = await execute(tool, {})

    expect(result.success).toBe(false)
    expect(result.error).toContain('尚未实现')
  })

  it('should handle unknown protocol', async () => {
    const { execute } = useToolExecutor()

    const tool: Tool = {
      name: 'unknown',
      description: '未知协议',
      protocol: 'unknown' as any
    }

    const result = await execute(tool, {})

    expect(result.success).toBe(false)
    expect(result.error).toContain('未知协议')
  })

  it('should handle network error', async () => {
    const { execute } = useToolExecutor()

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const tool: Tool = {
      name: 'submit',
      description: '提交',
      protocol: 'http',
      method: 'POST',
      url: '/api/submit'
    }

    const result = await execute(tool, {})

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network error')
  })

  it('should merge args from multiple sources', () => {
    const { mergeArgs } = useToolExecutor()

    const tool: Tool = {
      name: 'test',
      description: '测试',
      protocol: 'http',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }

    const merged = mergeArgs(
      tool,
      { name: 'explicit' },
      {
        formData: { name: 'form', age: 25 },
        currentData: { email: 'test@example.com' }
      }
    )

    expect(merged.name).toBe('explicit') // 显式参数优先级最高
    expect(merged.age).toBe(25) // 来自 formData
    expect(merged.email).toBe('test@example.com') // 来自 currentData
  })

  it('should save token from response', async () => {
    const { execute } = useToolExecutor()

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        access_token: 'test-token',
        refresh_token: 'test-refresh'
      }),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'login',
      description: '登录',
      protocol: 'http',
      method: 'POST',
      url: '/api/login'
    }

    await execute(tool, { username: 'admin', password: '123456' })

    expect(localStorage.getItem('auth_token')).toBe('test-token')
  })

  it('should include auth headers when token exists', async () => {
    const { execute } = useToolExecutor()

    localStorage.setItem('auth_token', 'existing-token')

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({}),
      headers: new Headers({ 'content-type': 'application/json' })
    }

    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const tool: Tool = {
      name: 'fetch',
      description: '获取',
      protocol: 'http',
      method: 'GET',
      url: '/api/data'
    }

    await execute(tool, {})

    expect(fetch).toHaveBeenCalledWith(
      '/api/data',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer existing-token'
        })
      })
    )
  })
})
