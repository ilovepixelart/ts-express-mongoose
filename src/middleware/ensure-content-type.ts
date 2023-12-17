import { getErrorHandler } from '../helpers/error-handler'

import type { RequestHandler } from 'express'
import type { Options } from '../types'

export function getEnsureContentTypeHandler(options: Pick<Options, 'idProperty' | 'onError'>): RequestHandler {
  const errorHandler = getErrorHandler(options)

  const fn: RequestHandler = function ensureContentType(req, res, next) {
    const contentType = req.headers['content-type']

    if (!contentType) {
      errorHandler(new Error('missing_content_type'), req, res, next); return
    }

    if (!contentType.includes('application/json')) {
      errorHandler(new Error('invalid_content_type'), req, res, next); return
    }

    next()
  }

  return fn
}
