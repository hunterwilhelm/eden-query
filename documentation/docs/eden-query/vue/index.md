---
title: Eden-Vue-Query - ElysiaJS
head:
  - - meta
    - property: 'og:title'
      content: Eden-Vue-Query - ElysiaJS

  - - meta
    - name: 'description'
      content: Eden-Vue-Query - ElysiaJS

  - - meta
    - property: 'og:description'
      content: Eden-Vue-Query - ElysiaJS
---

# Eden-Vue-Query

Eden-Vue-Query offers a first class integration with Vue.
Under the hood this is simply a wrapper around the very popular [@tanstack/vue-query](https://tanstack.com/query/latest),
so we recommend that you familiarise yourself with Vue Query,
as their docs go in to much greater depth on its usage.

:::tip
If you are using Next.js we recommend using [our integration with that](../nextjs) instead
(WIP)
:::

### The Eden Vue Query Integration

#### Elysia Server Application

::: code-group

```typescript twoslash include eq-vue-index-application [server.ts]
import { Elysia, t } from 'elysia'
import { batchPlugin } from '@ap0nia/eden-vue-query'

export const app = new Elysia()
  .use(batchPlugin())
  .get(
    '/hello',
    (context) => {
      return { greeting: `Hello, ${context.query.name}!` }
    },
    {
      query: t.Object({
        name: t.String(),
      }),
    },
  )
  .post('/goodbye', () => {
    console.log('Goodbye!')
  })

export type App = typeof app
```

:::

#### Eden-Query Client Setup

::: code-group

```typescript twoslash include eq-vue-index-client [eden.ts]
// @noErrors
import {
  createEdenTreatyVueQuery,
  httpBatchLink,
  type InferTreatyQueryInput,
  type InferTreatyQueryOutput,
} from '@ap0nia/eden-vue-query'
import { QueryClient } from '@tanstack/vue-query'
import SuperJSON from 'superjson'

import type { App } from './server'

export const eden = createEdenTreatyVueQuery<App>({ abortOnUnmount: true })

export const queryClient = new QueryClient()

export const edenClient = eden.createClient({
  links: [
    httpBatchLink({
      domain: 'http://localhost:3000',
      transformer: SuperJSON,
    }),
  ],
})

export function createEdenVueQueryPlugin() {
  return eden.plugin({
    queryClient,
    client: edenClient,
  })
}
```

:::

Be sure to initialize the plugin in your Vue application:

::: code-group

```typescript twoslash [main.ts]
import { createApp } from 'vue'

import App from './App.vue'
import { createEdenVueQueryPlugin } from './eden'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(createEdenVueQueryPlugin())

app.mount('#app')
```

:::

This library enables usage directly within Vue components.

::: code-group

```vue [index.ts]
<script setup lang="ts">
import { eden } from './eden'

const helloQuery = eden.hello.get.useQuery({ name: 'Bob' })
const goodbyeMutation = eden.goodbye.post.useMutation()
</script>

<template>
  <div>
    <p>{{ helloQuery.data.value?.greeting }}</p>
    <button @click="goodbyeMutation.mutate">Say Goodbye</button>
  </div>
</template>
```

:::

### Differences to vanilla Vue Query

The wrapper abstracts some aspects of Vue Query for you:

- Query Keys - these are generated and managed by eden on your behalf, based on the procedure inputs you provide.
  - If you need the query key which eden calculates, you can use [getQueryKey](./getQueryKey).
- Type safe by default - the types you provide in your Elysia Backend also drive the types of your Vue Query client,
  providing safety throughout your Vue app.
