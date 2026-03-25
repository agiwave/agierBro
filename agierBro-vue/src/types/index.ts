/**
 * AgierBro 核心类型定义 - 协议 v4.1
 * 
 * 核心原则:
 * - 统一语义类型体系，所有类型平级
 * - 无特殊前缀，无分类注释
 * - Schema 定义结构，语义决定渲染
 * - 简化类型定义，删除冗余
 */

// ========== 统一的语义类型体系 ==========
// 所有语义类型平级，无分类注释
export type SemanticType =
  | 'nav' | 'tree' | 'tabs'
  | 'hero' | 'stats' | 'features'
  | 'cta' | 'footer' | 'content' | 'list'
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
  semantic?: SemanticType  // 字段语义
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
  _address?: string
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
  | 'file'  // 文件类型

// 文件字段扩展
export interface FileField extends Field {
  type: 'file'
  accept?: string        // 接受的文件类型
  maxSize?: number       // 最大文件大小（字节）
  maxFiles?: number      // 最大文件数量
  uploadUrl?: string     // 上传地址
  downloadUrl?: string   // 下载基础 URL
}

// ========== Schema 引用 ==========
// 支持两种格式：
// 1. 简化格式：_schema: "nav"
// 2. 标准格式：_schema: { type: 'object', semantic: 'nav' }
export type SchemaRef = string | Schema

// ========== 自定义 Schema（对象） ==========
export interface Schema {
  type: 'object' | 'array'
  title?: string
  description?: string
  properties: Record<string, Field>
  order?: string[]
  groups?: FieldGroup[]
  tools?: Tool[]
  semantic?: SemanticType  // Schema 语义类型（用于区块识别）
}

// ========== 树节点 ==========
export interface TreeNode {
  title: string
  icon?: string
  content?: string | Record<string, any>
  children?: TreeNode[]
  _loaded?: boolean
}

// ========== 行动（Action） ==========
export interface Action {
  type: 'navigate' | 'reload' | 'back' | 'message' | 'custom'
  target?: string
  message?: string
  level?: 'success' | 'error' | 'info' | 'warning'
  custom?: string
}

// ========== Tool 定义（简化版） ==========
export interface Tool {
  name: string
  description: string
  parameters?: Schema
  protocol: 'http' | 'mcp' | 'navigate'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  target?: string  // navigate 协议用
  onSuccess?: Action[]
  onError?: Action[]
}

// ========== Data Object ==========
export interface DataObject {
  [key: string]: any
  _schema?: SchemaRef
  _tools?: Tool[]
  items?: DataObject[]
}

// ========== Tool Response ==========
export interface ToolResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  actions?: Action[]
  navigateTo?: string
  reload?: boolean
}
