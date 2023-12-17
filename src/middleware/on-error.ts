import { serializeError } from 'serialize-error'

import type { ErrorRequestHandler } from 'express'
import type { HttpError } from 'http-errors'

export function getOnErrorHandler(): ErrorRequestHandler {
  const fn: ErrorRequestHandler = function onError(err: HttpError, req, res) {
    const serializedErr = serializeError(err)

    delete serializedErr.stack

    const errors = serializedErr['errors'] as Record<string, { reason?: string, stack?: string }> | undefined
    if (errors) {
      for (const key in errors) {
        if (errors[key]?.reason) delete errors[key]?.reason
        if (errors[key]?.stack) delete errors[key]?.stack
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(req.erm.statusCode ?? 500).send(serializedErr)
  }

  return fn
}
