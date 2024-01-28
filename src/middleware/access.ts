import type { RequestHandler } from 'express'
import { getErrorHandler } from '../helpers/error-handler'
import type { Access, Options } from '../types'

export function accessCheck (access: Access): void {
  if (!['public', 'private', 'protected'].includes(access)) {
    throw new Error(
      'Unsupported access, must be "public", "private" or "protected"'
    )
  }
}

export function getAccessHandler(options: Required<Pick<Options, 'access' | 'idProperty' | 'onError'>>): RequestHandler {
  const errorHandler = getErrorHandler(options)

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const fn: RequestHandler = async function access(req, res, next): Promise<void> {
    const handler = function (access: Access): void {
      req.access = access
      next()
    }

    let result: Access | Promise<Access>

    try {
      result = options.access(req)
    } catch (err) {
      errorHandler(err, req, res, next)
      return
    }
    
    if (result instanceof Promise) {
      try {
        const access = await result
        accessCheck(access)
        handler(access)
      } catch (err) {
        errorHandler(err, req, res, next)
      }
    } else {
      try {
        accessCheck(result)
        handler(result)
      } catch (err) {
        errorHandler(err, req, res, next)
      }
    }
  }

  return fn
}