/**
 * i18n 国际化配置 - 扁平化格式
 *
 * 支持中文和英文
 */

export interface Translation {
  [key: string]: string
}

// 中文语言包 - 使用扁平化键名
export const zhCN: Translation = {
  // 认证
  'auth.login': '登录',
  'auth.logout': '退出登录',
  'auth.register': '注册',
  'auth.forgotPassword': '忘记密码',
  'auth.rememberMe': '记住我',
  'auth.noAccount': '没有账号？',
  'auth.hasAccount': '已有账号？',

  // 通用
  'common.loading': '加载中...',
  'common.success': '成功',
  'common.error': '错误',
  'common.warning': '警告',
  'common.info': '提示',
  'common.confirm': '确认',
  'common.cancel': '取消',
  'common.submit': '提交',
  'common.save': '保存',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.create': '创建',
  'common.update': '更新',
  'common.search': '搜索',
  'common.reset': '重置',
  'common.back': '返回',
  'common.close': '关闭',
  'common.yes': '是',
  'common.no': '否',
  'common.ok': '确定',

  // 状态
  'status.active': '激活',
  'status.inactive': '未激活',
  'status.pending': '待处理',
  'status.approved': '已批准',
  'status.rejected': '已拒绝',
  'status.draft': '草稿',
  'status.published': '已发布',
  'status.archived': '已归档',

  // 验证
  'validation.required': '{field} 是必填项',
  'validation.email': '{field} 必须是有效的邮箱地址',
  'validation.url': '{field} 必须是有效的 URL',
  'validation.phone': '{field} 必须是有效的手机号',
  'validation.minLength': '{field} 长度不能少于 {min} 个字符',
  'validation.maxLength': '{field} 长度不能超过 {max} 个字符',
  'validation.min': '{field} 不能小于 {min}',
  'validation.max': '{field} 不能大于 {max}',
  'validation.pattern': '{field} 格式不正确',

  // 消息
  'message.saveSuccess': '保存成功',
  'message.saveFailed': '保存失败',
  'message.deleteSuccess': '删除成功',
  'message.deleteFailed': '删除失败',
  'message.submitSuccess': '提交成功',
  'message.submitFailed': '提交失败',
  'message.confirmDelete': '确认删除？',

  // 错误
  'error.networkOffline': '网络已断开，请检查网络连接',
  'error.timeout': '请求超时，请重试',
  'error.serverError': '服务器错误',
  'error.notFound': '资源不存在',
  'error.unauthorized': '未授权，请登录',
  'error.forbidden': '无权限访问',
  'error.badRequest': '请求参数错误'
}

// 英文语言包 - 使用扁平化键名
export const enUS: Translation = {
  // Auth
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'auth.register': 'Register',
  'auth.forgotPassword': 'Forgot Password',
  'auth.rememberMe': 'Remember Me',
  'auth.noAccount': "Don't have an account? ",
  'auth.hasAccount': 'Already have an account? ',

  // Common
  'common.loading': 'Loading...',
  'common.success': 'Success',
  'common.error': 'Error',
  'common.warning': 'Warning',
  'common.info': 'Info',
  'common.confirm': 'Confirm',
  'common.cancel': 'Cancel',
  'common.submit': 'Submit',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.update': 'Update',
  'common.search': 'Search',
  'common.reset': 'Reset',
  'common.back': 'Back',
  'common.close': 'Close',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',

  // Status
  'status.active': 'Active',
  'status.inactive': 'Inactive',
  'status.pending': 'Pending',
  'status.approved': 'Approved',
  'status.rejected': 'Rejected',
  'status.draft': 'Draft',
  'status.published': 'Published',
  'status.archived': 'Archived',

  // Validation
  'validation.required': '{field} is required',
  'validation.email': '{field} must be a valid email',
  'validation.url': '{field} must be a valid URL',
  'validation.phone': '{field} must be a valid phone number',
  'validation.minLength': '{field} must be at least {min} characters',
  'validation.maxLength': '{field} must be no more than {max} characters',
  'validation.min': '{field} must be at least {min}',
  'validation.max': '{field} must be no more than {max}',
  'validation.pattern': '{field} format is invalid',

  // Messages
  'message.saveSuccess': 'Saved successfully',
  'message.saveFailed': 'Failed to save',
  'message.deleteSuccess': 'Deleted successfully',
  'message.deleteFailed': 'Failed to delete',
  'message.submitSuccess': 'Submitted successfully',
  'message.submitFailed': 'Failed to submit',
  'message.confirmDelete': 'Are you sure you want to delete?',

  // Errors
  'error.networkOffline': 'Network disconnected, please check your connection',
  'error.timeout': 'Request timeout, please try again',
  'error.serverError': 'Server error',
  'error.notFound': 'Resource not found',
  'error.unauthorized': 'Unauthorized, please login',
  'error.forbidden': 'No permission to access',
  'error.badRequest': 'Invalid request parameters'
}
