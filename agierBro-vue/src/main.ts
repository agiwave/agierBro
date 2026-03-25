import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vTouch, vLongPress } from './directives/touch'
import { vPermission } from './directives/permission'
import { initAuth } from './services/auth'

const app = createApp(App)
const pinia = createPinia()

// 初始化认证
initAuth()

// 注册全局指令
app.directive('touch', vTouch)
app.directive('longpress', vLongPress)
app.directive('permission', vPermission)

app.use(pinia)
app.use(router)
app.mount('#app')
