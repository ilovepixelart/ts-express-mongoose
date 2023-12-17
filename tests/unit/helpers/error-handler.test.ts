import mongoose from 'mongoose'
import { getErrorHandler } from '../../../src/helpers/error-handler'

import type { Request, Response } from 'express'

interface RequestData {
  erm?: Record<string, unknown>;
  params: Record<string, string>;
}

describe('errorHandler', () => {
  const onError: jest.Mock = jest.fn()
  const next: jest.Mock = jest.fn()

  const options = {
    idProperty: '_id',
    onError
  }

  it('is a function', () => {
    expect(typeof getErrorHandler).toBe('function')
  })

  it('returns a function', () => {
    expect(typeof getErrorHandler(options)).toBe('function')
  })

  it('sets statusCode 400 and calls onError', () => {
    const req: RequestData = {
      erm: {},
      params: {}
    }

    const err = new Error('Something went wrong')

    getErrorHandler(options)(err, req as Request, {} as Response, next)

    expect(options.onError).toHaveBeenCalledTimes(1)
    expect(req.erm?.statusCode).toBe(400)
  })

  it('sets statusCode 400 and calls onError with idProperty 42', () => {
    const options = {
      idProperty: '42',
      onError
    }

    const req: RequestData = {
      erm: {},
      params: {
        id: '42'
      }
    }

    const err = new Error('Something went wrong')

    getErrorHandler(options)(err, req as Request, {} as Response, next)

    expect(options.onError).toHaveBeenCalledTimes(1)
    expect(req.erm?.statusCode).toBe(400)
  })

  it('sets statusCode 404 and calls onError', () => {
    const req: RequestData = {
      erm: {},
      params: {
        id: '42'
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const err = new mongoose.CastError('type', '42', '_id')

    getErrorHandler(options)(err, req as Request, {} as Response, next)

    expect(options.onError).toHaveBeenCalledTimes(1)
    expect(req.erm?.statusCode).toBe(404)
  })
})