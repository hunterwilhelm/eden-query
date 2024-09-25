import {
  createEdenTreatyVueQuery,
  httpBatchLink,
  type InferTreatyQueryInput,
  type InferTreatyQueryOutput,
} from '@ap0nia/eden-vue-query'
import { QueryClient } from '@tanstack/vue-query'
import SuperJSON from 'superjson'

import type { App } from '../../server'

export const eden = createEdenTreatyVueQuery<App>({ abortOnUnmount: true })

export const queryClient = new QueryClient()

export type InferInput = InferTreatyQueryInput<App>

export type InferOutput = InferTreatyQueryOutput<App>

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
