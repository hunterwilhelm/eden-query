import { createEdenTreatyVueQuery } from '@ap0nia/eden-vue-query'

import type { App } from '../../server'

export const eden = createEdenTreatyVueQuery<App>({
  abortOnUnmount: true,
})
