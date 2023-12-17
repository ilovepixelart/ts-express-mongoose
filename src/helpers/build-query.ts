/* eslint-disable @typescript-eslint/no-floating-promises */
import type { Query } from 'mongoose'
import type { QueryOptions } from './get-query-schema'
import type { Options } from '../types'

export function getBuildQuery(options: Pick<Options, 'lean' | 'limit' | 'readPreference'>) {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  return function buildQuery<T>(query: Query<T, T> & { op?: string }, queryOptions?: QueryOptions): Promise<Query<T, T>> {
    return new Promise((resolve) => {
      if (!queryOptions) {
        resolve(query)
        return
      }

      if (queryOptions.query) {
        query.where(queryOptions.query)
      }

      if (queryOptions.skip) {
        query.skip(queryOptions.skip)
      }

      if (options.limit && (!queryOptions.limit || queryOptions.limit > options.limit)) {
        queryOptions.limit = options.limit
      }

      if (queryOptions.limit && query.op !== 'countDocuments' && !queryOptions.distinct) {
        query.limit(queryOptions.limit)
      }

      if (queryOptions.sort) {
        query.sort(queryOptions.sort as string)
      }

      if (queryOptions.populate) {
        query.populate(queryOptions.populate as string)
      }

      if (queryOptions.select) {
        query.select(queryOptions.select)
      }

      if (queryOptions.distinct) {
        query.distinct(queryOptions.distinct)
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (options.readPreference) {
        query.read(options.readPreference)
      }

      if (options.lean) {
        query.lean(options.lean)
      }

      resolve(query)
    })
  }
}
