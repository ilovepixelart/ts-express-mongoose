import { weedOut } from '../../src/helpers/weed-out'

describe('weedOut', () => {
  it('removes root keys', () => {
    const src = {
      foo: 'bar'
    }

    weedOut(src, 'foo')

    expect(src.foo).toBeUndefined()
  })

  it('ignores undefined root keys', () => {
    const src = {
      foo: 'bar'
    }

    weedOut(src, 'bar')

    expect(src).toEqual({
      foo: 'bar'
    })
  })

  it('removes nested keys', () => {
    const src = {
      foo: {
        bar: {
          baz: '42'
        }
      }
    }

    weedOut(src, 'foo.bar.baz')

    expect(src.foo.bar).toEqual({})
  })

  it('ignores undefined nested keys', () => {
    const src = {
      foo: {
        bar: {
          baz: '42'
        }
      }
    }

    weedOut(src, 'baz.bar.foo')

    expect(src).toEqual({
      foo: {
        bar: {
          baz: '42'
        }
      }
    })
  })

  it('removes keys inside object arrays', () => {
    const src = {
      foo: [
        {
          bar: [
            {
              baz: '3.14'
            }
          ]
        },
        {
          bar: [
            {
              baz: 'pi'
            }
          ]
        }
      ]
    }

    weedOut(src, 'foo.bar.baz')

    src.foo.forEach((foo) => {
      expect(foo.bar).toEqual([{}])
    })
  })

  it('removes keys inside object arrays inside object arrays', () => {
    const src = {
      foo: [
        {
          bar: [
            {
              baz: 'to'
            },
            {
              baz: 'be'
            }
          ]
        },
        {
          bar: [
            {
              baz: 'or'
            },
            {
              baz: 'not'
            }
          ]
        }
      ]
    }

    weedOut(src, 'foo.bar.baz')

    src.foo.forEach((foo) => {
      foo.bar.forEach((bar) => {
        expect(bar).toEqual({})
      })
    })
  })
})