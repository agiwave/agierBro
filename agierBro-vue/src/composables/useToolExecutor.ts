import type { Tool, ToolResponse, Action } from '@/types'

export function useToolExecutor() {
  async function execute(
    tool: Tool,
    args: Record<string, any>,
    context?: { formData?: Record<string, any>; currentData?: Record<string, any> }
  ): Promise<{ content: string }> {
    console.log('[ToolExecutor] Execute:', tool.name, args)

    const protocol = tool.protocol
    
    // HTTP 协议
    if (protocol === 'http' && tool.url) {
      try {
        const response = await fetch(tool.url, {
          method: tool.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        
        // 处理响应中的 actions
        const actions: Action[] = []
        if (data.success && tool.onSuccess) {
          actions.push(...tool.onSuccess)
        } else if (!data.success && tool.onError) {
          actions.push(...tool.onError)
        }
        
        return { 
          content: JSON.stringify({ 
            ...data, 
            actions 
          }) 
        }
      } catch (e) {
        return { 
          content: JSON.stringify({ 
            success: false, 
            error: e instanceof Error ? e.message : 'Unknown error' 
          }) 
        }
      }
    }
    
    // Navigate 协议
    if (protocol === 'navigate' && tool.target) {
      return { 
        content: JSON.stringify({ 
          success: true, 
          navigateTo: tool.target 
        }) 
      }
    }
    
    // MCP 协议（预留）
    if (protocol === 'mcp') {
      return { 
        content: JSON.stringify({ 
          success: false, 
          error: 'MCP protocol not implemented' 
        }) 
      }
    }
    
    return { 
      content: JSON.stringify({ 
        success: false, 
        error: 'Unknown protocol' 
      }) 
    }
  }
  
  return { execute }
}
