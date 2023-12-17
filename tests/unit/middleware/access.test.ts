import { getAccessHandler } from '../../../src/middleware/access'

describe('access', () => {
  let next: jest.Mock
  let onError: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    onError = jest.fn()
  })

  describe('returns (sync)', () => {
    test('adds access field to req', () => {
      const req = {
        erm: {}
      }

      getAccessHandler({
        access: () => 'private',
        onError,
        idProperty: '_id'
      })(req, {}, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(req.access).toBe('private')
    })

    test('throws an exception with unsupported parameter', () => {
      const req = {
        erm: {}
      }

      getAccessHandler({
        access: () => 'foo',
        onError,
        idProperty: '_id'
      })(req, {}, next)

      expect(next).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(new Error('Unsupported access, must be "public", "private" or "protected"'), req, {}, next)
      expect(req.access).toBeUndefined()
    })
  })

  describe('yields (async)', () => {
    test('adds access field to req', async () => {
      const req = {
        erm: {}
      }
  
      await getAccessHandler({
        access: () => Promise.resolve('private'),
        onError,
        idProperty: '_id'
      })(req, {}, next)
  
      expect(req.access).toBe('private')
    })
  
    test('calls onError with unsupported parameter', async () => {
      const req = {
        erm: {}
      }
  
      await getAccessHandler({
        access: () => Promise.resolve('foo'),
        onError,
        idProperty: '_id'
      })(req, {}, next)
  
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(new Error('Unsupported access, must be "public", "private" or "protected"'), req, {}, next)
      expect(next).not.toHaveBeenCalled()
      expect(req.access).toBeUndefined()
    })
  
    test('calls onError when access function rejects', async () => {
      const req = {
        erm: {}
      }
      const err = new Error('Something bad happened')
  
      await getAccessHandler({
        access: () => Promise.reject(err),
        onError,
        idProperty: '_id'
      })(req, {}, next)
  
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(err, req, {}, next)
      expect(next).not.toHaveBeenCalled()
      expect(req.access).toBeUndefined()
    })
  })
})