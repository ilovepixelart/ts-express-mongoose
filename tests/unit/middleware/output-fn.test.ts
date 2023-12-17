import { getOutputFnHandler } from '../../../src/middleware/output-fn'

describe('outputFn', () => {
  const res = {
    sendStatus: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('express', () => {
    it('sends status code and message', () => {
      const req = {
        erm: {
          statusCode: 200
        }
      }

      getOutputFnHandler()(req, res)

      expect(res.sendStatus).toHaveBeenCalledTimes(1)
      expect(res.sendStatus).toHaveBeenCalledWith(200)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
      expect(res.send).not.toHaveBeenCalled()
    })

    it('sends data and status code', () => {
      const req = {
        erm: {
          statusCode: 201,
          result: {
            name: 'Bob'
          }
        }
      }

      getOutputFnHandler()(req, res)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith({
        name: 'Bob'
      })
      expect(res.sendStatus).not.toHaveBeenCalled()
      expect(res.send).not.toHaveBeenCalled()
    })
  })
})