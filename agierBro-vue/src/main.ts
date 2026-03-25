import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vTouch, vLongPress } from './directives/touch'
import { vLazy } from './directives/lazy'
import { useAppStore } from './stores/app'

const app = createApp(App)
const pinia = createPinia()

// 初始化应用状态
const appStore = useAppStore(pinia)
appStore.init()

// 注册全局指令
app.directive('touch', vTouch)
app.directive('longpress', vLongPress)
app.directive('lazy', vLazy)

app.use(pinia)
app.use(router)
app.mount('#app')

// 性能监控（生产环境）
if (import.meta.env.PROD) {
  // 监听长任务
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration, 'ms')
        }
      })
    })
    observer.observe({ entryTypes: ['longtask'] })
  }
}
