import { httpBatchLink } from '@ap0nia/eden-vue-query'
import { VueQueryPlugin } from '@tanstack/vue-query'
import SuperJSON from 'superjson'
import { createApp } from 'vue'

import App from './App.vue'
import { eden } from './lib/eden'
import router from './router'

const client = eden.createClient({
  links: [
    httpBatchLink({
      endpoint: '/api/batch',
      transformer: SuperJSON,
      domain: 'http://localhost:3000',
      maxURLLength: 123,
      method: 'POST',
    }),
  ],
})

const app = createApp(App)
app.use(VueQueryPlugin)
app.use(
  eden.plugin({
    client,
  }),
)
app.use(router)

app.mount('#app')
