/* eslint-disable @typescript-eslint/no-floating-promises */
import type { Query } from 'mongoose'
import type { QueryOptions } from './get-query-schema'
import type { Options } from '../types'

export function getBuildQuery(options: Pick<Options, 'lean' | 'limit' | 'readPreference'>) {
  return function buildQuery<T>(query: Query<T, T> & { op?: string }, queryOptions?: QueryOptions): Promise<Query<T, T>> {
    return new Promise((resolve) => {
      if (!queryOptions) {
        resolve(query)
        return
      }

      applyQueryOptions(query, queryOptions, options)
      resolve(query)
    })
  }
}

function applyQueryOptions<T>(query: Query<T, T> & { op?: string }, queryOptions: QueryOptions, options: Pick<Options, 'lean' | 'limit' | 'readPreference'>): void {
  applyQuery(query, queryOptions)
  applySkip(query, queryOptions)
  applyLimit(query, queryOptions, options)
  applySort(query, queryOptions)
  applyPopulate(query, queryOptions)
  applySelect(query, queryOptions)
  applyDistinct(query, queryOptions)
  applyReadPreference(query, options)
  applyLean(query, options)
}

function applyQuery<T>(query: Query<T, T>, queryOptions: QueryOptions): void {
  if (queryOptions.query) {
    query.where(queryOptions.query)
  }
}

function applySkip<T>(query: Query<T, T>, queryOptions: QueryOptions): void {
  if (queryOptions.skip) {
    query.skip(queryOptions.skip)
  }
}

function applyLimit<T>(query: Query<T, T> & { op?: string }, queryOptions: QueryOptions, options: Pick<Options, 'limit'>): void {
  if (options.limit && (!queryOptions.limit || queryOptions.limit > options.limit)) {
    queryOptions.limit = options.limit
  }

  if (queryOptions.limit && query.op !== 'countDocuments' && !queryOptions.distinct) {
    query.limit(queryOptions.limit)
  }
}

function applySort<T>(query: Query<T, T>, queryOptions: QueryOptions): void {
  if (queryOptions.sort) {
    query.sort(queryOptions.sort as string)
  }
}

function applyPopulate<T>(query: Query<T, T>, queryOptions: QueryOptions): void {
  if (queryOptions.populate) {
    query.populate(queryOptions.populate as string)
  }
}

function applySelect<T>(query: Query<T, T>, queryOptions: QueryOptions): void {
  if (queryOptions.select) {
    query.select(queryOptions.select)
  }
}

function applyDistinct<T>(query: Query<T, T>, queryOptions: QueryOptions): void {
  if (queryOptions.distinct) {
    query.distinct(queryOptions.distinct)
  }
}

function applyReadPreference<T>(query: Query<T, T>, options: Pick<Options, 'readPreference'>): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (options.readPreference) {
    query.read(options.readPreference)
  }
}

function applyLean<T>(query: Query<T, T>, options: Pick<Options, 'lean'>): void {
  if (options.lean) {
    query.lean(options.lean)
  }
}