import { createApp } from 'vue'

import App from './App.vue'
import { createEdenVueQueryPlugin } from './lib/eden'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(createEdenVueQueryPlugin())

app.mount('#app')
