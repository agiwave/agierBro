/**
 * 全局错误处理
 */

export interface AppError {
  code: string
  message: string
  level?: 'info' | 'warning' | 'error' | 'critical'
  details?: Record<string, any>
}

export interface ErrorHandlerConfig {
  silent?: boolean
  onBeforeShow?: (error: AppError) => void
  onAfterShow?: (error: AppError) => void
}

// 错误日志
const errorLog: AppError[] = []

// 错误处理配置
let config: ErrorHandlerConfig = {}

/**
 * 配置错误处理器
 */
export function configureErrorHandler(newConfig: ErrorHandlerConfig) {
  config = { ...config, ...newConfig }
}

/**
 * 创建应用错误
 */
export function createError(
  code: string,
  message: string,
  level: 'info' | 'warning' | 'error' | 'critical' = 'error',
  details?: Record<string, any>
): AppError {
  return { code, message, level, details }
}

/**
 * 处理错误
 */
export function handleError(error: AppError | Error | unknown) {
  const appError = toAppError(error)
  
  // 记录日志
  errorLog.push(appError)
  console.error(`[${appError.code}] ${appError.message}`, appError.details)
  
  // 触发回调
  config.onBeforeShow?.(appError)
  
  // 显示错误（除非静默模式）
  if (!config.silent && appError.level !== 'info') {
    showError(appError)
  }
  
  config.onAfterShow?.(appError)
  
  return appError
}

/**
 * 转换为 AppError
 */
function toAppError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    return error as AppError
  }
  
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      level: 'error'
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
    level: 'error'
  }
}

/**
 * 显示错误
 */
function showError(error: AppError) {
  // 使用 Toast 显示（如果可用）
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app-error', { detail: error })
    window.dispatchEvent(event)
  }
}

/**
 * HTTP 错误处理
 */
export function handleHttpError(response: Response): AppError | null {
  if (response.ok) return null
  
  const status = response.status
  
  const errorMap: Record<number, { code: string; message: string }> = {
    400: { code: 'BAD_REQUEST', message: '请求参数错误' },
    401: { code: 'UNAUTHORIZED', message: '未授权，请登录' },
    403: { code: 'FORBIDDEN', message: '无权限访问' },
    404: { code: 'NOT_FOUND', message: '资源不存在' },
    500: { code: 'SERVER_ERROR', message: '服务器错误' },
    502: { code: 'BAD_GATEWAY', message: '网关错误' },
    503: { code: 'SERVICE_UNAVAILABLE', message: '服务不可用' }
  }
  
  const errorInfo = errorMap[status] || {
    code: `HTTP_${status}`,
    message: `HTTP 错误：${status}`
  }
  
  return {
    ...errorInfo,
    level: status >= 500 ? 'critical' : 'error'
  }
}

/**
 * 网络错误处理
 */
export function handleNetworkError(error: Error): AppError {
  // 检查是否是网络断开
  if (!navigator.onLine) {
    return {
      code: 'NETWORK_OFFLINE',
      message: '网络已断开，请检查网络连接',
      level: 'warning'
    }
  }
  
  // 检查是否是超时
  if (error.message.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: '请求超时，请重试',
      level: 'warning'
    }
  }
  
  return {
    code: 'NETWORK_ERROR',
    message: '网络错误，请检查网络连接',
    level: 'error'
  }
}

/**
 * 获取错误日志
 */
export function getErrorLog(): AppError[] {
  return [...errorLog]
}

/**
 * 清除错误日志
 */
export function clearErrorLog() {
  errorLog.length = 0
}

/**
 * 错误边界组件的错误处理
 */
export class ErrorBoundaryError extends Error {
  constructor(
    public code: string,
    message: string,
    public component: string
  ) {
    super(message)
  }
}
