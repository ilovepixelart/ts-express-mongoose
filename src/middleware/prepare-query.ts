import type { RequestHandler } from 'express'
import { getErrorHandler } from '../helpers/error-handler'
import { getQueryOptionsSchema } from '../helpers/get-query-schema'
import type { Options } from '../types'

export function getPrepareQueryHandler(options: Pick<Options, 'allowRegex' | 'idProperty' | 'onError'>): RequestHandler {
  const errorHandler = getErrorHandler(options)

  const fn: RequestHandler = function prepareQuery(req, res, next) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    req.erm = req.erm ?? {}

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      req.erm.query = getQueryOptionsSchema({ allowRegex: options.allowRegex }).parse(req.query ?? {})

      next()
    } catch (e) {
      const error = new Error('invalid_json_query')
      errorHandler(error, req, res, next)
      return
    }
  }

  return fn
}
