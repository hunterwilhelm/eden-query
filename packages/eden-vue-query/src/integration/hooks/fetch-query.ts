import type { FetchQueryOptions } from '@tanstack/vue-query'

import type { DistributiveOmit } from '../../utils/types'
import type { EdenQueryBaseOptions } from '../internal/query-base-options'

export type EdenFetchQueryOptions<TOutput, TError> = DistributiveOmit<
  FetchQueryOptions<TOutput, TError>,
  'queryKey'
> &
  EdenQueryBaseOptions
