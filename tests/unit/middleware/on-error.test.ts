import { getOnErrorHandler } from '../../../src/middleware/on-error'

import type { Request, Response } from 'express'

describe('onError', () => {
  const req = {
    erm: {
      statusCode: 500
    }
  }

  const res = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  }

  const next: jest.Mock = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('with express', () => {
    const error = new Error('An error occurred')
    getOnErrorHandler()(error, req as unknown as Request, res as unknown as Response, next)

    expect(res.setHeader).toHaveBeenCalledTimes(1)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledWith({
      message: 'An error occurred',
      name: 'Error'
    })
    expect(next).not.toHaveBeenCalled()
  })
})