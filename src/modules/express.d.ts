import type { Document, Model } from 'mongoose'
import type { QueryOptions } from '../helpers/get-query-schema'
import type { Access } from '../types'

declare global {
  namespace Express {
    export interface Request {
      access: Access | Promise<Access>
      erm: {
        document?: Document
        model?: Model<unknown>
        query?: QueryOptions
        result?: Record<string, unknown> | Record<string, unknown>[]
        statusCode?: number
        totalCount?: number
      }
    }
  }
}
