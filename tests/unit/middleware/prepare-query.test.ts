import { getPrepareQueryHandler } from '../../../src/middleware/prepare-query'

interface Options {
  onError: jest.Mock;
  allowRegex: boolean;
}

describe('prepareQuery', () => {
  const options: Options = {
    onError: jest.fn(),
    allowRegex: true
  }

  const next = jest.fn()

  afterEach(() => {
    options.onError.mockReset()
    next.mockReset()
  })

  describe('jsonQueryParser', () => {
    it('converts $regex to undefined', () => {
      const req = {
        query: {
          query: '{"foo":{"$regex":"bar"}}'
        }
      }

      getPrepareQueryHandler({ ...options, allowRegex: false })(req, {}, next)

      expect(options.onError).toHaveBeenCalledTimes(1)
      expect(options.onError).toHaveBeenCalledWith(expect.any(Error), req, {}, next)
      expect(next).not.toHaveBeenCalled()
    })

    it('converts [] to $in', () => {
      const req = {
        query: {
          query: '{"foo":["bar"]}'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        query: {
          foo: { $in: ['bar'] }
        }
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })
  })

  it('calls next when query is empty', () => {
    getPrepareQueryHandler(options)({}, {}, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('ignores keys that are not whitelisted and calls next', () => {
    const req = {
      query: {
        foo: 'bar'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls next when query key is valid json', () => {
    const req = {
      query: {
        query: '{"foo":"bar"}'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual({
      query: JSON.parse(req.query.query)
    })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls onError when query key is invalid json', () => {
    const req = {
      erm: {},
      params: {},
      query: {
        query: 'not json'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(options.onError).toHaveBeenCalledTimes(1)
    expect(options.onError).toHaveBeenCalledWith(expect.any(Error), req, {}, next)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when sort key is valid json', () => {
    const req = {
      query: {
        sort: '{"foo":"asc"}'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual({
      sort: JSON.parse(req.query.sort)
    })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls next when sort key is a string', () => {
    const req = {
      query: {
        sort: 'foo'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual(req.query)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls next when skip key is a string', () => {
    const req = {
      query: {
        skip: 1
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual(req.query)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls next when limit key is a string', () => {
    const req = {
      query: {
        limit: 1
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual(req.query)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls next when distinct key is a string', () => {
    const req = {
      query: {
        distinct: 'foo'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual(req.query)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  it('calls next when populate key is a string', () => {
    const req = {
      query: {
        populate: 'foo'
      }
    }

    getPrepareQueryHandler(options)(req, {}, next)

    expect(req.erm.query).toEqual({
      populate: [
        {
          path: 'foo',
          strictPopulate: false
        }
      ]
    })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
    expect(options.onError).not.toHaveBeenCalled()
  })

  describe('select', () => {
    it('parses a string to include fields', () => {
      const req = {
        query: {
          select: 'foo'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        select: {
          foo: 1
        }
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('parses a string to exclude fields', () => {
      const req = {
        query: {
          select: '-foo'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        select: {
          foo: 0
        }
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('parses a comma separated list of fields to include', () => {
      const req = {
        query: {
          select: 'foo,bar'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        select: {
          foo: 1,
          bar: 1
        }
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('parses a comma separated list of fields to exclude', () => {
      const req = {
        query: {
          select: '-foo,-bar'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        select: {
          foo: 0,
          bar: 0
        }
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('parses a comma separated list of nested fields', () => {
      const req = {
        query: {
          select: 'foo.bar,baz.qux.quux'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        select: {
          'foo.bar': 1,
          'baz.qux.quux': 1
        }
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })
  })

  describe('populate', () => {
    it('parses a string to populate a path', () => {
      const req = {
        query: {
          populate: 'foo'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        populate: [
          {
            path: 'foo',
            strictPopulate: false
          }
        ]
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('parses a string to populate multiple paths', () => {
      const req = {
        query: {
          populate: 'foo,bar'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        populate: [
          {
            path: 'foo',
            strictPopulate: false
          },
          {
            path: 'bar',
            strictPopulate: false
          }
        ]
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('accepts an object to populate a path', () => {
      const req = {
        query: {
          populate: {
            path: 'foo.bar',
            select: 'baz',
            match: { qux: 'quux' },
            options: { sort: 'baz' }
          }
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        populate: [
          {
            path: 'foo.bar',
            select: 'baz',
            match: { qux: 'quux' },
            options: { sort: 'baz' },
            strictPopulate: false
          }
        ]
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })

    it('parses a string to populate and select fields', () => {
      const req = {
        query: {
          populate: 'foo',
          select: 'foo.bar,foo.baz'
        }
      }

      getPrepareQueryHandler(options)(req, {}, next)

      expect(req.erm.query).toEqual({
        populate: [
          {
            path: 'foo',
            select: 'bar baz',
            strictPopulate: false
          }
        ]
      })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
      expect(options.onError).not.toHaveBeenCalled()
    })
  })
})
