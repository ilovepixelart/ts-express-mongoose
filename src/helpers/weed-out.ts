export function weedOut(obj: Record<string, unknown> | Record<string, unknown>[], path: string): Record<string, unknown> | Record<string, unknown>[] | undefined {
  const keys = path.split('.')

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as keyof typeof obj
    if (Array.isArray(obj)) {
      for (const item of obj) {
        weedOut(item, keys.slice(i).join('.'))
      }
      return
    } else if (typeof obj[key] === 'undefined') {
      return
    }

    if (i < keys.length - 1) {
      obj = obj[key] as Record<string, unknown>
    } else {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[key]
    }
  }

  return obj
}