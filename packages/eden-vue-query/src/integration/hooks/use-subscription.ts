import type { EdenRequestParams, Unsubscribable } from '@ap0nia/eden'
import { skipToken } from '@tanstack/vue-query'
import { onUnmounted, ref } from 'vue'

import type { EdenContextState } from '../../context'

/**
 * @todo Eden-subscription?
 */
export interface EdenUseSubscriptionOptions<TOutput, TError> {
  enabled?: boolean
  onStarted?: () => void
  onData: (data: TOutput) => void
  onError?: (err: TError) => void
}

export function edenUseSubscription(
  path: readonly string[],
  input: any,
  opts: EdenUseSubscriptionOptions<any, any>,
  context: EdenContextState<any>,
) {
  const enabled = opts?.enabled ?? input !== skipToken

  const optsRef = ref(opts)

  const { client } = context
  let subscription: Unsubscribable
  let isStopped = false

  if (enabled) {


    const params: EdenRequestParams = { path: path.join('.'), ...input }

    subscription = client.subscription(params, {
      onStarted: () => {
        if (!isStopped) {
          optsRef.value.onStarted?.()
        }
      },
      onData: (data) => {
        if (!isStopped) {
          optsRef.value.onData(data)
        }
      },
      onError: (err) => {
        if (!isStopped) {
          optsRef.value.onError?.(err)
        }
      },
    })
  }

  onUnmounted(() => {
    return () => {
      isStopped = true
      subscription.unsubscribe()
    }
  })
}
