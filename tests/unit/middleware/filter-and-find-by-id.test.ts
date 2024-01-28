import { getFilterAndFindByIdHandler } from '../../../src/middleware/filter-and-find-by-id'
import type { Model, Document, FilterQuery } from 'mongoose'
import type { Request, Response, NextFunction } from 'express'

interface MockModel extends Model<Document> {
  findOne: jest.Mock;
}

interface MockRequest extends Request {
  params: {
    id?: string;
  };
  erm: {
    document?: Document;
    contextFilter?: (model: Model<Document>, req: Request, callback: (filteredContext: FilterQuery<Document>) => void) => void;
    idProperty?: string;
  };
}

jest.mock('../../../src/helpers/error-handler', () => ({
  getErrorHandler: jest.fn().mockReturnValue((err, req, res, next) => next(err))
}))

describe('getFilterAndFindByIdHandler', () => {
  it('should call next if id is not in params', () => {
    const mockModel = {} as MockModel
    const mockReq = { params: {} } as MockRequest
    const mockRes = {} as Response
    const mockNext = jest.fn() as NextFunction

    const handler = getFilterAndFindByIdHandler({}, mockModel)
    handler(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle document not found', async () => {
    const mockModel = {} as MockModel
    const mockReq = { params: { id: '123' }, erm: {} } as MockRequest
    const mockRes = {} as Response
    const mockNext = jest.fn() as NextFunction

    const handler = getFilterAndFindByIdHandler({
      contextFilter: (model, req, callback) => {
        callback({
          findOne: () => ({
            and: () => ({
              lean: () => ({
                read: () => ({
                  exec: () => Promise.resolve(null)
                })
              })
            })
          })
        })
      },
      idProperty: 'id',
      onError: jest.fn(),
      readPreference: 'primary'
    }, mockModel)

    await handler(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle document found', async () => {
    const mockModel = {} as MockModel
    const mockReq = { params: { id: '123' }, erm: {} } as MockRequest
    const mockRes = {} as Response
    const mockNext = jest.fn() as NextFunction

    const handler = getFilterAndFindByIdHandler({
      contextFilter: (model, req, callback) => {
        callback({
          findOne: () => ({
            and: () => ({
              lean: () => ({
                read: () => ({
                  exec: () => Promise.resolve({ _id: '123' } as Document)
                })
              })
            })
          })
        })
      },
      idProperty: 'id',
      onError: jest.fn(),
      readPreference: 'primary'
    }, mockModel)

    await handler(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.erm.document).toEqual({ _id: '123' })
  })

  it('should call next and return if id is not in params', () => {
    const mockModel = {} as MockModel
    const mockReq = { params: {} } as MockRequest
    const mockRes = {} as Response
    const mockNext = jest.fn() as NextFunction
  
    const handler = getFilterAndFindByIdHandler({}, mockModel)
    handler(mockReq, mockRes, mockNext)
  
    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.erm).toBeUndefined()
  })
})