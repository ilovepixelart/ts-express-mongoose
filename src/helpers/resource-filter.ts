import has from 'lodash.has'
import get from 'lodash.get'
import { weedOut } from './weed-out'
import { detective } from './detective'

import type { Model } from 'mongoose'
import type { QueryOptions } from './get-query-schema'
import type { Access, ExcludedMap, FilteredKeys } from '../types'

export class Filter {
  excludedMap: ExcludedMap = new Map()

  add(model: Model<unknown> | undefined, options: { filteredKeys: FilteredKeys }): void {
    if (model?.discriminators) {
      for (const modelName in model.discriminators) {
        const excluded = this.excludedMap.get(modelName)

        if (excluded) {
          options.filteredKeys.private = options.filteredKeys.private.concat(excluded.filteredKeys.private)
          options.filteredKeys.protected = options.filteredKeys.protected.concat(excluded.filteredKeys.protected)
        }
      }
    }

    if (model?.modelName) {
      this.excludedMap.set(model.modelName, { filteredKeys: options.filteredKeys, model })
    }
  }

  /**
   * Gets excluded keys for a given model and access.
   */
  getExcluded(options: { access: Access, modelName: string }): string[] {
    if (options.access === 'private') {
      return []
    }

    const filteredKeys = this.excludedMap.get(options.modelName)?.filteredKeys

    if (!filteredKeys) {
      return []
    }

    return options.access === 'protected'
      ? filteredKeys.private
      : filteredKeys.private.concat(filteredKeys.protected)
  }

  /**
   * Removes excluded keys from a document.
   */
  filterObject(
    resource: Record<string, unknown> | Record<string, unknown>[],
    options: {
        access: Access
        modelName: string
        populate: Exclude<QueryOptions['populate'], string> | string
      }
  ): Record<string, unknown> | Record<string, unknown>[] {
    const excluded = this.getExcluded({
      access: options.access,
      modelName: options.modelName
    })
  
    const filtered = this.filterItem(resource, excluded)
  
    if (options.populate) {
      if (typeof options.populate === 'string') {
        options.populate = [{ path: options.populate }] as Exclude<QueryOptions['populate'], string>
      }


      this.filterPopulatedItem(filtered, {
        access: options.access,
        modelName: options.modelName,
        populate: options.populate
      })
    }
  
    return filtered
  }

  /**
   * Removes excluded keys from a document.
   */
  private filterItem<T extends undefined | Record<string, unknown> | Record<string, unknown>[]>(item: T, excluded?: string[]): T {
    if (!item) {
      return item
    }

    if (Array.isArray(item)) {
      return item.map((i) => this.filterItem(i, excluded)) as T
    }

    if (excluded) {
      if (typeof item['toObject'] === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        item = item['toObject']()
      }

      for (const element of excluded) {
        weedOut(item as Record<string, unknown>, element)
      }
    }

    return item
  }

  /**
   * Removes excluded keys from a document with populated sub documents.
   */
  private filterPopulatedItem<T extends Record<string, unknown> | Record<string, unknown>[]>(
    item: T,
    options: {
      access: Access
      modelName: string
      populate: Exclude<QueryOptions['populate'], string>
    }
  ): T {
    if (Array.isArray(item)) {
      return item.map((i) => this.filterPopulatedItem(i, options)) as T
    }
  
    for (const populate of options.populate ?? []) {
      this.handlePopulate(populate, item, options)
    }
  
    return item
  }
  
  private handlePopulate<T extends Record<string, unknown> | Record<string, unknown>[]>(
    populate: {
      path: string
      strictPopulate: boolean
      match?: Record<string, unknown> | undefined
      options?: Record<string, unknown> | undefined
      select?: string | undefined
    },
    item: T,
    options: {
      access: Access
      modelName: string
    }
  ): void {
    if (!populate.path) {
      return
    }
  
    const model = this.excludedMap.get(options.modelName)?.model
  
    if (!model) {
      return
    }
  
    const excluded = this.getExcluded({
      access: options.access,
      modelName: detective(model, populate.path) ?? ''
    })
  
    if (has(item, populate.path)) {
      this.filterItem(get(item, populate.path) as T, excluded)
    } else {
      this.handlePathToArray(populate, item, excluded)
    }
  }
  
  private handlePathToArray<T extends Record<string, unknown> | Record<string, unknown>[]>(
    populate: {
      path: string
      strictPopulate: boolean
      match?: Record<string, unknown> | undefined
      options?: Record<string, unknown> | undefined
      select?: string | undefined
    },
    item: T,
    excluded: string[]
  ): void {
    const pathToArray = populate.path.split('.').slice(0, -1).join('.')
  
    if (has(item, pathToArray)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const array = get(item, pathToArray)
      const pathToObject = populate.path.split('.').slice(-1).join('.')
  
      if (Array.isArray(array)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        this.filterItem(array.map((element) => get(element, pathToObject)), excluded)
      }
    }
  }
}
