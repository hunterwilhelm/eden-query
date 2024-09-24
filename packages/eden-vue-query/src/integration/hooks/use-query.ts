import {
  type EdenRequestParams,
  type InferRouteError,
  type InferRouteOptions,
  type InferRouteOutput
} from '@ap0nia/eden'
import {
  type DefaultError,
  type InitialDataFunction,
  type QueryKey,
  type QueryObserverOptions,
  type SkipToken,
  skipToken,
  type UseQueryDefinedReturnType,
  type UseQueryOptions,
  type UseQueryReturnType
} from '@tanstack/vue-query'
import type { RouteSchema } from 'elysia'

import type { EdenQueryConfig } from '../../config'
import { type EdenContextState } from '../../context'
import type { DistributiveOmit } from '../../utils/types'
import type { ParsedPathAndMethod } from '../internal/parse-paths-and-method'
import type { EdenQueryBaseOptions } from '../internal/query-base-options'
import type { WithEdenQueryExtension } from '../internal/query-hook-extension'
import { getQueryKey } from '../internal/query-key'

// @tanstack/vue-query isn't exporting this type
interface UseBaseQueryOptions<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryData = TQueryFnData, TQueryKey extends QueryKey = QueryKey> extends QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey> {
}

export type EdenUseQueryOptions<
  TOutput,
  TData,
  TError,
  TQueryOptsData = TOutput,
> = DistributiveOmit<UseBaseQueryOptions<TOutput, TError, TData, TQueryOptsData, any>, 'queryKey'> &
  EdenQueryBaseOptions

export type EdenDefinedUseQueryOptions<
  TOutput,
  TData,
  TError,
  TQueryOptsData = TOutput,
> = DistributiveOmit<UseBaseQueryOptions<TOutput, TError, TData, TQueryOptsData, any>, 'queryKey'> &
  EdenQueryBaseOptions & {
    initialData: InitialDataFunction<TQueryOptsData> | TQueryOptsData
  }

export type EdenUseQueryResult<TData, TError> = WithEdenQueryExtension<
  UseQueryReturnType<TData, TError>
>

export type EdenDefinedUseQueryResult<TData, TError> = WithEdenQueryExtension<
  UseQueryDefinedReturnType<TData, TError>
>

export interface EdenUseQuery<
  TRoute extends RouteSchema,
  _TPath extends any[] = [],
  // The publicly exposed `useQuery` hook only accepts the `query` object.
  TInput = InferRouteOptions<TRoute>['query'],
  TOutput = InferRouteOutput<TRoute>,
  TError = InferRouteError<TRoute>,
  > {
  <TQueryFnData extends TOutput = TOutput, TData = TQueryFnData>(
    input: {} extends TInput ? void | TInput : TInput,
    options: EdenDefinedUseQueryOptions<TQueryFnData, TData, TError, TOutput>,
  ): EdenDefinedUseQueryResult<TData, TError>

  <TQueryFnData extends TOutput = TOutput, TData = TQueryFnData>(
    input: ({} extends TInput ? void | TInput : TInput) | SkipToken,
    options?: EdenUseQueryOptions<TQueryFnData, TData, TError, TOutput>,
  ): EdenUseQueryResult<TData, TError>
}


export function edenUseQueryOptions(
  parsedPathAndMethod: ParsedPathAndMethod,
  context: EdenContextState<any>,
  // The internal helper to `useQueryOptions` receives the entire input object, including `query` and `params`.
  input?: InferRouteOptions | SkipToken,
  options?: EdenUseQueryOptions<unknown, unknown, any>,
  config?: EdenQueryConfig,
): UseQueryOptions {
  const { abortOnUnmount, client, queryClient } = context

  const { paths, path, method } = parsedPathAndMethod

  const isInputSkipToken = input === skipToken && typeof input !== 'object'

  const queryKey = getQueryKey(paths, isInputSkipToken ? undefined : input, 'query')

  const defaultOptions = queryClient.getQueryDefaults(queryKey)


  const initialQueryOptions = { ...defaultOptions, ...options }
  const { eden, ...queryOptions } = initialQueryOptions

  const resolvedQueryOptions = { ...queryOptions, queryKey }

  if (isInputSkipToken) {
    resolvedQueryOptions.queryFn = input
    return resolvedQueryOptions
  }

  resolvedQueryOptions.queryFn = async (queryFunctionContext) => {
    const params: EdenRequestParams = {
      ...config,
      ...eden,
      options: input,
      path,
      method,
      fetcher: eden?.fetcher ?? config?.fetcher ?? globalThis.fetch,
    }

    const shouldForwardSignal = eden?.abortOnUnmount ?? config?.abortOnUnmount ?? abortOnUnmount

    if (shouldForwardSignal) {
      params.fetch = { ...params.fetch, signal: queryFunctionContext.signal }
    }

    const result = await client.query(params)

    if (result.error != null) {
      throw result.error
    }

    return result.data
  }

  return resolvedQueryOptions
}
