import {
  EdenClient,
  type EdenClientError,
  type EdenCreateClient,
  httpBatchLink,
  type HttpBatchLinkOptions,
  httpLink,
  type HTTPLinkOptions,
  type InferRouteOptions,
} from '@ap0nia/eden'
import {
  type SkipToken,
  useInfiniteQuery as __useInfiniteQuery,
  useQueries as __useQueries,
  type UseQueriesOptions,
  useQuery as __useQuery,
  useQueryClient
} from '@tanstack/vue-query'
import type { AnyElysia } from 'elysia'
import { inject, type InjectionKey, type MaybeRef } from 'vue'

import type { EdenQueryConfig } from '../../config'
import type { EdenContextProps, EdenContextState, EdenProvider as EdenPlugin } from '../../context'
import { createUtilityFunctions, EdenQueryInjectionKey } from '../../context'
import { type EdenUseInfiniteQueryOptions, edenUseInfiniteQueryOptions, type EdenUseInfiniteQueryResult } from '../../integration/hooks/use-infinite-query'
import type {
  EdenUseMutationOptions,
  EdenUseMutationResult,
} from '../../integration/hooks/use-mutation'
import { getEdenUseMutationOptions, useEdenMutation } from '../../integration/hooks/use-mutation'
import {
  type EdenUseQueryOptions,
  edenUseQueryOptions,
  type EdenUseQueryResult,
} from '../../integration/hooks/use-query'
import { edenUseSubscription, type EdenUseSubscriptionOptions } from '../../integration/hooks/use-subscription'
import { parsePathsAndMethod } from '../../integration/internal/parse-paths-and-method'
import { getEdenQueryExtension } from '../../integration/internal/query-hook-extension'
import { createEdenTreatyQueryUtils } from './query-utils'
import { createTreatyUseQueriesProxy, type EdenTreatyUseQueries } from './use-queries'

export function createEdenTreatyQueryRootHooks<
  TElysia extends AnyElysia,
  TError = EdenClientError<TElysia>,
>(config?: EdenQueryConfig<TElysia>) {
  type ProviderContext = EdenContextState<TElysia>

  const Context = EdenQueryInjectionKey as InjectionKey<ProviderContext>

  const createClient: EdenCreateClient<TElysia> = (options) => {
    return new EdenClient(options)
  }

  const createHttpClient = (options?: HTTPLinkOptions) => {
    return new EdenClient({
      links: [httpLink(options)],
    })
  }

  /**
   * @warning
   * Ensure that the Elysia.js server uses the batch plugin;
   * the types will not verify whether or not this is detected.
   */
  const createHttpBatchClient = (options?: HttpBatchLinkOptions) => {
    return new EdenClient({
      links: [httpBatchLink(options) as any],
    })
  }

  const createContext = (props: EdenContextProps<TElysia>) => {
    const {
      abortOnUnmount = false,
      client,
      queryClient,
    } = props

    const utilityFunctions = createUtilityFunctions({ client, queryClient })

    return {
      abortOnUnmount,
      queryClient,
      client,
      ...utilityFunctions,
    }
  }

  const createUtils = (props: EdenContextProps<TElysia>) => {
    const context = createContext(props)
    return createEdenTreatyQueryUtils(context)
  }

  const EdenPlugin: EdenPlugin<TElysia> = (props) => {
    const { abortOnUnmount = false, client, queryClient } = props

    const contextValue = createContext({ abortOnUnmount, client, queryClient })


    return {
      install(app) {
        app.provide(Context, contextValue)
      }
    }
  }

  const useRawContext = () => {
    const context = inject(Context)

    if (!context) {
      throw new Error(
        'Unable to find tRPC Context. Did you forget to wrap your App inside `withTRPC` HoC?',
      )
    }

    return context
  }

  const useUtils = (context = useRawContext()) => {
    return createEdenTreatyQueryUtils(context)
  }

  const useQuery = (
    originalPaths: readonly string[],
    input?: InferRouteOptions | SkipToken,
    options?: EdenUseQueryOptions<unknown, unknown, TError>,
  ): EdenUseQueryResult<unknown, TError> => {
    const context = useRawContext()

    const parsed = parsePathsAndMethod(originalPaths)

    const queryOptions = edenUseQueryOptions(parsed, context, input, options, config)

    type HookResult = EdenUseQueryResult<any, TError>

    const queryClient = context.queryClient ?? useQueryClient()
    const hook = __useQuery(queryOptions, queryClient) as HookResult

    const { paths } = parsed

    hook.eden = getEdenQueryExtension({ path: paths })

    return hook
  }

  const useInfiniteQuery = (
    originalPaths: readonly string[],
    input?: InferRouteOptions | SkipToken,
    options?: EdenUseInfiniteQueryOptions<unknown, unknown, TError>,
  ): EdenUseInfiniteQueryResult<unknown, TError, unknown> => {
    const context = useRawContext()

    const parsed = parsePathsAndMethod(originalPaths)

    const queryOptions = edenUseInfiniteQueryOptions(parsed, context, input, options, config)

    type HookResult = EdenUseInfiniteQueryResult<unknown, TError, unknown>

    const queryClient = context.queryClient ?? useQueryClient()

    const hook = __useInfiniteQuery(queryOptions, queryClient) as HookResult

    const { paths } = parsed

    hook.eden = getEdenQueryExtension({ path: paths })

    return hook
  }



  const useQueries: EdenTreatyUseQueries<TElysia> = (queriesCallback) => {
    const context = useRawContext()

    const { queryClient, client } = context

    const proxy = createTreatyUseQueriesProxy(client)

    type MaybeRefDeep<T> = MaybeRef<T extends Function ? T : T extends object ? {
      [Property in keyof T]: MaybeRefDeep<T[Property]>;
    } : T>;

    type UseQueriesOptionsArg<T extends Array<any>> = readonly [
      ...UseQueriesOptions<T>
    ];

    const queries: MaybeRefDeep<UseQueriesOptionsArg<any>> = queriesCallback(proxy)

    return __useQueries({ queries }, queryClient)
  }

  const useMutation = (
    originalPaths: readonly string[],
    input?: InferRouteOptions,
    options?: EdenUseMutationOptions<unknown, TError, unknown, unknown>,
  ): EdenUseMutationResult<unknown, TError, unknown, unknown, unknown> => {
    console.log("HELLO", originalPaths, input, options)

    const context = useRawContext()

    const parsed = parsePathsAndMethod(originalPaths)

    const mutationOptions = getEdenUseMutationOptions(parsed, context, input, options, config)

    type HookResult = EdenUseMutationResult<any, any, any, any, any>

    const queryClient = context.queryClient ?? useQueryClient()

    const hook = useEdenMutation(mutationOptions, queryClient) as HookResult

    const { paths } = parsed

    hook.eden = getEdenQueryExtension({ path: paths })

    return hook
  }

  /* istanbul ignore next -- @preserve */
  const useSubscription = (
    path: readonly string[],
    input: unknown,
    opts: EdenUseSubscriptionOptions<unknown, TError>,
  ) => {
    const context = useRawContext()
    return edenUseSubscription(path, input, opts, context)
  }

  return {
    plugin: EdenPlugin,
    createClient,
    createHttpClient,
    createHttpBatchClient,
    createContext,
    createUtils,
    useUtils,
    useQuery,
    useInfiniteQuery,
    useQueries,
    useMutation,
    useSubscription,
  }
}

export type EdenTreatyQueryRootHooks<
  TElysia extends AnyElysia = AnyElysia,
  TSSRContext = unknown,
> = ReturnType<typeof createEdenTreatyQueryRootHooks<TElysia, TSSRContext>>
