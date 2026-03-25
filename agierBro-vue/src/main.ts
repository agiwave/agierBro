import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vTouch, vLongPress } from './directives/touch'

const app = createApp(App)

// 注册全局指令
app.directive('touch', vTouch)
app.directive('longpress', vLongPress)

app.use(createPinia())
app.use(router)
app.mount('#app')
