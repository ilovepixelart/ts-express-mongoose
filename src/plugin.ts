import { deprecate } from 'util'
import { getAccessHandler } from './middleware/access'
import { getEnsureContentTypeHandler } from './middleware/ensure-content-type'
import { getFilterAndFindByIdHandler } from './middleware/filter-and-find-by-id'
import { getOnErrorHandler } from './middleware/on-error'
import { getOutputFnHandler } from './middleware/output-fn'
import { getPrepareOutputHandler } from './middleware/prepare-output'
import { getPrepareQueryHandler } from './middleware/prepare-query'
import { operations } from './helpers/operations'
import { Filter } from './helpers/resource-filter'

import type { Application } from 'express'
import type { Model } from 'mongoose'
import type { Options } from './types'

const defaultOptions: Omit<Options, 'contextFilter' | 'outputFn' | 'onError'> = {
  prefix: '/api',
  version: '/v1',
  idProperty: '_id',
  allowRegex: false,
  runValidators: false,
  readPreference: 'primary',
  totalCountHeader: false,
  private: [],
  protected: [],
  lean: true,
  findOneAndUpdate: true,
  findOneAndRemove: true,
  upsert: false,
  preMiddleware: [],
  preCreate: [],
  preRead: [],
  preUpdate: [],
  preDelete: []
}

const filter = new Filter()

export function serve(app: Application, model: Model<unknown>, options: Partial<Options> = {}): string {
  const serveOptions: Options = {
    ...defaultOptions,
    name: typeof options.name === 'string' ? options.name : model.modelName,
    contextFilter: (model, _req, done) => { done(model) },
    outputFn: getOutputFnHandler(),
    onError: getOnErrorHandler(),
    ...options
  }

  model.schema.eachPath((name, path) => {
    const access = path.options['access'] as string | undefined
    if (access) {
      switch (access.toLowerCase()) {
      case 'private':
        serveOptions.private.push(name)
        break
      case 'protected':
        serveOptions.protected.push(name)
        break
      }
    }
  })

  filter.add(model, {
    filteredKeys: {
      private: serveOptions.private,
      protected: serveOptions.protected
    }
  })

  const ops = operations(model, serveOptions, filter)

  let uriItem = `${serveOptions.prefix}${serveOptions.version}/${serveOptions.name}`

  if (!uriItem.includes('/:id')) {
    uriItem += '/:id'
  }

  const uriItems = uriItem.replace('/:id', '')
  const uriCount = uriItems + '/count'
  const uriShallow = uriItem + '/shallow'

  app.use((req, _res, next) => {
    req.erm = {}

    next()
  })

  const accessMiddleware = serveOptions.access
    ? getAccessHandler({ access: serveOptions.access, idProperty: serveOptions.idProperty, onError: serveOptions.onError })
    : []

  const ensureContentType = getEnsureContentTypeHandler(serveOptions)
  const filterAndFindById = getFilterAndFindByIdHandler(serveOptions, model)
  const prepareQuery = getPrepareQueryHandler(serveOptions)
  const prepareOutput = getPrepareOutputHandler(
    serveOptions,
    model.modelName,
    filter
  )

  app.get(
    uriItems,
    prepareQuery,
    serveOptions.preMiddleware,
    serveOptions.preRead,
    accessMiddleware,
    ops.getItems,
    prepareOutput
  )

  app.get(
    uriCount,
    prepareQuery,
    serveOptions.preMiddleware,
    serveOptions.preRead,
    accessMiddleware,
    ops.getCount,
    prepareOutput
  )

  app.get(
    uriItem,
    prepareQuery,
    serveOptions.preMiddleware,
    serveOptions.preRead,
    accessMiddleware,
    ops.getItem,
    prepareOutput
  )

  app.get(
    uriShallow,
    prepareQuery,
    serveOptions.preMiddleware,
    serveOptions.preRead,
    accessMiddleware,
    ops.getShallow,
    prepareOutput
  )

  app.post(
    uriItems,
    prepareQuery,
    ensureContentType,
    serveOptions.preMiddleware,
    serveOptions.preCreate,
    accessMiddleware,
    ops.createObject,
    prepareOutput
  )

  app.post(
    uriItem,
    deprecate(prepareQuery, 'ts-express-mongoose: in a future major version, the POST method to update resources will be removed. Use PATCH instead.'),
    ensureContentType,
    serveOptions.preMiddleware,
    serveOptions.findOneAndUpdate? [] : filterAndFindById,
    serveOptions.preUpdate,
    accessMiddleware,
    ops.modifyObject,
    prepareOutput
  )

  app.put(
    uriItem,
    deprecate(prepareQuery, 'ts-express-mongoose: in a future major version, the PUT method will replace rather than update a resource. Use PATCH instead.'),
    ensureContentType,
    serveOptions.preMiddleware,
    serveOptions.findOneAndUpdate ? [] : filterAndFindById,
    serveOptions.preUpdate,
    accessMiddleware,
    ops.modifyObject,
    prepareOutput
  )

  app.patch(
    uriItem,
    prepareQuery,
    ensureContentType,
    serveOptions.preMiddleware,
    serveOptions.findOneAndUpdate ? [] : filterAndFindById,
    serveOptions.preUpdate,
    accessMiddleware,
    ops.modifyObject,
    prepareOutput
  )

  app.delete(
    uriItems,
    prepareQuery,
    serveOptions.preMiddleware,
    serveOptions.preDelete,
    ops.deleteItems,
    prepareOutput
  )

  app.delete(
    uriItem,
    prepareQuery,
    serveOptions.preMiddleware,
    serveOptions.findOneAndRemove ? [] : filterAndFindById,
    serveOptions.preDelete,
    ops.deleteItem,
    prepareOutput
  )

  return uriItems
}
