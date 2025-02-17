import type { FetchQueryOptions } from '@tanstack/vue-query'

import type { DistributiveOmit } from '../../utils/types'
import type { EdenQueryBaseOptions } from '../internal/query-base-options'

// I'm unsure why we need to omit these properties, but not doing it causes type errors
// It would be nice to understand why we need to do this
export type EdenFetchQueryOptions<TOutput, TError> = DistributiveOmit<
  FetchQueryOptions<TOutput, TError>,
  'queryKey'
> &
  EdenQueryBaseOptions
