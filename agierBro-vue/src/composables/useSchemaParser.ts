/**
 * Schema 解析器
 */
import type { Schema, Field, DataObject } from '@/types'

export interface ParsedField {
  key: string
  field: Field
  value: any
}

export function useSchemaParser() {
  function parseSchema(schema: Schema, data: DataObject = {}): ParsedField[] {
    const fields: ParsedField[] = []
    if (!schema.properties) return fields
    for (const [key, property] of Object.entries(schema.properties)) {
      fields.push({ key, field: property, value: data[key] !== undefined ? data[key] : getDefaultValue(property) })
    }
    return fields
  }
  
  function getDefaultValue(field: Field): any {
    if (field.default !== undefined) return field.default
    switch (field.type) {
      case 'string': return ''
      case 'number':
      case 'integer': return 0
      case 'boolean': return false
      case 'array': return []
      case 'object': return {}
      case 'date': return ''
      default: return null
    }
  }
  
  return { parseSchema, getDefaultValue }
}
