import { describe, it, expect, vi } from 'vitest'
import {
  createError,
  handleError,
  handleHttpError,
  handleNetworkError,
  getErrorLog,
  clearErrorLog,
  configureErrorHandler,
  ErrorBoundaryError
} from '@/services/errorHandler'

describe('errorHandler', () => {
  it('should create error object', () => {
    const error = createError('TEST_ERROR', 'Test message', 'warning', { detail: 'test' })

    expect(error.code).toBe('TEST_ERROR')
    expect(error.message).toBe('Test message')
    expect(error.level).toBe('warning')
    expect(error.details?.detail).toBe('test')
  })

  it('should handle Error object', () => {
    const testError = new Error('Test error')
    const result = handleError(testError)

    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.message).toBe('Test error')
    expect(result.level).toBe('error')
  })

  it('should handle string error', () => {
    const result = handleError('Something went wrong')

    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.message).toBe('Something went wrong')
  })

  it('should handle AppError object', () => {
    const appError = {
      code: 'CUSTOM_ERROR',
      message: 'Custom message',
      level: 'warning' as const
    }

    const result = handleError(appError)

    expect(result.code).toBe('CUSTOM_ERROR')
    expect(result.message).toBe('Custom message')
  })

  it('should log errors', () => {
    clearErrorLog()

    const error = createError('TEST', 'Test')
    handleError(error)

    const log = getErrorLog()
    expect(log.length).toBeGreaterThan(0)
    expect(log[log.length - 1].code).toBe('TEST')
  })

  it('should clear error log', () => {
    handleError(createError('TEST', 'Test'))
    clearErrorLog()

    expect(getErrorLog().length).toBe(0)
  })

  it('should handle HTTP 400 error', () => {
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('BAD_REQUEST')
    expect(error?.message).toContain('请求参数')
  })

  it('should handle HTTP 401 error', () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('UNAUTHORIZED')
    expect(error?.message).toContain('登录')
  })

  it('should handle HTTP 403 error', () => {
    const mockResponse = {
      ok: false,
      status: 403,
      statusText: 'Forbidden'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('FORBIDDEN')
    expect(error?.message).toContain('权限')
  })

  it('should handle HTTP 404 error', () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('NOT_FOUND')
    expect(error?.message).toContain('不存在')
  })

  it('should handle HTTP 500 error', () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('SERVER_ERROR')
    expect(error?.message).toContain('服务器')
    expect(error?.level).toBe('critical')
  })

  it('should handle HTTP 502 error', () => {
    const mockResponse = {
      ok: false,
      status: 502,
      statusText: 'Bad Gateway'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('BAD_GATEWAY')
  })

  it('should handle HTTP 503 error', () => {
    const mockResponse = {
      ok: false,
      status: 503,
      statusText: 'Service Unavailable'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('SERVICE_UNAVAILABLE')
  })

  it('should handle unknown HTTP error', () => {
    const mockResponse = {
      ok: false,
      status: 999,
      statusText: 'Unknown'
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error?.code).toBe('HTTP_999')
  })

  it('should return null for OK response', () => {
    const mockResponse = {
      ok: true,
      status: 200
    } as Response

    const error = handleHttpError(mockResponse)

    expect(error).toBeNull()
  })

  it('should handle network offline error', () => {
    // 模拟离线状态
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

    const networkError = new Error('Failed to fetch')
    const result = handleNetworkError(networkError)

    expect(result.code).toBe('NETWORK_OFFLINE')
    expect(result.message).toContain('断开')

    // 恢复
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine })
  })

  it('should handle timeout error', () => {
    const timeoutError = new Error('Request timeout')
    const result = handleNetworkError(timeoutError)

    expect(result.code).toBe('TIMEOUT')
    expect(result.message).toContain('超时')
  })

  it('should handle generic network error', () => {
    const networkError = new Error('Network error')
    const result = handleNetworkError(networkError)

    expect(result.code).toBe('NETWORK_ERROR')
    expect(result.message).toContain('网络')
  })

  it('should configure error handler', () => {
    const onBeforeShow = vi.fn()
    const onAfterShow = vi.fn()

    configureErrorHandler({
      silent: true,
      onBeforeShow,
      onAfterShow
    })

    const error = createError('TEST', 'Test')
    handleError(error)

    expect(onBeforeShow).toHaveBeenCalledWith(expect.objectContaining({ code: 'TEST' }))
    expect(onAfterShow).toHaveBeenCalledWith(expect.objectContaining({ code: 'TEST' }))
  })

  it('should create ErrorBoundaryError', () => {
    const error = new ErrorBoundaryError('COMPONENT_ERROR', 'Component failed', 'MyComponent')

    expect(error.code).toBe('COMPONENT_ERROR')
    expect(error.message).toBe('Component failed')
    expect(error.component).toBe('MyComponent')
  })
})
