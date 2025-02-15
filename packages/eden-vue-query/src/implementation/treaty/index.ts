import { type EdenCreateClient, getPathParam } from '@ap0nia/eden'
import type { AnyElysia } from 'elysia'

import type { EdenQueryConfig } from '../../config'
import type { EdenPlugin } from '../../context'
import { createEdenTreatyQueryRootHooks } from './root-hooks'

/**
 * The treaty-query API provides utility methods that are available at the root, as well as
 * a strongly-typed proxy representing the {@link AnyElysia} API.
 */
export type EdenTreatyVueQuery<TElysia extends AnyElysia, TSSRContext> = EdenTreatyVueQueryBase<
  TElysia,
  TSSRContext
>
// &
// EdenTreatyVueQueryHooks<TElysia>

/**
 * Utilities available at the eden-treaty + vue-query root.
 */
export interface EdenTreatyVueQueryBase<TElysia extends AnyElysia, TSSRContext> {
  /**
   * Get utilities provided via the context API.
   *
   * @see https://trpc.io/docs/v11/client/vue/useUtils
   */
  // useUtils(): EdenTreatyVueQueryUtils<TElysia, TSSRContext>
  /**
   * Returns everything that will be provided from context.
   *
   * e.g. the root utility functions, and root configuration settings.
   */
  // createContext(
  //   props: EdenContextProps<TElysia, TSSRContext>,
  // ): EdenContextState<TElysia, TSSRContext>
  /**
   * Creates a proxy that can invoke tanstack-query helper functions.
   */
  // createUtils(
  //   props: EdenContextProps<TElysia, TSSRContext>,
  // ): EdenTreatyVueQueryUtils<TElysia, TSSRContext>
  /**
   * Get utilities provided via the context API.
   *
   * @deprecated renamed to {@link useUtils} and will be removed in a future tRPC version
   *
   * @link https://trpc.io/docs/v11/client/vue/useUtils
   */
  // useContext(): EdenTreatyVueQueryUtils<TElysia, TSSRContext>
  /**
   * Vue.Provider to set the context.
   */
  // Provider: EdenProvider<TElysia, TSSRContext>
  plugin: EdenPlugin<TElysia, TSSRContext>
  /**
   * Wraps the `useQueries` vue-query hook in a type-safe proxy.
   */
  // useQueries: EdenTreatyUseQueries<TElysia>
  /**
   * Wraps the `useSuspenseQueries` vue-query hook in a type-safe proxy.
   */
  // useSuspenseQueries: EdenTreatyUseSuspenseQueries<TElysia>
  /**
   * Create a raw, untyped-client.
   */
  createClient: EdenCreateClient<TElysia>
  /**
   * Convenience method for creating and configuring a client with a single HTTPLink.
   */
  // createHttpClient: (options?: HTTPLinkOptions<TElysia>) => EdenClient<TElysia>
  /**
   * Convenience method for creating and configuring a client with a single HttpBatchLink.
   */
  // createHttpBatchClient: (options?: HttpBatchLinkOptions<TElysia>) => EdenClient<TElysia>
}

type EdenTreatyQueryRootHooks<_ extends AnyElysia> = {}

export function createEdenTreatyVueQuery<TElysia extends AnyElysia, TSSRContext = unknown>(
  config?: EdenQueryConfig<TElysia>,
): EdenTreatyVueQuery<TElysia, TSSRContext> {
  /**
   * Root hooks are invoked by leaf nodes in the proxy.
   * Create the utility functions once at the beginning, and have all leaves use the same one.
   */
  const rootHooks = createEdenTreatyQueryRootHooks(config)

  /**
   * The actual proxy.
   */
  const edenTreatyVueQueryProxy = createEdenTreatyVueQueryProxy(rootHooks, config)

  /**
   * Wrapper around the proxy that will attempt to return properties found
   * on the root hooks before accessing the proxy.
   */
  const edenTreatyVueQuery = new Proxy(() => {}, {
    get: (_target, path: string, _receiver): any => {
      if (Object.prototype.hasOwnProperty.call(rootHooks, path)) {
        return rootHooks[path as never]
      }
      return edenTreatyVueQueryProxy[path as never]
    },
  })

  return edenTreatyVueQuery as any
}

/**
 * Creates the recursive proxy.
 *
 * @param config Root hooks that were created.
 *
 * @param rootHooks The original configuration for eden-treaty.
 *
 * @param paths Path parameter strings including the current path parameter as a placeholder.
 *  @example [ 'products', ':id', ':cursor' ]
 *
 * @param pathParams An array of objects representing path parameter replacements.
 * @example [ { id: 123 }, writable({ cursor: '456' }) ]
 */
export function createEdenTreatyVueQueryProxy<T extends AnyElysia = AnyElysia>(
  rootHooks: EdenTreatyQueryRootHooks<T>,
  config?: EdenQueryConfig<T>,
  paths: (string | symbol)[] = [],
  pathParams = [],
) {
  const edenTreatyQueryProxy = new Proxy(() => {}, {
    get: (_target, path: string, _receiver): any => {
      // Copy the paths so that it will not be mutated in a nested proxy.
      // Only add the current path if is not "index".
      const nextPaths = path === 'index' ? [...paths] : [...paths, path]

      //  Return a nested proxy that has the new paths.
      return createEdenTreatyVueQueryProxy(rootHooks, config, nextPaths, pathParams)
    },
    apply: (_target, _thisArg, args) => {
      /**
       * @example ['nendoroid', 'createQuery']
       */
      const pathsCopy = [...paths]

      /**
       * @example 'createQuery'
       */
      const hook = pathsCopy.pop() ?? ''

      /**
       * Hook that returns path segment array.
       *
       * @internal
       */
      if (hook === routeDefinitionSymbol) {
        return pathsCopy
      }

      /**
       * Determine whether a path parameter can be found from the provided args.
       *
       * @example { param: { id: '123' }, key: 'id' }
       *
       * The `param` property is the actual argument that was passed,
       * while the key is the string representing the placeholder.
       */
      const pathParam = getPathParam(args)

      /**
       * Determine if the property can be found on the root hooks.
       * @example "createQuery," "createMutation," etc.
       */
      const isRootProperty = Object.prototype.hasOwnProperty.call(rootHooks, hook)

      if (pathParam?.key != null && !isRootProperty) {
        /**
         * An array of objects representing path parameter replacements.
         * @example [ writable({ id: 123 }) ]
         */
        const allPathParams = [...pathParams, pathParam.param]

        /**
         * Path parameter strings including the current path parameter as a placeholder.
         *
         * @example [ 'nendoroid', ':id' ]
         */
        const pathsWithParams = [...paths, `:${pathParam.key}`]

        return createEdenTreatyVueQueryProxy(
          rootHooks,
          config,
          pathsWithParams,
          allPathParams as any,
        )
      }

      // Mutate the args to ensure that it is ordered correctly for its corresponding function call.
      // mutateArgs(hook, args, pathParams)

      /**
       * ```ts
       * // The final hook that was invoked.
       * const hook = "createQuery"
       *
       * // The array of path segments up to this point.
       * // Note how ":id" is included, this will be replaced by the `resolveRequest` function from eden.
       * const pathsCopy = ["nendoroid", ":id", "createQuery"]
       *
       * // Accummulated path parameters up to this point.
       * const pathParams = [ writable({ id: 1895 }) ]
       *
       * // If the provided a search query and query options, args may look like this.
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
       *
       * @remarks
       * // For this example, the input has been converted to a Readable because one of the path
       * // parameters was a Readable Vue store.
       *
       * rootHooks.createQuery(
       *   ["nendoroid", ":id", "name"],
       *   derived({ query: { location: "jp" }, params: { id: 1895 } }),
       *   { refetchOnMount: false }
       * )
       * ```
       */
      const result = (rootHooks as any)[hook](pathsCopy, ...args)

      return result
    },
  })

  return edenTreatyQueryProxy
}

export const routeDefinitionSymbol = Symbol('eden-treaty-vue-query-route-definition')
