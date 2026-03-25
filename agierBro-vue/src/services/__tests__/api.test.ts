import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearCache } from '@/services/api'

describe('API Service', () => {
  beforeEach(() => {
    clearCache()
  })

  it('should have clearCache function', () => {
    expect(clearCache).toBeDefined()
  })

  it('should clear specific cache key', () => {
    // Note: This is a basic test since the actual caching is internal
    expect(() => clearCache('/api/test')).not.toThrow()
  })

  it('should clear all cache', () => {
    expect(() => clearCache()).not.toThrow()
  })
})
