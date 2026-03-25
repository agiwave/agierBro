import type { Field, DataObject } from '@/types'

export interface FieldComplexity {
  totalFields: number
  simpleFields: number
  complexFields: number
  maxDepth: number
  hasNestedObjects: boolean
  hasArrays: boolean
}

export type UILayoutMode = 'simple' | 'advanced' | 'tabs' | 'steps'

export function analyzeComplexity(properties: Record<string, Field>, depth: number = 1): FieldComplexity {
  const result: FieldComplexity = { totalFields: 0, simpleFields: 0, complexFields: 0, maxDepth: depth, hasNestedObjects: false, hasArrays: false }
  for (const field of Object.values(properties)) {
    result.totalFields++
    if (field.type === 'object' && field.properties) {
      result.complexFields++
      result.hasNestedObjects = true
      const nested = analyzeComplexity(field.properties, depth + 1)
      result.maxDepth = Math.max(result.maxDepth, nested.maxDepth)
    } else if (field.type === 'array') {
      result.complexFields++
      result.hasArrays = true
      if (field.items?.type === 'object' && field.items.properties) {
        const nested = analyzeComplexity(field.items.properties, depth + 1)
        result.maxDepth = Math.max(result.maxDepth, nested.maxDepth)
      }
    } else {
      result.simpleFields++
    }
  }
  return result
}

export function determineUILayout(properties: Record<string, Field>, data?: DataObject): UILayoutMode {
  const complexity = analyzeComplexity(properties)
  if (complexity.totalFields <= 5 && complexity.complexFields === 0) return 'simple'
  if (complexity.maxDepth >= 3) return 'steps'
  if (complexity.hasNestedObjects || complexity.hasArrays) return 'tabs'
  if (complexity.totalFields > 10) {
    const hasDefaults = Object.values(properties).some(f => f.default !== undefined)
    if (hasDefaults) return 'advanced'
  }
  return 'simple'
}

export function getSimpleFields(properties: Record<string, Field>): string[] {
  return Object.entries(properties).filter(([_, f]) => !['object', 'array'].includes(f.type)).map(([key]) => key)
}

export function getComplexFields(properties: Record<string, Field>): Array<{ key: string; field: Field; type: 'object' | 'array' }> {
  return Object.entries(properties).filter(([_, f]) => f.type === 'object' || f.type === 'array').map(([key, field]) => ({ key, field, type: field.type as 'object' | 'array' }))
}

export function getFieldsWithDefaults(properties: Record<string, Field>): string[] {
  return Object.entries(properties).filter(([_, f]) => f.default !== undefined).map(([key]) => key)
}

export function generateTabsConfig(properties: Record<string, Field>): Array<{ key: string; label: string; fields: string[] }> {
  const tabs: Array<{ key: string; label: string; fields: string[] }> = []
  const simpleFields = getSimpleFields(properties)
  if (simpleFields.length > 0) tabs.push({ key: 'basic', label: '基本信息', fields: simpleFields })
  const complexFields = getComplexFields(properties)
  for (const { key, field } of complexFields) {
    tabs.push({
      key,
      label: field.title || formatLabel(key),
      fields: field.type === 'object' && field.properties ? Object.keys(field.properties) : [key]
    })
  }
  return tabs
}

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
