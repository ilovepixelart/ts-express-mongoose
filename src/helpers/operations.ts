/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// @ts-nocheck Refine the types

import isPlainObject from 'lodash.isplainobject'
import { STATUS_CODES } from 'http'
import { getBuildQuery } from './build-query'
import { getErrorHandler } from './error-handler'
import { moreDots } from './more-dots'

import type { NextFunction, Request, RequestHandler } from 'express'
import type { Model} from 'mongoose'
import type { Filter } from './resource-filter'
import type { Options } from '../types'

export function operations(
  model: Model<unknown>,
  options: Pick<
    Options,
    | 'contextFilter'
    | 'findOneAndRemove'
    | 'findOneAndUpdate'
    | 'idProperty'
    | 'lean'
    | 'limit'
    | 'onError'
    | 'readPreference'
    | 'runValidators'
    | 'totalCountHeader'
    | 'upsert'
  >,
  filter: Filter
) {
  const buildQuery = getBuildQuery(options)
  const errorHandler = getErrorHandler(options)

  function findById <T>(filteredContext: Model<T>, id: unknown) {
    return filteredContext.findOne().and([
      {
        [options.idProperty]: id
      }
    ])
  }

  function isDistinctExcluded(req: Request) {
    if (!req.erm.query?.distinct) {
      return false
    }

    return filter
      .getExcluded({
        access: req.access,
        modelName: model.modelName
      })
      .includes(req.erm.query.distinct)
  }

  const getItems: RequestHandler = function (req, res, next) {
    const contextModel = model

    if (isDistinctExcluded(req)) {
      req.erm.result = []
      req.erm.statusCode = 200
      next(); return
    }

    options.contextFilter(contextModel, req, (filteredContext) => {
      buildQuery<Record<string, unknown>[]>(
        filteredContext.find(),
        req.erm.query
      )
        .then((items) => {
          req.erm.result = items
          req.erm.statusCode = 200

          if (options.totalCountHeader && !req.erm.query?.distinct) {
            options.contextFilter(contextModel, req, (countFilteredContext) => {
              buildQuery<number>(countFilteredContext.countDocuments(), {
                ...req.erm.query,
                skip: 0,
                limit: 0
              })
                .then((count) => {
                  req.erm.totalCount = count
                  next()
                })
                .catch((err) => { errorHandler(err, req, res, next) })
            })
          } else {
            next()
          }
        })
        .catch((err) => { errorHandler(err, req, res, next) })
    })
  }

  const getCount: RequestHandler = function (req, res, next) {
    const contextModel = model

    options.contextFilter(contextModel, req, (filteredContext) => {
      buildQuery(filteredContext.countDocuments(), req.erm.query)
        .then((count) => {
          req.erm.result = { count: count }
          req.erm.statusCode = 200

          next()
        })
        .catch((err) => { errorHandler(err, req, res, next) })
    })
  }

  const getShallow: RequestHandler = function (req, res, next) {
    const contextModel = model

    options.contextFilter(contextModel, req, (filteredContext) => {
      buildQuery<Record<string, unknown> | null>(
        findById(filteredContext, req.params.id),
        req.erm.query
      )
        .then((item) => {
          if (!item) {
            errorHandler(new Error(STATUS_CODES[404]), req, res, next); return
          }

          for (const prop in item) {
            item[prop] =
              typeof item[prop] === 'object' && prop !== '_id'
                ? true
                : item[prop]
          }

          req.erm.result = item
          req.erm.statusCode = 200

          next()
        })
        .catch((err) => { errorHandler(err, req, res, next) })
    })
  }

  const deleteItems: RequestHandler = function (req, res, next) {
    const contextModel = model

    options.contextFilter(contextModel, req, (filteredContext) => {
      buildQuery(filteredContext.deleteMany(), req.erm.query)
        .then(() => {
          req.erm.statusCode = 204

          next()
        })
        .catch((err) => { errorHandler(err, req, res, next) })
    })
  }

  const getItem: RequestHandler = function (req, res, next) {
    const contextModel = model

    if (isDistinctExcluded(req)) {
      req.erm.result = []
      req.erm.statusCode = 200
      next(); return
    }

    options.contextFilter(contextModel, req, (filteredContext) => {
      buildQuery<Record<string, unknown> | null>(
        findById(filteredContext, req.params.id),
        req.erm.query
      )
        .then((item) => {
          if (!item) {
            errorHandler(new Error(STATUS_CODES[404]), req, res, next); return
          }

          req.erm.result = item
          req.erm.statusCode = 200

          next()
        })
        .catch((err) => { errorHandler(err, req, res, next) })
    })
  }

  const deleteItem: RequestHandler = function (req, res, next) {
    const contextModel = model

    if (options.findOneAndRemove) {
      options.contextFilter(contextModel, req, (filteredContext) => {
        findById(filteredContext, req.params.id)
          .findOneAndRemove()
          .then((item) => {
            if (!item) {
              errorHandler(new Error(STATUS_CODES[404]), req, res, next); return
            }

            req.erm.statusCode = 204

            next()
          })
          .catch((err: Error) => { errorHandler(err, req, res, next) })
      })
    } else {
      req.erm.document
        ?.remove()
        .then(() => {
          req.erm.statusCode = 204

          next()
        })
        .catch((err: Error) => { errorHandler(err, req, res, next) })
    }
  }

  const createObject: RequestHandler = function (req, res, next) {
    const contextModel = model

    req.body = filter.filterObject(req.body ?? {}, {
      access: req.access,
      modelName: model.modelName,
      populate: req.erm.query?.populate
    })

    if (req.body._id === null) {
      delete req.body._id
    }

    if (contextModel.schema.options.versionKey) {
      delete req.body[contextModel.schema.options.versionKey]
    }

    contextModel
      .create(req.body)
      .then((item) => {
        return contextModel.populate(item, req.erm.query?.populate ?? [])
      })
      .then((item) => {
        req.erm.result = item as unknown as Record<string, unknown>
        req.erm.statusCode = 201

        next()
      })
      .catch((err) => { errorHandler(err, req, res, next) })
  }

  const handleArrayValue = (key: string, value: unknown, dst: Record<string, unknown>) => {
    for (const item of value) {
      if (typeof item === 'object') {
        dst[key] = dst[key] ?? [] as unknown[]
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        dst[key].push((item as { _id: unknown })._id)
      }
    }
  }
  
  const handleObjectValue = (key: string, value: unknown, dst: Record<string, unknown>) => {
    dst[key] = (value as { _id: unknown })._id
  }
  
  const handlePlainObjectValue = (key: string, value: unknown, dst: Record<string, unknown>, path: unknown, contextModel: Model<unknown>) => {
    if (path && path.instance === 'ObjectID') {
      dst[key] = (value as { _id: unknown })._id
    } else {
      dst[key] = depopulate(value, contextModel)
    }
  }
  
  const depopulate = (src: Record<string, unknown>, contextModel: Model<unknown>) => {
    const dst: Record<string, unknown> = {}
  
    for (const [key, value] of Object.entries(src)) {
      const path = contextModel.schema.path(key)
  
      if (path.caster && path.caster.instance === 'ObjectID') {
        if (Array.isArray(value)) {
          handleArrayValue(key, value, dst)
        } else if (isPlainObject(value)) {
          handleObjectValue(key, value, dst)
        }
      } else if (isPlainObject(value)) {
        handlePlainObjectValue(key, value, dst, path, contextModel)
      }
  
      if (typeof dst[key] === 'undefined') {
        dst[key] = value
      }
    }
  
    return dst
  }

  const findOneAndUpdateOption = function (
    req: Request, 
    res: Response, 
    next: NextFunction, 
    cleanBody: Record<string, T>,
    contextModel: Model<T>
  ) {
    options.contextFilter(contextModel, req, (filteredContext) => {
      findById(filteredContext, req.params.id)
        .findOneAndUpdate(
          {},
          {
            $set: cleanBody
          },
          {
            new: true,
            upsert: options.upsert,
            runValidators: options.runValidators
          }
        )
        .exec()
        .then((item) => {
          return contextModel.populate(item, req.erm.query?.populate ?? [])
        })
        .then((item) => {
          if (!item) {
            errorHandler(new Error(STATUS_CODES[404]), req, res, next); return
          }
  
          req.erm.result = item as unknown as Record<string, unknown>
          req.erm.statusCode = 200
  
          next()
        })
        .catch((err) => { errorHandler(err, req, res, next) })
    })
  }
  
  const saveOption = function (
    req: Request, 
    res: Response, 
    next: NextFunction, 
    cleanBody: Record<string, T>, // Replace with the actual type of cleanBody
    contextModel: Model<T> // Replace with the actual type of contextModel
  ) {
    for (const [key, value] of Object.entries(cleanBody)) {
      req.erm.document?.set(key, value)
    }
  
    req.erm.document
      ?.save()
      .then((item) => {
        return contextModel.populate(item, req.erm.query?.populate ?? [])
      })
      .then((item) => {
        req.erm.result = item as unknown as Record<string, unknown>
        req.erm.statusCode = 200
  
        next()
      })
      .catch((err: Error) => { errorHandler(err, req, res, next) })
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const modifyObject: RequestHandler = function (req, res, next) {
    const contextModel = model

    req.body = filter.filterObject(req.body ?? {}, {
      access: req.access,
      modelName: model.modelName,
      populate: req.erm.query?.populate
    })

    delete req.body._id

    if (contextModel.schema.options.versionKey) {
      delete req.body[contextModel.schema.options.versionKey]
    }

    const cleanBody = moreDots(depopulate(req.body))

    if (options.findOneAndUpdate) {
      findOneAndUpdateOption(req, res, next, cleanBody, contextModel)
    } else {
      saveOption(req, res, next, cleanBody, contextModel)
    }
  }

  return {
    getItems,
    getCount,
    getItem,
    getShallow,
    createObject,
    modifyObject,
    deleteItems,
    deleteItem
  }
}
