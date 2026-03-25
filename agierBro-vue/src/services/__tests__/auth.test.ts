import { describe, it, expect, beforeEach } from 'vitest'
import {
  initAuth,
  saveToken,
  saveUser,
  clearAuth,
  getToken,
  isAuthenticated,
  hasRole,
  hasPermission,
  getAuthHeaders
} from '@/services/auth'

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear()
    initAuth()
  })

  it('should initialize with no auth', () => {
    expect(isAuthenticated()).toBe(false)
    expect(getToken()).toBe(null)
  })

  it('should save and retrieve token', () => {
    const token = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() + 3600000
    }
    
    saveToken(token)
    expect(getToken()).toBe('test-token')
    expect(isAuthenticated()).toBe(true)
  })

  it('should save and retrieve user', () => {
    const user = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin'],
      permissions: ['user.manage']
    }
    
    saveUser(user)
    expect(hasRole('admin')).toBe(true)
    expect(hasPermission('user.manage')).toBe(true)
  })

  it('should clear auth', () => {
    saveToken({ accessToken: 'test-token' })
    clearAuth()
    expect(getToken()).toBe(null)
    expect(isAuthenticated()).toBe(false)
  })

  it('should get auth headers', () => {
    saveToken({ accessToken: 'test-token' })
    const headers = getAuthHeaders()
    expect(headers['Authorization']).toBe('Bearer test-token')
  })

  it('should check role correctly', () => {
    saveUser({
      id: '1',
      username: 'user',
      roles: ['editor']
    })
    expect(hasRole('admin')).toBe(false)
    expect(hasRole('editor')).toBe(true)
  })

  it('should check permission correctly', () => {
    saveUser({
      id: '1',
      username: 'user',
      permissions: ['post.create', 'post.edit']
    })
    expect(hasPermission('post.delete')).toBe(false)
    expect(hasPermission('post.create')).toBe(true)
  })
})
