/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { STATUS_CODES } from 'http'
import { getErrorHandler } from '../helpers/error-handler'

import type { RequestHandler } from 'express'
import type { Model, Document } from 'mongoose'
import type { Options } from '../types'

export function getFilterAndFindByIdHandler <T>(options: Pick<Options, 'contextFilter' | 'idProperty' | 'onError' | 'readPreference'>, model: Model<T>): RequestHandler {
  const errorHandler = getErrorHandler(options)

  const fn: RequestHandler = function filterAndFindById(req, res, next) {
    const contextModel = model

    if (!req.params['id']) {
      next()
      return
    }

    options.contextFilter(contextModel, req, (filteredContext) => {
      filteredContext
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        .findOne()
        .and({ [options.idProperty]: req.params['id'] })
        .lean(false)
        .read(options.readPreference || 'p')
        .exec()
        .then((doc: Document | null) => {
          if (!doc) {
            errorHandler(new Error(STATUS_CODES[404]), req, res, next); return
          }

          req.erm.document = doc
          next()
        })
        .catch((err: Error) => { errorHandler(err, req, res, next) })
    })
  }

  return fn
}
