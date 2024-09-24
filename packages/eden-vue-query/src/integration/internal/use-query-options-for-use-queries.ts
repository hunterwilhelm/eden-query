import type { QueryKey, UseQueryOptions } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'

import type { DistributiveOmit } from '../../utils/types'
import type { EdenQueryBaseOptions } from './query-base-options'
import type { EdenQueryKey } from './query-key'

export type UseQueryOptionsForUseQueries<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = DistributiveOmit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>

export type EdenUseQueryOptionsForUseQueries<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = MaybeRef<UseQueryOptionsForUseQueries<TQueryFnData, TError, TData, TQueryKey> &
EdenQueryBaseOptions & {
  queryKey: EdenQueryKey
}>
