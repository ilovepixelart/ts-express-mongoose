import { getEnsureContentTypeHandler } from '../../../src/middleware/ensure-content-type'

import type { ErrorRequestHandler, Request, Response } from 'express'

interface RequestData {
  erm?: Record<string, unknown>;
  headers: Record<string, string>;
  params: Record<string, string>;
  access?: unknown;
}

interface Options {
  idProperty: string;
  onError: ErrorRequestHandler;
}

describe('ensureContentType', () => {
  const onError: jest.Mock = jest.fn()
  const next: jest.Mock = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls next with an error (missing_content_type)', () => {
    const req: RequestData = {
      erm: {},
      headers: {},
      params: {}
    }

    const options: Options = {
      idProperty: '_id',
      onError
    }

    getEnsureContentTypeHandler(options)(req as Request, {} as Response, next)

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error), // equivalent to sinon.match.instanceOf(Error)
      req,
      {},
      next
    )
    expect(next).not.toHaveBeenCalled()
    expect(req.access).toBeUndefined()
  })

  it('calls next with an error (invalid_content_type)', () => {
    const req: RequestData = {
      erm: {},
      headers: {
        'content-type': 'invalid/type'
      },
      params: {}
    }

    const options: Options = {
      idProperty: '_id',
      onError
    }

    getEnsureContentTypeHandler(options)(req as Request, {} as Response, next)

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error), // equivalent to sinon.match.instanceOf(Error)
      req,
      {},
      next
    )
    expect(next).not.toHaveBeenCalled()
    expect(req.access).toBeUndefined()
  })

  it('calls next', () => {
    const req: RequestData = {
      headers: {
        'content-type': 'application/json'
      },
      params: {}
    }

    const options: Options = {
      idProperty: '_id',
      onError
    }

    getEnsureContentTypeHandler(options)(req as Request, {} as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })
})