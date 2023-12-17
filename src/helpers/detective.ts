import type { Model } from 'mongoose'

interface Options {
  ref?: string
}

export function detective<T>(model: Model<T>, path: string): string | undefined {
  const keys = path.split('.')

  if (keys.length === 0) {
    return undefined
  }
  
  let schema = model.schema
  let schemaPathStr = ''
  let schemaPathObj: { caster?: { options?: Options }, options?: Options } | null = null

  for (const key of keys) {
    if (schemaPathStr.length > 0) {
      schemaPathStr += '.'
    }

    schemaPathStr += key

    const schemaAtPath = schema.path(schemaPathStr)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (schemaAtPath?.schema) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      schema = schemaAtPath.schema
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!schema) {
    return undefined
  }

  const schemaLast = keys[keys.length - 1]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (schemaLast) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    schemaPathObj = schema.path(schemaLast) ?? schema.path(schemaPathStr)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!schemaPathObj && (!model?.discriminators)) {
    return undefined
  }

  if (schemaPathObj?.caster?.options) {
    return schemaPathObj.caster.options.ref
  } else if (schemaPathObj?.options) {
    return schemaPathObj.options.ref
  }

  return undefined
}