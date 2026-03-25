/**
 * 字段分组策略 - 协议 v2.0
 * 
 * 核心规则：
 * 1. 连续的简单字段合并为一组
 * 2. 复杂字段（object/array）独立分组
 * 3. 按 Schema 定义的 order 顺序呈现
 */

import type { Schema, Field, DataObject, FieldGroup } from '@/types'

export interface ParsedField {
  key: string
  field: Field
  value: any
}

export interface FieldSection {
  key: string
  title: string
  description?: string
  fields: ParsedField[]
  isComplex?: boolean
  collapsed?: boolean
}

/**
 * 判断是否为简单字段
 */
export function isSimpleField(field: Field): boolean {
  return ['string', 'number', 'integer', 'boolean', 'date', 'date-time'].includes(field.type)
}

/**
 * 解析单个字段
 */
export function parseField(key: string, field: Field, data: any): ParsedField {
  return {
    key,
    field,
    value: data !== undefined ? data : getDefaultValue(field)
  }
}

/**
 * 获取字段默认值
 */
export function getDefaultValue(field: Field): any {
  if (field.default !== undefined) return field.default
  switch (field.type) {
    case 'string':
    case 'date':
    case 'date-time':
      return ''
    case 'number':
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

/**
 * 格式化字段标签
 */
export function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * 获取字段顺序
 */
export function getFieldOrder(schema: Schema): string[] {
  if (schema.order && schema.order.length > 0) {
    return schema.order
  }
  
  if (schema.properties) {
    return Object.keys(schema.properties)
  }
  
  return []
}

/**
 * 字段分组算法（核心）
 * 
 * 规则：
 * 1. 如果有显式 groups 定义，按定义分组
 * 2. 否则自动分组：
 *    - 连续的简单字段合并为"基本信息"组
 *    - 每个复杂字段独立分组
 */
export function groupFields(schema: Schema, data: DataObject = {}): FieldSection[] {
  const sections: FieldSection[] = []
  const properties = schema.properties
  if (!properties) return sections
  
  const order = getFieldOrder(schema)
  
  // 优先使用显式分组定义
  if (schema.groups && schema.groups.length > 0) {
    return groupByExplicitGroups(schema, data, order)
  }
  
  // 自动分组
  let currentSimpleFields: ParsedField[] = []
  
  for (const key of order) {
    const field = properties[key]
    if (!field || field.visible === false) continue
    
    const parsedField = parseField(key, field, data[key])
    
    if (isSimpleField(field)) {
      // 简单字段：累积到当前组
      currentSimpleFields.push(parsedField)
    } else {
      // 复杂字段：先提交之前的简单字段组
      if (currentSimpleFields.length > 0) {
        sections.push({
          key: 'basic',
          title: '基本信息',
          fields: [...currentSimpleFields],
          isComplex: false
        })
        currentSimpleFields = []
      }
      
      // 添加复杂字段组
      sections.push({
        key,
        title: field.title || formatLabel(key),
        description: field.description,
        fields: [parsedField],
        isComplex: true
      })
    }
  }
  
  // 提交剩余的简单字段
  if (currentSimpleFields.length > 0) {
    sections.push({
      key: 'basic',
      title: '基本信息',
      fields: currentSimpleFields,
      isComplex: false
    })
  }
  
  return sections
}

/**
 * 按显式分组定义进行分组
 */
function groupByExplicitGroups(
  schema: Schema, 
  data: DataObject, 
  order: string[]
): FieldSection[] {
  const sections: FieldSection[] = []
  const properties = schema.properties!
  const groups = schema.groups!
  
  // 已分组的字段
  const groupedFields = new Set<string>()
  
  // 按分组定义添加
  for (const group of groups) {
    const fields: ParsedField[] = []
    
    for (const key of group.fields) {
      const field = properties[key]
      if (!field || field.visible === false) continue
      
      fields.push(parseField(key, field, data[key]))
      groupedFields.add(key)
    }
    
    if (fields.length > 0) {
      sections.push({
        key: group.key,
        title: group.title,
        description: group.description,
        fields,
        isComplex: fields.some(f => !isSimpleField(f.field)),
        collapsed: group.collapsed
      })
    }
  }
  
  // 添加未分组的字段到"其他"组
  const ungroupedFields: ParsedField[] = []
  for (const key of order) {
    if (!groupedFields.has(key)) {
      const field = properties[key]
      if (!field || field.visible === false) continue
      
      ungroupedFields.push(parseField(key, field, data[key]))
    }
  }
  
  if (ungroupedFields.length > 0) {
    sections.push({
      key: 'other',
      title: '其他',
      fields: ungroupedFields,
      isComplex: ungroupedFields.some(f => !isSimpleField(f.field))
    })
  }
  
  return sections
}

/**
 * 获取所有简单字段
 */
export function getSimpleFields(properties: Record<string, Field>): string[] {
  return Object.entries(properties)
    .filter(([_, field]) => isSimpleField(field))
    .map(([key]) => key)
}

/**
 * 获取所有复杂字段
 */
export function getComplexFields(
  properties: Record<string, Field>
): Array<{ key: string; field: Field; type: 'object' | 'array' }> {
  return Object.entries(properties)
    .filter(([_, field]) => field.type === 'object' || field.type === 'array')
    .map(([key, field]) => ({
      key,
      field,
      type: field.type as 'object' | 'array'
    }))
}

/**
 * 获取有默认值的字段
 */
export function getFieldsWithDefaults(properties: Record<string, Field>): string[] {
  return Object.entries(properties)
    .filter(([_, field]) => field.default !== undefined)
    .map(([key]) => key)
}

/**
 * 生成 Tabs 配置（用于复杂对象）
 */
export function generateTabsConfig(properties: Record<string, Field>): Array<{
  key: string
  label: string
  fields: string[]
}> {
  const tabs: Array<{ key: string; label: string; fields: string[] }> = []
  
  const simpleFields = getSimpleFields(properties)
  if (simpleFields.length > 0) {
    tabs.push({
      key: 'basic',
      label: '基本信息',
      fields: simpleFields
    })
  }
  
  const complexFields = getComplexFields(properties)
  for (const { key, field } of complexFields) {
    const tabFields = field.type === 'object' && field.properties
      ? Object.keys(field.properties)
      : [key]
    
    tabs.push({
      key,
      label: field.title || formatLabel(key),
      fields: tabFields
    })
  }
  
  return tabs
}
