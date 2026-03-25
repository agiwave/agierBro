/**
 * 请求缓存服务
 * 
 * 缓存 API 请求结果，避免重复请求
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expires: number
}

export interface CacheConfig {
  defaultTTL?: number  // 默认缓存时间 (ms)
  maxSize?: number     // 最大缓存条目
}

class RequestCache {
  private cache = new Map<string, CacheItem<any>>()
  private config: Required<CacheConfig>

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 分钟
      maxSize: config.maxSize || 100
    }
  }

  /**
   * 生成缓存键
   */
  private generateKey(url: string, params?: Record<string, any>): string {
    if (!params) return url
    const queryString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${url}?${queryString}`
  }

  /**
   * 获取缓存
   */
  get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, params)
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() > item.timestamp + item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }

  /**
   * 设置缓存
   */
  set<T>(url: string, data: T, params?: Record<string, any>, ttl?: number): void {
    const key = this.generateKey(url, params)
    
    // 检查缓存大小
    if (this.cache.size >= this.config.maxSize) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: ttl || this.config.defaultTTL
    })
  }

  /**
   * 清除缓存
   */
  clear(url?: string): void {
    if (url) {
      // 清除特定 URL 的缓存（包括带参数的）
      for (const key of this.cache.keys()) {
        if (key.startsWith(url)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL
    }
  }
}

// 导出单例
export const requestCache = new RequestCache({
  defaultTTL: 5 * 60 * 1000,
  maxSize: 100
})

export default RequestCache
