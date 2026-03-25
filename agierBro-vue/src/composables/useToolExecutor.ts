import type { Tool, ToolResponse, Action, DataObject } from '@/types'
import { getToken, saveToken } from '@/services/auth'

export interface ToolExecuteContext {
  formData?: Record<string, any>
  currentData?: Record<string, any>
  baseUrl?: string
}

export interface ToolExecuteResult extends ToolResponse {
  data?: any
}

export function useToolExecutor() {
  /**
   * 执行 Tool
   *
   * @param tool - Tool 定义
   * @param args - 调用参数
   * @param context - 执行上下文（表单数据、当前数据、基础 URL）
   * @returns Tool 执行结果
   */
  async function execute(
    tool: Tool,
    args: Record<string, any>,
    context?: ToolExecuteContext
  ): Promise<ToolExecuteResult> {
    console.log('[ToolExecutor] Execute:', tool.name, args)

    const protocol = tool.protocol

    try {
      // HTTP 协议
      if (protocol === 'http' && tool.url) {
        const result = await executeHttp(tool, args, context)
        return result
      }

      // Navigate 协议
      if (protocol === 'navigate' && tool.target) {
        return executeNavigate(tool, args)
      }

      // MCP 协议
      if (protocol === 'mcp') {
        return executeMcp(tool, args, context)
      }

      return {
        success: false,
        error: `未知协议或未配置的参数：${protocol}`
      }
    } catch (error) {
      console.error('[ToolExecutor] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        actions: tool.onError || []
      }
    }
  }

  /**
   * 执行 HTTP 协议 Tool
   */
  async function executeHttp(
    tool: Tool,
    args: Record<string, any>,
    context?: ToolExecuteContext
  ): Promise<ToolExecuteResult> {
    const url = resolveUrl(tool.url || '', context?.baseUrl)
    const method = tool.method || 'POST'

    // 构建请求选项
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    }

    // GET 请求不使用 body
    if (method !== 'GET') {
      options.body = JSON.stringify(args)
    }

    const response = await fetch(url, options)

    // 处理响应
    let data: any
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    const isSuccess = response.ok

    // 保存 Token（如果响应中包含）
    if (isSuccess && data) {
      saveTokenFromResponse(data)
    }

    // 根据成功/失败选择 actions
    const actions: Action[] = []
    if (isSuccess && tool.onSuccess) {
      actions.push(...tool.onSuccess)
    } else if (!isSuccess && tool.onError) {
      actions.push(...tool.onError)
    }

    return {
      success: isSuccess,
      data,
      message: data?.message || (isSuccess ? '操作成功' : '操作失败'),
      actions,
      error: isSuccess ? undefined : `HTTP ${response.status}: ${response.statusText}`
    }
  }

  /**
   * 执行 Navigate 协议 Tool
   */
  function executeNavigate(
    tool: Tool,
    args: Record<string, any>
  ): ToolExecuteResult {
    // Navigate 协议可以携带参数
    const target = tool.target
    const params = new URLSearchParams(args).toString()

    return {
      success: true,
      navigateTo: params ? `${target}?${params}` : target,
      actions: tool.onSuccess || []
    }
  }

  /**
   * 执行 MCP 协议 Tool（预留）
   */
  async function executeMcp(
    tool: Tool,
    args: Record<string, any>,
    context?: ToolExecuteContext
  ): Promise<ToolExecuteResult> {
    // MCP (Model Context Protocol) 预留实现
    // 未来可以集成真实的 MCP 服务器
    console.warn('[ToolExecutor] MCP protocol is not fully implemented yet')

    return {
      success: false,
      error: 'MCP 协议尚未实现',
      actions: tool.onError || []
    }
  }

  /**
   * 解析 URL（支持相对路径和绝对路径）
   */
  function resolveUrl(url: string, baseUrl?: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    if (url.startsWith('/')) {
      return (baseUrl || '') + url
    }
    return (baseUrl || '') + '/' + url
  }

  /**
   * 获取认证头
   */
  function getAuthHeaders(): Record<string, string> {
    const token = getToken()
    if (token) {
      return { 'Authorization': `Bearer ${token}` }
    }
    return {}
  }

  /**
   * 从响应中保存 Token（如果存在）
   */
  function saveTokenFromResponse(data: any) {
    if (data?.access_token) {
      saveToken(data.access_token, data.refresh_token)
    }
  }

  /**
   * 合并参数（从多个来源）
   */
  function mergeArgs(
    tool: Tool,
    explicitArgs: Record<string, any>,
    context?: ToolExecuteContext
  ): Record<string, any> {
    const merged: Record<string, any> = {}

    // 从当前数据中获取参数
    if (context?.currentData && tool.parameters?.properties) {
      for (const [key, field] of Object.entries(tool.parameters.properties)) {
        if (context.currentData[key] !== undefined) {
          merged[key] = context.currentData[key]
        }
      }
    }

    // 从表单数据中获取参数
    if (context?.formData) {
      Object.assign(merged, context.formData)
    }

    // 显式参数优先级最高
    Object.assign(merged, explicitArgs)

    return merged
  }

  return {
    execute,
    mergeArgs
  }
}
