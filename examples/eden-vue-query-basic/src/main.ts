import { httpBatchLink } from '@ap0nia/eden-vue-query'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
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
const queryClient = new QueryClient()
const app = createApp(App)
app.use(VueQueryPlugin, {
  queryClient,
})
app.use(
  eden.plugin({
    client,
    queryClient,
  }),
)
app.use(router)

app.mount('#app')
