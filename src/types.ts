import type {
  ErrorRequestHandler,
  Request,
  RequestHandler,
  Response
} from 'express'

import type { Model, Query } from 'mongoose'

export type Access = 'private' | 'protected' | 'public';

export interface FilteredKeys {
  private: string[]
  protected: string[]
}

export type ExcludedMap = Map<string, { filteredKeys: FilteredKeys, model: Model<unknown>}>;

export type OutputFn = (req: Request, res: Response) => void | Promise<void>;

export type ReadPreference =
  | 'p'
  | 'primary'
  | 'pp'
  | 'primaryPreferred'
  | 's'
  | 'secondary'
  | 'sp'
  | 'secondaryPreferred'
  | 'n'
  | 'nearest';

export interface Options {
  prefix: `/${string}`
  version: `/v${number}`
  idProperty: string
  name?: string
  allowRegex: boolean
  runValidators: boolean
  readPreference: ReadPreference
  totalCountHeader: boolean | string
  private: string[]
  protected: string[]
  lean: boolean
  limit?: number
  findOneAndRemove: boolean
  findOneAndUpdate: boolean
  upsert: boolean
  preMiddleware: RequestHandler | RequestHandler[]
  preCreate: RequestHandler | RequestHandler[]
  preRead: RequestHandler | RequestHandler[]
  preUpdate: RequestHandler | RequestHandler[]
  preDelete: RequestHandler | RequestHandler[]
  access?: (req: Request) => Access | Promise<Access>
  contextFilter: <T, R>(model: Model<T>, req: Request, done: (query: Model<T> | Query<R, T>) => void) => void
  postCreate?: RequestHandler | RequestHandler[]
  postRead?: RequestHandler | RequestHandler[]
  postUpdate?: RequestHandler | RequestHandler[]
  postDelete?: RequestHandler | RequestHandler[]
  outputFn: OutputFn
  postProcess?: (req: Request, res: Response) => void
  onError: ErrorRequestHandler
  modelFactory?: {
    getModel: (req: Request) => Model<unknown>
  }
}
