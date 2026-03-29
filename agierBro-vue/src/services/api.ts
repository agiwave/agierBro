/**
 * 增强的 API 服务 v3
 *
 * 核心设计理念：一切皆工具描述
 *
 * 功能：
 * - 自动携带 Token
 * - 请求缓存
 * - 自动重试（指数退避）
 * - 超时处理
 * - 统一错误处理
 * - 基于 in/out 的工具调用
 */

import type { Schema, DataObject, ToolDescriptor, ToolResponse, Action, PageDescriptor, Field } from '@/types'
import { getToken } from './auth'
import { handleNetworkError, handleHttpError } from './errorHandler'

// 缓存配置
const CACHE_ENABLED = true
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

// 重试配置
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 秒
const RETRY_BACKOFF = 2 // 指数退避因子

// 超时配置
const DEFAULT_TIMEOUT = 30000 // 30 秒

// 缓存存储
const cache = new Map<string, { data: any; timestamp: number }>()

/**
 * 请求选项接口
 */
export interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTTL?: number
}

/**
 * 构建请求选项（自动携带 Token）
 */
function buildRequestOptions(options?: RequestOptions): RequestInit {
  const requestInit: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  }

  // 自动携带 Token
  const token = getToken()
  if (token) {
    (requestInit.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  // 添加请求体
  if (options?.body && options.method !== 'GET') {
    requestInit.body = JSON.stringify(options.body)
  }

  return requestInit
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 超时处理
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

/**
 * 检查缓存是否有效
 */
function isCacheValid(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp < ttl
}

/**
 * 从缓存获取数据
 */
function getFromCache<T>(key: string): T | null {
  if (!CACHE_ENABLED) return null

  const cached = cache.get(key)
  if (cached && isCacheValid(cached.timestamp, CACHE_TTL)) {
    return cached.data as T
  }

  // 清除过期缓存
  if (cached) {
    cache.delete(key)
  }
  return null
}

/**
 * 设置缓存
 */
function setCache(key: string, data: any): void {
  if (!CACHE_ENABLED) return
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * 清除缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * 通用请求方法（带重试和超时）
 */
async function request<T>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  const cacheKey = `${options?.method || 'GET'}:${url}`
  const useCache = options?.cache !== false
  const timeout = options?.timeout || DEFAULT_TIMEOUT
  const maxRetries = options?.retries ?? MAX_RETRIES

  // 尝试从缓存获取（仅 GET 请求）
  if (useCache && options?.method !== 'POST' && options?.method !== 'PUT') {
    const cached = getFromCache<T>(cacheKey)
    if (cached) {
      console.log('[API] Cache hit:', url)
      return cached
    }
  }

  let lastError: Error | null = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      console.log(`[API] Request ${attempt + 1}/${maxRetries + 1}:`, url)

      const requestInit = buildRequestOptions(options)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...requestInit,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 处理 HTTP 错误
      const httpError = handleHttpError(response)
      if (httpError) {
        // 401/403 不重试
        if (httpError.code === 'UNAUTHORIZED' || httpError.code === 'FORBIDDEN') {
          throw new Error(httpError.message)
        }
        // 5xx 错误可以重试
        if (httpError.level === 'critical') {
          throw new Error(httpError.message)
        }
      }

      // 解析响应
      const contentType = response.headers.get('content-type')
      let data: T

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text() as unknown as T
      }

      // 缓存成功响应
      if (useCache && response.ok) {
        setCache(cacheKey, data)
      }

      return data
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // 检查是否是网络错误
      if (!navigator.onLine) {
        const networkError = handleNetworkError(lastError)
        lastError = new Error(networkError.message)
      }

      // 超时错误不重试
      if (lastError.message.includes('timeout') || lastError.message.includes('abort')) {
        break
      }

      // 4xx 错误不重试
      if (lastError.message.includes('401') || lastError.message.includes('403') || lastError.message.includes('404')) {
        break
      }

      attempt++

      // 重试前延迟（指数退避）
      if (attempt <= maxRetries) {
        const delayMs = RETRY_DELAY * Math.pow(RETRY_BACKOFF, attempt - 1)
        console.log(`[API] Retry in ${delayMs}ms...`)
        await delay(delayMs)
      }
    }
  }

  // 所有重试失败
  throw lastError || new Error('Request failed')
}

/**
 * GET 请求
 */
export async function get<T>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return request<T>(url, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export async function post<T>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(url, { ...options, method: 'POST', body })
}

/**
 * PUT 请求
 */
export async function put<T>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(url, { ...options, method: 'PUT', body })
}

/**
 * DELETE 请求
 */
export async function del<T>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return request<T>(url, { ...options, method: 'DELETE' })
}

/**
 * 获取页面数据（工具描述）
 * 
 * 一切皆工具描述：
 * - 每个接口返回的都是工具的描述
 * - in: 输入参数（有值=需要表单，无值=直接展示数据）
 * - out: 输出数据结构
 * 
 * 统一路由规则：
 * - / → /api/index.json
 * - /xxx/yyy/zzz → /api/xxx/yyy/zzz.json
 */
export async function fetchPageData(path: string): Promise<PageDescriptor> {
  const url = `/api/${path}.json`
  console.log('[API] Fetch page:', url)
  return get<PageDescriptor>(url)
}

/**
 * 提取输出 Schema
 */
export function extractOutSchema(data: PageDescriptor): Schema | null {
  const schema = data._schema
  if (!schema) return null
  
  const out = schema.out
  if (!out) return null
  if (typeof out === 'object' && out.type) return out as Schema
  
  // 转换为标准 Schema
  return {
    type: 'object',
    properties: out as Record<string, Field>
  }
}

/**
 * 提取输入 Schema
 */
export function extractInSchema(data: PageDescriptor): Schema | null {
  const schema = data._schema
  if (!schema) return null
  
  const input = schema.in
  if (!input) return null
  if (typeof input === 'object' && input.type) return input as Schema
  
  // 转换为标准 Schema
  return {
    type: 'object',
    properties: input as Record<string, Field>
  }
}

/**
 * 判断是否需要输入（有输入参数 = 需要表单）
 * 
 * 核心判断逻辑：
 * - in 为空或无 in 字段 → 数据工具 → 直接展示数据
 * - in 有定义且包含 required 字段 → 表单工具 → 呈现表单
 */
export function needsInput(data: PageDescriptor): boolean {
  const schema = data._schema
  if (!schema) return false
  
  const input = schema.in
  if (!input) return false
  
  // 检查是否有必填字段
  if (typeof input === 'object') {
    const props = input.properties || input as Record<string, Field>
    return Object.values(props).some(f => f.required === true)
  }
  
  return false
}

/**
 * 判断是否是数据工具（无需输入）
 */
export function isDataTool(data: PageDescriptor): boolean {
  return !needsInput(data)
}

/**
 * 执行工具调用
 */
export async function executeTool(
  tool: ToolDescriptor,
  inputData?: Record<string, any>
): Promise<ToolResponse> {
  console.log('[API] Execute tool:', tool, inputData)

  try {
    let result: ToolResponse

    switch (tool.protocol) {
      case 'http': {
        // HTTP 协议工具
        const options: RequestOptions = {
          method: tool.method || 'POST',
          body: inputData
        }

        if (!tool.url) {
          throw new Error('Tool URL is required for HTTP protocol')
        }

        const responseData = await request<any>(tool.url, options)
        
        result = {
          success: true,
          data: responseData,
          actions: tool.tools?.[0]?.tools ? [] : []
        }
        break
      }

      case 'navigate': {
        // 导航协议工具
        result = {
          success: true,
          actions: [{
            type: 'navigate',
            target: tool.target
          }]
        }
        break
      }

      default:
        throw new Error(`Unsupported protocol: ${tool.protocol}`)
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    }
  }
}

/**
 * 执行动作
 */
export async function executeAction(
  action: Action,
  callbacks?: {
    onNavigate?: (target: string) => void
    onReload?: () => Promise<void>
    onBack?: () => void
    onMessage?: (message: string, level: string) => void
  }
): Promise<void> {
  console.log('[API] Execute action:', action)

  switch (action.type) {
    case 'navigate':
      if (action.target && callbacks?.onNavigate) {
        callbacks.onNavigate(action.target)
      }
      break
    case 'reload':
      if (callbacks?.onReload) {
        await callbacks.onReload()
      }
      break
    case 'back':
      if (callbacks?.onBack) {
        callbacks.onBack()
      }
      break
    case 'message':
      if (action.message && callbacks?.onMessage) {
        callbacks.onMessage(action.message, action.level || 'info')
      }
      break
  }
}

/**
 * 保存数据
 */
export async function saveData(url: string, data: DataObject): Promise<DataObject> {
  // 保存后清除相关缓存
  clearCache()
  return post<DataObject>(url, data)
}

/**
 * 执行状态转换
 */
export async function transition(url: string, event: string): Promise<DataObject> {
  return post<DataObject>(url, { event })
}
