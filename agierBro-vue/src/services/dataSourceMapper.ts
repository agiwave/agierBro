/**
 * 通用数据源地址映射器
 *
 * 核心设计理念：极简主义
 *
 * 映射规则（只有两条）：
 * 1. / → /api/index.json
 * 2. 其他所有路径 /xxx → /api/xxx.json（无论多少级）
 *
 * 示例：
 * - /                    → /api/index.json
 * - /users               → /api/users.json
 * - /users/001           → /api/users/001.json
 * - /editor/papers       → /api/editor/papers.json
 * - /editor/papers/001   → /api/editor/papers/001.json
 */

// ========== 类型定义 ==========

/**
 * 精确匹配规则
 */
export interface ExactRule {
  /** 前端路径 */
  path: string
  /** 后端数据源地址 */
  target: string
}

/**
 * 映射器配置
 */
export interface MapperConfig {
  /** API 基础路径 */
  apiBase: string
  /** 文件扩展名 */
  extension: string
  /** 精确匹配规则（用于特殊情况） */
  exactRules: ExactRule[]
  /** 需要忽略的路径前缀 */
  ignorePrefixes: string[]
}

// ========== 默认配置 ==========

const DEFAULT_CONFIG: MapperConfig = {
  apiBase: '/api',
  extension: '.json',
  exactRules: [
    // 首页
    { path: '/', target: '/api/index.json' }
  ],
  ignorePrefixes: ['@', 'src', 'node_modules', 'assets']
}

// ========== 核心映射器类 ==========

class DataSourceMapper {
  private config: MapperConfig

  constructor(config: Partial<MapperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 将前端 URL 映射到后端数据源地址
   *
   * @param path - 前端 URL 路径
   * @returns 后端数据源地址
   */
  map(path: string): string {
    // 1. 清理路径（移除查询参数和哈希）
    const cleanPath = path.split('?')[0].split('#')[0]

    // 2. 检查是否需要忽略
    if (this.shouldIgnore(cleanPath)) {
      return ''
    }

    // 3. 精确匹配（最高优先级）
    const exactMatch = this.config.exactRules.find(r => r.path === cleanPath)
    if (exactMatch) {
      return exactMatch.target
    }

    // 4. 默认规则：/xxx → /api/xxx.json
    return this.applyDefaultRule(cleanPath)
  }

  /**
   * 添加精确匹配规则
   */
  addExactRule(path: string, target: string): void {
    this.config.exactRules = this.config.exactRules.filter(r => r.path !== path)
    this.config.exactRules.push({ path, target })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MapperConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): MapperConfig {
    return { ...this.config }
  }

  // ========== 私有方法 ==========

  /**
   * 检查是否应该忽略
   */
  private shouldIgnore(path: string): boolean {
    const firstSegment = path.split('/')[1]
    return this.config.ignorePrefixes.some(prefix =>
      firstSegment.startsWith(prefix) || firstSegment === prefix
    )
  }

  /**
   * 应用默认规则：/xxx → /api/xxx.json
   */
  private applyDefaultRule(cleanPath: string): string {
    const { apiBase, extension } = this.config

    // 移除开头的 /
    const path = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath

    // 处理空路径
    if (!path) {
      return `${apiBase}/index${extension}`
    }

    // /xxx/yyy/zzz → /api/xxx/yyy/zzz.json
    return `${apiBase}/${path}${extension}`
  }
}

// ========== 导出单例 ==========

const mapper = new DataSourceMapper()

/**
 * 获取映射器实例
 */
export function getMapper(): DataSourceMapper {
  return mapper
}

/**
 * 映射前端 URL 到后端数据源地址（极简规则）
 *
 * 规则：
 * 1. / → /api/index.json
 * 2. /xxx → /api/xxx.json（无论多少级）
 *
 * @param path - 前端 URL 路径
 * @returns 后端数据源地址
 */
export function mapToDataSource(path: string): string {
  return mapper.map(path)
}

/**
 * 添加精确匹配规则
 */
export function addExactRule(path: string, target: string): void {
  mapper.addExactRule(path, target)
}

/**
 * 更新映射器配置
 */
export function updateMapperConfig(config: Partial<MapperConfig>): void {
  mapper.updateConfig(config)
}

export { DataSourceMapper }
export default mapToDataSource
