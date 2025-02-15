import { httpBatchLink } from '@ap0nia/eden-vue-query'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'

import App from './App.vue'
import { eden } from './lib/eden'
import router from './router'

function getAuthCookie() {
  return undefined
}

const client = eden.createClient({
  links: [
    httpBatchLink({
      domain: 'http://localhost:3000',
      async headers() {
        return {
          authorization: getAuthCookie(),
        }
      },
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
