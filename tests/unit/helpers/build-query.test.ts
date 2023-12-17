import { getBuildQuery } from '../../../src/helpers/build-query'

describe('buildQuery', () => {
  const query = {
    where: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    sort: jest.fn(),
    select: jest.fn(),
    populate: jest.fn(),
    distinct: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not call any methods and returns a query object', async () => {
    const result = await getBuildQuery({})(query)
    for (const key in query) {
      expect(query[key]).not.toHaveBeenCalled()
    }
    
    expect(result).toEqual(query)
  })

  describe('query', () => {
    it('calls where and returns a query object', async () => {
      const queryOptions = {
        query: 'foo'
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.where).toHaveBeenCalledTimes(1)
      expect(query.where).toHaveBeenCalledWith(queryOptions.query)
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.limit).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })

  describe('skip', () => {
    it('calls skip and returns a query object', async () => {
      const queryOptions = {
        skip: '1'
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.skip).toHaveBeenCalledTimes(1)
      expect(query.skip).toHaveBeenCalledWith(queryOptions.skip)
      expect(query.where).not.toHaveBeenCalled()
      expect(query.limit).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })

  describe('limit', () => {
    it('calls limit and returns a query object', async () => {
      const queryOptions = {
        limit: '1'
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.limit).toHaveBeenCalledTimes(1)
      expect(query.limit).toHaveBeenCalledWith(queryOptions.limit)
      expect(query.where).not.toHaveBeenCalled()
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })

    it('calls limit and returns a query object options.limit 1 and queryOptions.limit "2"', async () => {
      const options = {
        limit: 1
      }

      const queryOptions = {
        limit: '2'
      }

      const result = await getBuildQuery(options)(query, queryOptions)
      expect(query.limit).toHaveBeenCalledTimes(1)
      expect(query.limit).toHaveBeenCalledWith(options.limit)
      expect(query.where).not.toHaveBeenCalled()
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })

    it('does not call limit on count endpoint and returns a query object', async () => {
      const queryOptions = {
        limit: '2'
      }

      query.op = 'countDocuments'

      const result = await getBuildQuery({})(query, queryOptions)
      delete query.op
      for (const key in query) {
        expect(query[key]).not.toHaveBeenCalled()
      }
      expect(result).toEqual(query)
    })

    it('does not call limit on count endpoint and returns a query object options.limit 1 and queryOptions.limit "2"', async () => {
      const options = {
        limit: 1
      }

      const queryOptions = {
        limit: '2'
      }

      query.op = 'countDocuments'

      const result = await getBuildQuery(options)(query, queryOptions)
      delete query.op
      for (const key in query) {
        expect(query[key]).not.toHaveBeenCalled()
      }
      expect(result).toEqual(query)
    })

    it('does not call limit on queries that have a distinct option set and returns the query object', async () => {
      const options = {
        limit: 1
      }

      const queryOptions = {
        distinct: 'name'
      }

      const result = await getBuildQuery(options)(query, queryOptions)
      for (const key in query) {
        if (key === 'distinct') continue
        expect(query[key]).not.toHaveBeenCalled()
      }
      expect(query.distinct).toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })

  describe('sort', () => {
    it('calls sort and returns a query object', async () => {
      const queryOptions = {
        sort: 'foo'
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.sort).toHaveBeenCalledTimes(1)
      expect(query.sort).toHaveBeenCalledWith(queryOptions.sort)
      expect(query.where).not.toHaveBeenCalled()
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.limit).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })

  describe('select', () => {
    it('accepts an object', async () => {
      const queryOptions = {
        select: {
          foo: 1,
          bar: 0
        }
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.select).toHaveBeenCalledTimes(1)
      expect(query.select).toHaveBeenCalledWith({
        foo: 1,
        bar: 0
      })
      expect(query.where).not.toHaveBeenCalled()
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.limit).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })

  describe('populate', () => {
    it('accepts an object wrapped in an array to populate a path', async () => {
      const queryOptions = {
        populate: [
          {
            path: 'foo.bar',
            select: 'baz',
            match: { qux: 'quux' },
            options: { sort: 'baz' }
          }
        ]
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.populate).toHaveBeenCalledTimes(1)
      expect(query.populate).toHaveBeenCalledWith([
        {
          path: 'foo.bar',
          select: 'baz',
          match: { qux: 'quux' },
          options: { sort: 'baz' }
        }
      ])
      expect(query.where).not.toHaveBeenCalled()
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.limit).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.distinct).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })

  describe('distinct', () => {
    it('calls distinct and returns a query object', async () => {
      const queryOptions = {
        distinct: 'foo'
      }

      const result = await getBuildQuery({})(query, queryOptions)
      expect(query.distinct).toHaveBeenCalledTimes(1)
      expect(query.distinct).toHaveBeenCalledWith('foo')
      expect(query.where).not.toHaveBeenCalled()
      expect(query.skip).not.toHaveBeenCalled()
      expect(query.limit).not.toHaveBeenCalled()
      expect(query.sort).not.toHaveBeenCalled()
      expect(query.populate).not.toHaveBeenCalled()
      expect(query.select).not.toHaveBeenCalled()
      expect(result).toEqual(query)
    })
  })
})
