import {
  EdenClient,
  type EdenClientError,
  type EdenCreateClient,
  httpBatchLink,
  type HttpBatchLinkOptions,
  type InferRouteOptions,
  parsePathsAndMethod,
} from '@ap0nia/eden'
import {
  QueryClient,
  type SkipToken,
  useQueries as __useQueries,
  useQuery as __useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import type { AnyElysia } from 'elysia'
import { inject, type InjectionKey, type Plugin } from 'vue'

import type { EdenQueryConfig } from '../../config'
import { createUtilityFunctions, type EdenContextProps, type EdenContextState } from '../../context'
import { getEdenQueryExtension } from '../../integration/internal/query-hook-extension'
import type { EdenUseQueryOptionsForUseQueries } from '../../integration/internal/use-query-options-for-use-queries'
import { createEdenTreatyQueryUtils } from './query-utils'
import {
  type EdenUseMutationOptions,
  type EdenUseMutationResult,
  getEdenUseMutationOptions,
  useEdenMutation,
} from './use-mutation'
import { createTreatyUseQueriesProxy, type EdenTreatyUseQueries } from './use-queries'
import { type EdenUseQueryOptions, edenUseQueryOptions, type EdenUseQueryResult } from './use-query'
export function createEdenTreatyQueryRootHooks<
  TElysia extends AnyElysia,
  TSSRContext = unknown,
  TError = EdenClientError<TElysia>,
>(config?: EdenQueryConfig<TElysia>) {
  type ProviderContext = EdenContextState<TElysia, TSSRContext>

  const ContextSymbol = contextSymbol as InjectionKey<ProviderContext>

  const createClient: EdenCreateClient<TElysia> = (options) => {
    return new EdenClient(options)
  }

  // const createHttpClient = (options?: HTTPLinkOptions) => {
  //   return new EdenClient({
  //     links: [httpLink(options)],
  //   })
  // }

  // /**
  //  * @warning
  //  * Ensure that the Elysia.js server uses the batch plugin;
  //  * the types will not verify whether or not this is detected.
  //  */
  const createHttpBatchClient = (options?: HttpBatchLinkOptions) => {
    return new EdenClient({
      links: [httpBatchLink(options) as any],
    })
  }

  const createContext = (props: EdenContextProps<TElysia, TSSRContext>) => {
    const {
      abortOnUnmount = false,
      client,
      ssrContext = null,
      ssrState = false,
      queryClient,
    } = props

    const utilityFunctions = createUtilityFunctions({ client, queryClient })

    return {
      abortOnUnmount,
      client,
      ssrContext,
      ssrState,
      queryClient,
      ...utilityFunctions,
    }
  }

  // const createUtils = (props: EdenContextProps<TElysia, TSSRContext>) => {
  //   const context = createContext(props)
  //   return createEdenTreatyQueryUtils(context)
  // }

  // const EdenProvider: EdenProvider<TElysia, TSSRContext> = (props) => {
  //   const { abortOnUnmount = false, client, queryClient, ssrContext, children } = props

  //   const [ssrState, setSSRState] = Vue.useState<SSRState>(props.ssrState ?? false)

  //   const contextValue = Vue.useMemo<ProviderContext>(() => {
  //     return createContext({ abortOnUnmount, client, queryClient, ssrContext, ssrState })
  //   }, [abortOnUnmount, client, queryClient, ssrContext, ssrState])

  //   Vue.useEffect(() => {
  //     // Only updating state to `mounted` if we are using SSR.
  //     // This makes it so we don't have an unnecessary re-render when opting out of SSR.
  //     setSSRState((state) => (state ? 'mounted' : false))
  //   }, [])

  //   return <Context.Provider value={contextValue}>{children}</Context.Provider>
  // }

  const useRawContext = () => {
    const context = inject(ContextSymbol)

    if (!context) {
      throw new Error(
        'Unable to find tRPC Context. Did you forget to wrap your App inside `withTRPC` HoC?',
      )
    }

    return context
  }

  const useContext = (context = useRawContext()) => {
    // Create and return a stable reference of the utils context.
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

  // const useSuspenseQuery = (
  //   originalPaths: readonly string[],
  //   input: InferRouteOptions,
  //   options?: EdenUseSuspenseQueryOptions<unknown, unknown, TError>,
  // ): EdenUseSuspenseQueryResult<unknown, TError> => {
  //   const context = useRawContext()
  //   const context = inject(routeDefinitionSymbol)

  //   const parsed = parsePathsAndMethod(originalPaths)

  //   const queryOptions = edenUseQueryOptions(parsed, context, input, options, config)

  // type HookResult = EdenUseQueryResult<any, TError>

  //   const queryClient = context.queryClient ?? useQueryClient()

  //   const hook = __useSuspenseQuery(queryOptions, queryClient) as HookResult

  //   const { paths } = parsed

  //   hook.eden = Vue.useMemo(() => getEdenQueryExtension({ path: paths }), [paths])

  //   return [hook.data, hook as any]
  // }

  // const useInfiniteQuery = (
  //   originalPaths: readonly string[],
  //   input?: InferRouteOptions | SkipToken,
  //   options?: EdenUseInfiniteQueryOptions<unknown, unknown, TError>,
  // ): EdenUseInfiniteQueryResult<unknown, TError, unknown> => {
  //   const context = useRawContext()

  //   const parsed = parsePathsAndMethod(originalPaths)

  //   const queryOptions = edenUseInfiniteQueryOptions(parsed, context, input, options, config)

  //   type HookResult = EdenUseInfiniteQueryResult<unknown, TError, unknown>

  //   const queryClient = context.queryClient ?? useQueryClient()

  //   const hook = __useInfiniteQuery(queryOptions, queryClient) as HookResult

  //   const { paths } = parsed

  //   hook.eden = Vue.useMemo(() => getEdenQueryExtension({ path: paths }), [paths])

  //   return hook
  // }

  // const useSuspenseInfiniteQuery = (
  //   originalPaths: readonly string[],
  //   input: InferRouteOptions,
  //   options?: EdenUseSuspenseInfiniteQueryOptions<unknown, unknown, TError>,
  // ): EdenUseSuspenseInfiniteQueryResult<unknown, TError, unknown> => {
  //   const context = useRawContext()

  //   const parsed = parsePathsAndMethod(originalPaths)

  //   const queryOptions = edenUseInfiniteQueryOptions(parsed, context, input, options, config)

  //   type HookResult = EdenUseInfiniteQueryResult<unknown, TError, unknown>

  //   const queryClient = context.queryClient ?? useQueryClient()

  //   const hook = __useSuspenseInfiniteQuery(queryOptions, queryClient) as HookResult

  //   const { paths } = parsed

  //   hook.eden = Vue.useMemo(() => getEdenQueryExtension({ path: paths }), [paths])

  //   return [hook.data, hook] as any
  // }

  const useQueries: EdenTreatyUseQueries<TElysia> = (queriesCallback) => {
    const context = useRawContext()

    const {
      ssrState,
      queryClient,
      // prefetchQuery,
      client,
    } = context

    const proxy = createTreatyUseQueriesProxy(client)

    const queries: readonly EdenUseQueryOptionsForUseQueries<any, any, any, any>[] =
      queriesCallback(proxy)

    // Not SSR.
    if (!(typeof window === 'undefined' && ssrState === 'prepass')) {
      return __useQueries({ queries }, queryClient)
    }

    // for (const query of queries) {
    //   const shouldSsr = query.eden?.ssr !== false

    //   if (shouldSsr && !queryClient.getQueryCache().find(query)) {
    //     void prefetchQuery(query.queryKey, unref(query))
    //   }
    // }

    return __useQueries({ queries }, queryClient)
  }

  // const useSuspenseQueries: EdenTreatyUseSuspenseQueries<TElysia> = (queriesCallback) => {
  //   const context = useRawContext()

  //   const { queryClient, client } = context

  //   const proxy = createTreatyUseSuspenseQueriesProxy(client)

  //   const queries: readonly EdenUseQueryOptionsForUseSuspenseQueries[] = queriesCallback(proxy)

  //   const hook = __useSuspenseQueries({ queries }, queryClient)

  //   return [hook.map((h) => h.data), hook] as any
  // }

  const useMutation = (
    originalPaths: readonly string[],
    input?: InferRouteOptions,
    options?: EdenUseMutationOptions<unknown, TError, unknown, unknown>,
  ): EdenUseMutationResult<unknown, TError, unknown, unknown, unknown> => {
    const context = useRawContext()

    const parsed = parsePathsAndMethod(originalPaths)
    const mutationOptions = getEdenUseMutationOptions(parsed, context, input, options, config)

    type HookResult = EdenUseMutationResult<any, TError, any, any, any>

    const queryClient = context.queryClient ?? useQueryClient()

    const hook = useEdenMutation(mutationOptions, queryClient) as HookResult

    const { paths } = parsed

    hook.eden = getEdenQueryExtension({ path: paths })

    return hook
  }

  // /* istanbul ignore next -- @preserve */
  // const useSubscription = (
  //   path: readonly string[],
  //   input: unknown,
  //   opts: EdenUseSubscriptionOptions<unknown, TError>,
  // ) => {
  //   const context = useRawContext()
  //   return edenUseSubscription(path, input, opts, context)
  // }
  const plugin = ({
    client,
    queryClient,
  }: {
    client: EdenClient
    queryClient: QueryClient
  }): Plugin => ({
    install(app) {
      const { abortOnUnmount = false, ssrContext } = {
        abortOnUnmount: false,
        ssrContext: null,
      }

      // const [ssrState, setSSRState] = React.useState<SSRState>(props.ssrState ?? false)

      const contextValue = createContext({
        abortOnUnmount,
        client,
        ssrContext,
        ssrState: false,
        queryClient,
      })

      app.provide(contextSymbol, contextValue)
    },
  })
  return {
    plugin,
    createClient,
    //   createHttpClient,
    createHttpBatchClient,
    //   createContext,
    //   createUtils,
    //   useContext,
    useUtils: useContext,
    useQuery,
    //   useSuspenseQuery,
    //   useInfiniteQuery,
    //   useSuspenseInfiniteQuery,
    useQueries,
    //   useSuspenseQueries,
    useMutation,
    //   useSubscription,
  }
}

export type EdenTreatyQueryRootHooks<
  TElysia extends AnyElysia = AnyElysia,
  TSSRContext = unknown,
> = ReturnType<typeof createEdenTreatyQueryRootHooks<TElysia, TSSRContext>>

export const contextSymbol = Symbol('eden-vue-query-context') as InjectionKey<
  EdenContextState<any, any>
>
