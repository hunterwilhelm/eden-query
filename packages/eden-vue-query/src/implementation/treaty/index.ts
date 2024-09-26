import type {
  EdenClient,
  EdenCreateClient,
  EdenRequestOptions,
  HttpBatchLinkOptions,
  HTTPLinkOptions,
  HttpMutationMethod,
  HttpQueryMethod,
  HttpSubscriptionMethod,
  InferRouteOptions,
} from '@ap0nia/eden'
import type { AnyElysia, RouteSchema } from 'elysia'
import type { Prettify } from 'elysia/types'

import type { EdenQueryConfig } from '../../config'
import type { EdenContextProps, EdenContextState, EdenProvider } from '../../context'
import type { EdenUseInfiniteQuery } from '../../integration/hooks/use-infinite-query'
import type { EdenUseMutation } from '../../integration/hooks/use-mutation'
import type { EdenUseQuery } from '../../integration/hooks/use-query'
import type { InfiniteCursorKey } from '../../integration/internal/infinite-query'
import type {
  ExtractEdenTreatyRouteParams,
  ExtractEdenTreatyRouteParamsInput,
} from '../../integration/internal/path-params'
import type {
  EdenMutationKey,
  EdenQueryKey,
  EdenQueryKeyOptions,
  EdenQueryType,
} from '../../integration/internal/query-key'
import {
  getMutationKey as internalGetMutationKey,
  getQueryKey as internalGetQueryKey,
} from '../../integration/internal/query-key'
import type { LiteralUnion } from '../../utils/literal-union'
import { getPathParam } from '../../utils/path-param'
import type { EdenTreatyQueryUtils } from './query-utils'
import { createEdenTreatyQueryRootHooks, type EdenTreatyQueryRootHooks } from './root-hooks'
import type { EdenTreatyUseQueries } from './use-queries'

export type EdenTreatyVueQuery<TElysia extends AnyElysia> = EdenTreatyVueQueryBase<TElysia> &
  EdenTreatyVueQueryHooks<TElysia>

export type EdenTreatyVueQueryBase<TElysia extends AnyElysia> = {
  createContext(props: EdenContextProps<TElysia>): EdenContextState<TElysia>

  createUtils(props: EdenContextProps<TElysia>): EdenTreatyQueryUtils<TElysia>

  /**
   * @link https://trpc.io/docs/v11/client/vue/useUtils
   */
  useUtils(): EdenTreatyQueryUtils<TElysia>

  plugin: EdenProvider<TElysia>

  useQueries: EdenTreatyUseQueries<TElysia>

  /**
   * Need to provide `links` in order for this client to work.
   */
  createClient: EdenCreateClient<TElysia>

  /**
   * Convenience method for creating and configuring a client with a single HTTPLink.
   */
  createHttpClient: (options?: HTTPLinkOptions<TElysia>) => EdenClient<TElysia>

  /**
   * Convenience method for creating and configuring a client with a single HttpBatchLink.
   */
  createHttpBatchClient: (options?: HttpBatchLinkOptions<TElysia>) => EdenClient<TElysia>
}

export type EdenTreatyVueQueryHooks<T extends AnyElysia> = T extends {
  _routes: infer TSchema extends Record<string, any>
}
  ? EdenTreatyVueQueryHooksImplementation<TSchema>
  : 'Please install Elysia before using Eden'

export type EdenTreatyVueQueryHooksImplementation<
  TSchema extends Record<string, any>,
  TPath extends any[] = [],
  TRouteParams = ExtractEdenTreatyRouteParams<TSchema>,
> = EdenTreatyVueQueryHooksProxy<TSchema, TPath, TRouteParams> &
  ({} extends TRouteParams
    ? {}
    : (
        params: ExtractEdenTreatyRouteParamsInput<TRouteParams>,
      ) => EdenTreatyVueQueryHooksImplementation<
        TSchema[Extract<keyof TRouteParams, keyof TSchema>],
        TPath
      >)

export type EdenTreatyVueQueryHooksProxy<
  TSchema extends Record<string, any>,
  TPath extends any[] = [],
  TRouteParams = ExtractEdenTreatyRouteParams<TSchema>,
> = {
  [K in Exclude<keyof TSchema, keyof TRouteParams>]: TSchema[K] extends RouteSchema
    ? EdenTreatyVueQueryRouteHooks<TSchema[K], K, TPath>
    : EdenTreatyVueQueryHooksImplementation<TSchema[K], [...TPath, K]>
}

/**
 * Maps a {@link RouteSchema} to an object with hooks.
 *
 * Defines available hooks for a specific route.
 *
 * @example { useQuery: ..., useInfiniteQuery: ... }
 */
export type EdenTreatyVueQueryRouteHooks<
  TRoute extends RouteSchema,
  TMethod,
  TPath extends any[] = [],
> = TMethod extends HttpQueryMethod
  ? EdenTreatyQueryMapping<TRoute, TPath>
  : TMethod extends HttpMutationMethod
    ? EdenTreatyMutationMapping<TRoute, TPath>
    : TMethod extends HttpSubscriptionMethod
      ? EdenTreatySubscriptionMapping<TRoute, TPath>
      : // Just add all possible operations since the route is unknown.
        EdenTreatyQueryMapping<TRoute, TPath> &
          EdenTreatyMutationMapping<TRoute, TPath> &
          EdenTreatySubscriptionMapping<TRoute, TPath>

/**
 * Available hooks assuming that the route supports useQuery.
 */
export type EdenTreatyQueryMapping<
  TRoute extends RouteSchema,
  TPath extends any[] = [],
  TInput extends InferRouteOptions<TRoute> = InferRouteOptions<TRoute>,
> = {
  useQuery: EdenUseQuery<TRoute, TPath>
} & (InfiniteCursorKey extends keyof (TInput['params'] & TInput['query'])
  ? EdenTreatyInfiniteQueryMapping<TRoute, TPath>
  : {})
/**
 * Available hooks assuming that the route supports useInfiniteQuery.
 */
export type EdenTreatyInfiniteQueryMapping<TRoute extends RouteSchema, TPath extends any[] = []> = {
  useInfiniteQuery: EdenUseInfiniteQuery<TRoute, TPath>
}

/**
 * Available hooks assuming that the route supports useMutation.
 */
export type EdenTreatyMutationMapping<TRoute extends RouteSchema, TPath extends any[] = []> = {
  useMutation: EdenUseMutation<TRoute, TPath>
}

/**
 * @TODO: Available hooks assuming that the route supports useMutation.
 */
export type EdenTreatySubscriptionMapping<
  TRoute extends RouteSchema,
  TPath extends any[] = [],
  TInput = InferRouteOptions<TRoute>,
> = {
  options: Prettify<EdenRequestOptions & TInput>
  queryKey: EdenQueryKey<TPath>
}

export function createEdenTreatyVueQuery<TElysia extends AnyElysia>(
  config?: EdenQueryConfig<TElysia>,
): EdenTreatyVueQuery<TElysia> {
  const rootHooks = createEdenTreatyQueryRootHooks(config)

  const edenTreatyVueQueryProxy = createEdenTreatyVueQueryProxy(rootHooks, config)

  const edenTreatyQuery = new Proxy(() => {}, {
    get: (_target, path: string, _receiver): any => {
      if (Object.prototype.hasOwnProperty.call(rootHooks, path)) {
        return rootHooks[path as never]
      }
      return edenTreatyVueQueryProxy[path as never]
    },
  })

  return edenTreatyQuery as any
}

export function createEdenTreatyVueQueryProxy<T extends AnyElysia = AnyElysia>(
  rootHooks: EdenTreatyQueryRootHooks<T>,
  config?: EdenQueryConfig<T>,
  paths: string[] = [],
  pathParams: Record<string, any>[] = [],
) {
  const edenTreatyQueryProxy = new Proxy(() => {}, {
    get: (_target, path: string, _receiver): any => {
      const nextPaths = path === 'index' ? [...paths] : [...paths, path]
      return createEdenTreatyVueQueryProxy(rootHooks, config, nextPaths, pathParams)
    },
    apply: (_target, _thisArg, args) => {
      const pathParam = getPathParam(args)

      if (pathParam?.key != null && pathParam.key !== 'onSuccess') {
        const allPathParams = [...pathParams, pathParam.param]
        const pathsWithParams = [...paths, `:${pathParam.key}`]
        return createEdenTreatyVueQueryProxy(rootHooks, config, pathsWithParams, allPathParams)
      }

      const pathsCopy = [...paths]

      const hook = pathsCopy.pop() ?? ''

      /**
       * Hidden internal hook that returns the path array up to this point.
       */
      if (hook === '_defs') {
        return pathsCopy
      }

      // There is no option to pass in input from the public exposed hook,
      // but the internal root `useMutation` hook expects input as the first argument.
      // Add an empty element at the front representing "input".
      if (hook === 'useMutation') {
        args.unshift(undefined)
      }

      const modifiedArgs = mutateArgs(hook, args, pathParams)

      /**
       * ```ts
       * // The final hook that was invoked.
       * const hook = "useQuery"
       *
       * // The array of path segments up to this point.
       * // Note how ":id" is included, this will be replaced by the `resolveRequest` function from eden.
       * const pathsCopy = ["nendoroid", ":id", "name"]
       *
       * // Accummulated path parameters up to this point.
       * const pathParams = [ { id: 1895 } ]
       *
       * // The user provided a search query and query options.
       * const args = [ { location: "jp" }, { refetchOnUnmount: true } ]
       *
       * // The accummulated path parameters and search query are merged into one "input" object.
       * const modifiedArgs = [
       *   { query: { location: "jp" }, params: { id: 1895 } },
       *   { refetchOnMount: false }
       * ]
       *
       * // The full function call contains three arguments:
       * // array of path segments, input, and query options.
       * rootHooks.useQuery(
       *   ["nendoroid", ":id", "name"],
       *   { query: { location: "jp" }, params: { id: 1895 } },
       *   { refetchOnMount: false }
       * )
       * ```
       */
      const result = (rootHooks as any)[hook](pathsCopy, ...modifiedArgs)

      return result
    },
  })

  return edenTreatyQueryProxy
}

export function getQueryKey<TSchema extends Record<string, any>>(
  route: EdenTreatyVueQueryHooksImplementation<TSchema>,
  input?: TSchema extends RouteSchema ? InferRouteOptions<TSchema> : any,
  type?: EdenQueryType,
): EdenQueryKey {
  const paths = (route as any).defs()
  return internalGetQueryKey(paths, input, type ?? 'any')
}

export function getMutationKey<TSchema extends RouteSchema>(
  route: EdenTreatyVueQueryHooksImplementation<TSchema>,
  options?: EdenQueryKeyOptions,
): EdenMutationKey {
  const paths = (route as any).defs()
  return internalGetMutationKey(paths, options)
}

/**
 * Some hooks have `input` provided as the first argument to the root hook.
 * If this is the case, then {@link mutateArgs} needs to ensure that any
 * accummulated path parameters are included.
 */
const hooksWithInput: (keyof EdenTreatyQueryRootHooks | LiteralUnion<string>)[] = [
  'useQuery',
  'useInfiniteQuery',
  'useMutation',
]

/**
 * Directly mutate the arguments passed to the root hooks.
 *
 * Make sure that the interpretation of args matches up with the implementation of root hooks.
 */
export function mutateArgs(
  hook: keyof EdenTreatyQueryRootHooks | LiteralUnion<string>,
  args: unknown[],
  params: Record<string, any>[],
) {
  if (!hooksWithInput.includes(hook)) {
    return args
  }

  const query = args[0]

  if (query == null && params.length === 0) {
    return args
  }

  const resolvedParams: Record<string, any> = {}

  for (const param of params) {
    for (const key in param) {
      resolvedParams[key] = param[key]
    }
  }

  const resolvedInput = {
    params: resolvedParams,
    query,
  }

  args[0] = resolvedInput

  return args
}

export * from './infer'
export * from './root-hooks'
export * from './use-queries'
