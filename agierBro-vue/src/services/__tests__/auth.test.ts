import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveToken,
  clearToken,
  getToken,
  getAuthHeaders
} from '@/services/auth'

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with no token', () => {
    expect(getToken()).toBe(null)
  })

  it('should save and retrieve token', () => {
    saveToken('test-token', 'test-refresh')
    expect(getToken()).toBe('test-token')
  })

  it('should clear token', () => {
    saveToken('test-token')
    clearToken()
    expect(getToken()).toBe(null)
  })

  it('should get auth headers', () => {
    saveToken('test-token')
    const headers = getAuthHeaders()
    expect(headers['Authorization']).toBe('Bearer test-token')
  })

  it('should return empty headers when no token', () => {
    const headers = getAuthHeaders()
    expect(headers).toEqual({})
  })
})
