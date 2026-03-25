/**
 * Section 组件注册系统 - 简化版
 * 只保留必要的内置组件注册
 */

// 使用 any 类型避免复杂的 Vue 组件类型问题
const sectionRegistry = new Map<string, any>()

/**
 * 注册 Section 组件
 */
export function registerSection(type: string, component: any) {
  sectionRegistry.set(type, component)
}

/**
 * 获取 Section 组件
 */
export function getSectionComponent(type: string): any {
  return sectionRegistry.get(type) || null
}

/**
 * 批量注册 Section 组件
 */
export function registerSections(sections: Record<string, any>) {
  Object.entries(sections).forEach(([type, component]) => {
    sectionRegistry.set(type, component)
  })
}

/**
 * 获取所有已注册的 Section 类型
 */
export function getRegisteredSectionTypes(): string[] {
  return Array.from(sectionRegistry.keys())
}
