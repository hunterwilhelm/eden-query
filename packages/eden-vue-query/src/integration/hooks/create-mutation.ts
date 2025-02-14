import type {
  EdenRequestParams,
  InferRouteBody,
  InferRouteError,
  InferRouteOptions,
  InferRouteOutput,
  ParsedPathAndMethod,
} from '@ap0nia/eden'
import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  type QueryClient,
  useQueryClient,
} from '@tanstack/vue-query'
import type { RouteSchema } from 'elysia'

import type { EdenContextState } from '../../context'
import type { Override } from '../../utils/types'
import type { EdenQueryBaseOptions } from '../internal/query-base-options'
import type { WithEdenQueryExtension } from '../internal/query-hook-extension'
import { getMutationKey } from '../internal/query-key'

export type EdenUseMutationOptions<TInput, TError, TOutput, TContext = unknown> = UseMutationOptions<
  TOutput,
  TError,
  TInput,
  TContext
> &
  EdenQueryBaseOptions

export type EdenUseMutationResult<TData, TError, TVariables, TContext, TInput> =
  WithEdenQueryExtension<
    Override<
      UseMutationResult<TData, TError, TVariables, TContext>,
      {
        mutateAsync: EdenAsyncMutationFunction<TData, TError, TVariables, TInput>
        mutate: EdenMutationFunction<TData, TError, TVariables, TInput>
      }
    >
  >

export type EdenCreateMutation<
  TRoute extends RouteSchema,
  _TPath extends any[] = [],
  TVariables = InferRouteBody<TRoute>,
  TInput = Partial<Pick<InferRouteOptions<TRoute>, 'params'>> &
    Omit<InferRouteOptions<TRoute>, 'params'>,
  TData = InferRouteOutput<TRoute>,
  TError = InferRouteError<TRoute>,
> = <TContext = unknown>(
  options?: EdenUseMutationOptions<TVariables, TError, TData, TContext>,
) => EdenUseMutationResult<TData, TError, TVariables, TContext, TInput>

export type EdenAsyncMutationFunction<TData, TError, TVariables, TInput> = <TContext = unknown>(
  variables: TVariables,
  options?: TData & UseMutationOptions<TData, TError, EdenCreateMutationVariables<TVariables, TInput>, TContext>,
) => Promise<TData>

export type EdenMutationFunction<TData, TError, TVariables, TInput> = <TContext = unknown>(
  variables: TVariables,
  options?: TData & UseMutationOptions<TData, TError, EdenCreateMutationVariables<TVariables, TInput>, TContext>,
) => void

export type EdenCreateMutationVariables<TBody = any, TOptions = {}> = {
  body: TBody
} & ({} extends TOptions
  ? {
      options?: TOptions
    }
  : {
      options: TOptions
    })

export function edenCreateMutationOptions(
  parsedPathsAndMethod: ParsedPathAndMethod,
  context: EdenContextState<any, any>,
  options: EdenUseMutationOptions<any, any, any> = {},
  config?: any,
): UseMutationOptions {
  const { client, queryClient = useQueryClient() } = context

  const { paths, path, method } = parsedPathsAndMethod

  const mutationKey = getMutationKey(paths)

  const mutationDefaults = queryClient.getMutationDefaults(mutationKey)

  const defaultOptions = queryClient.defaultMutationOptions(mutationDefaults)

  const { eden, ...mutationOptions } = options

  const resolvedMutationOptions: UseMutationOptions = {
    mutationKey,
    mutationFn: async (variables: any = {}) => {
      const { body, options } = variables as EdenCreateMutationVariables

      const params = {
        ...config,
        options,
        body,
        path,
        method,
        ...eden,
      } satisfies EdenRequestParams

      const result = await client.query(params)

      if (!('data' in result)) {
        return result
      }

      if (result.error != null) {
        throw result.error
      }

      return result.data
    },
    onSuccess: (data, variables, context) => {
      const onSuccess = options?.onSuccess ?? defaultOptions.onSuccess

      if (config?.overrides?.useMutation?.onSuccess == null) {
        return onSuccess?.(data, variables, context)
      }

      const meta: any = options?.meta ?? defaultOptions.meta

      const originalFn = () => onSuccess?.(data, variables, context)

      return config.overrides.useMutation.onSuccess({ meta, originalFn, queryClient })
    },
    ...mutationOptions,
  }

  return resolvedMutationOptions
}
