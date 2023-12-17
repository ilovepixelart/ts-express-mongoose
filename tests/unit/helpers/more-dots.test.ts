import { moreDots } from '../../../src/helpers/more-dots'

describe('moreDots', () => {
  it('recursively converts objects to dot notation', () => {
    const input = {
      foo: {
        bar: {
          baz: 42
        }
      }
    }

    const result = moreDots(input)
    expect(result['foo.bar.baz']).toBe(42)
  })
})