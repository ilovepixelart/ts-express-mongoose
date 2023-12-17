import type { OutputFn } from '../types'

export function getOutputFnHandler(): OutputFn {
  const fn: OutputFn = function outputFn(req, res) {
    if (!req.erm.statusCode) {
      throw new Error('statusCode not set')
    }

    if (req.erm.result) {
      res.status(req.erm.statusCode).json(req.erm.result)
    } else {
      res.sendStatus(req.erm.statusCode)
    }

  }

  return fn
}
