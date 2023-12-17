import isPlainObject from 'lodash.isplainobject'

export const moreDots = (src: Record<string, unknown>,dst: Record<string, unknown> = {}, prefix = ''): Record<string, unknown> => {
  for (const [key, value] of Object.entries(src)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (isPlainObject(value)) {
      moreDots(value as Record<string, unknown>, dst, `${prefix}${key}.`)
    } else {
      dst[`${prefix}${key}`] = value
    }
  }

  return dst
}
