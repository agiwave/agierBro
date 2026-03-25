/**
 * 权限指令
 * 
 * 使用示例:
 * <button v-permission="'admin'">仅管理员可见</button>
 * <button v-permission="['admin', 'editor']">管理员或编辑可见</button>
 * <button v-permission="'admin'" type="role">仅管理员可见</button>
 */

import { hasPermission, hasRole } from '@/services/auth'

export const vPermission = {
  mounted(el: HTMLElement, binding: { value: string | string[]; arg?: string }) {
    updatePermission(el, binding)
  },
  updated(el: HTMLElement, binding: { value: string | string[]; arg?: string }) {
    updatePermission(el, binding)
  }
}

function updatePermission(el: HTMLElement, binding: { value: string | string[]; arg?: string }) {
  const type = binding.arg || 'permission'
  const value = binding.value
  
  let hasAccess = false
  
  if (type === 'role') {
    // 角色检查
    if (Array.isArray(value)) {
      hasAccess = value.some(role => hasRole(role))
    } else {
      hasAccess = hasRole(value)
    }
  } else {
    // 权限检查
    if (Array.isArray(value)) {
      hasAccess = value.some(permission => hasPermission(permission))
    } else {
      hasAccess = hasPermission(value)
    }
  }
  
  if (!hasAccess) {
    el.remove()
  }
}
