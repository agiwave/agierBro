/**
 * AgierBro 核心类型定义 - 协议 v6.0 (纯工具描述)
 *
 * 核心原则:
 * - 一切皆工具描述：所有接口返回的都是工具的 Schema
 * - in: 工具的输入参数描述（调用工具需要什么）
 * - out: 工具的输出描述（工具返回什么数据）
 * - 前端根据 in 判断是否需要表单，根据 out 渲染数据
 */

// ========== 统一的语义类型体系 ==========
export type SemanticType =
  // 布局/结构类型
  | 'nav' | 'tree' | 'tabs'
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
  // 字段语义类型
  | 'id' | 'title' | 'name' | 'description'
  | 'status' | 'amount' | 'date' | 'time'
  | 'email' | 'phone' | 'url' | 'image' | 'file'
  | 'user' | 'category' | 'tag'
  | 'action' | 'link'

// ========== 枚举值 ==========
export interface EnumValue {
  value: string | number
  label: string
  color?: string
  disabled?: boolean
}

// ========== 字段分组定义 ==========
export interface FieldGroup {
  key: string
  title: string
  description?: string
  fields: string[]
  collapsed?: boolean
}

// ========== 字段定义 ==========
export interface Field {
  type: FieldType
  title?: string
  description?: string
  default?: any
  visible?: boolean
  readOnly?: boolean
  required?: boolean
  format?: string
  semantic?: SemanticType
  group?: string

  // 约束
  minLength?: number
  maxLength?: number
  pattern?: string
  minimum?: number
  maximum?: number
  enum?: EnumValue[]

  // 复杂类型
  items?: Field
  properties?: Record<string, Field>
}

// 基础字段类型
export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'date-time'
  | 'object'
  | 'array'
  | 'file'

// 文件字段扩展
export interface FileField extends Field {
  type: 'file'
  accept?: string
  maxSize?: number
  maxFiles?: number
  uploadUrl?: string
  downloadUrl?: string
}

// ========== Schema（对象结构定义） ==========
export interface Schema {
  type: 'object' | 'array'
  title?: string
  description?: string
  properties: Record<string, Field>
  order?: string[]
  groups?: FieldGroup[]
  semantic?: SemanticType
}

// ========== 工具描述（核心） ==========
/**
 * 工具描述 - 所有接口返回的统一格式
 *
 * 核心理念：
 * - 每个接口返回的都是工具的描述
 * - in: 输入参数（调用工具需要什么）- 为空表示无需输入，即"数据工具"
 * - out: 输出描述（工具返回什么）- 描述返回数据的结构
 * - tools: 可执行的后续操作列表
 *
 * 示例：
 * 1. 数据工具（无输入）：
 *    { in: {}, out: { users: [...] } }
 *    → 前端直接渲染 out 数据
 *
 * 2. 表单工具（有输入）：
 *    { in: { username, password }, out: { token } }
 *    → 前端呈现表单，提交后得到 out 数据
 */
export interface ToolDescriptor {
  // 工具描述 Schema
  _schema: {
    // 输入参数描述（调用工具需要什么）
    // 空对象或无此字段 = 无需输入 = 数据工具
    in?: Schema | Record<string, Field>
    
    // 输出描述（工具返回什么数据）
    // 描述返回数据的结构
    out: Schema | Record<string, Field>
  }
  
  // 工具执行协议（如何调用）
  protocol?: 'http' | 'navigate' | 'mcp'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string  // navigate 协议用
  
  // 可执行的后续操作
  tools?: ToolDescriptor[]
}

// ========== 行动（Action） ==========
export interface Action {
  type: 'navigate' | 'reload' | 'back' | 'message' | 'custom'
  target?: string
  message?: string
  level?: 'success' | 'error' | 'info' | 'warning'
  custom?: string
}

// ========== 工具响应 ==========
export interface ToolResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  actions?: Action[]
  navigateTo?: string
  reload?: boolean
}

// ========== 数据对象（工具返回的实际数据） ==========
export interface DataObject {
  [key: string]: any
}

// ========== 页面描述（接口响应） ==========
/**
 * 页面描述 - 服务端接口返回的统一格式
 *
 * 每个接口返回的都是工具描述，包含：
 * - _schema.in: 输入参数（有值=需要表单，无值=直接展示数据）
 * - _schema.out: 输出数据结构
 * - 实际数据（与 out schema 对应）
 * - tools: 后续可执行的操作
 */
export interface PageDescriptor extends DataObject {
  // 工具描述 Schema
  _schema: {
    in?: Schema | Record<string, Field>
    out: Schema | Record<string, Field>
  }
  
  // 后续可执行的操作
  _tools?: ToolDescriptor[]
  
  // 列表/集合数据
  items?: PageDescriptor[]
}

// ========== 树节点 ==========
export interface TreeNode {
  title: string
  icon?: string
  content?: string | Record<string, any>
  children?: TreeNode[]
  _loaded?: boolean
}

// ========== 向后兼容：Tool 类型别名 ==========
// v5.0 及以前版本使用 Tool 类型，v6.0 使用 ToolDescriptor
// 为保持向后兼容，保留 Tool 类型
export interface Tool {
  name: string
  displayName?: string
  description: string
  parameters?: Schema
  protocol: 'http' | 'mcp' | 'navigate' | 'data'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string
  onSuccess?: Action[]
  onError?: Action[]
}
