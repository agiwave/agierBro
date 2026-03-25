import { describe, it, expect } from 'vitest'
import { mapToDataSource, addExactRule } from '@/services/dataSourceMapper'

describe('DataSourceMapper', () => {
  it('should map / to /api/index.json', () => {
    expect(mapToDataSource('/')).toBe('/api/index.json')
  })

  it('should map /users to /api/users.json', () => {
    expect(mapToDataSource('/users')).toBe('/api/users.json')
  })

  it('should map nested paths correctly', () => {
    expect(mapToDataSource('/editor/papers/paper-001'))
      .toBe('/api/editor/papers/paper-001.json')
  })

  it('should handle query parameters', () => {
    expect(mapToDataSource('/users?page=1')).toBe('/api/users.json')
  })

  it('should handle hash', () => {
    expect(mapToDataSource('/users#section')).toBe('/api/users.json')
  })

  it('should ignore src paths', () => {
    expect(mapToDataSource('/src/main.ts')).toBe('')
  })

  it('should ignore node_modules', () => {
    expect(mapToDataSource('/node_modules/vue')).toBe('')
  })

  it('should add exact rules', () => {
    addExactRule('/custom', '/api/custom.json')
    expect(mapToDataSource('/custom')).toBe('/api/custom.json')
  })
})
