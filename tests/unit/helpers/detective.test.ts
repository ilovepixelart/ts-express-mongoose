import mongoose, { Schema } from 'mongoose'
import { detective } from '../../../src/helpers/detective'

import type { Model, Document } from 'mongoose'

interface Invoice extends Document {
  customer: Schema.Types.ObjectId;
  very: {
    deep: {
      ref: Schema.Types.ObjectId;
    };
  };
  products: Schema.Types.ObjectId[];
}

describe('detective', () => {
  const InvoiceSchema = new Schema<Invoice>({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    very: {
      deep: {
        ref: { type: Schema.Types.ObjectId, ref: 'Reference' }
      }
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  })

  const InvoiceModel: Model<Invoice> = mongoose.model('Invoice', InvoiceSchema)

  it('returns undefined when path does not exist', () => {
    const modelName = detective(InvoiceModel, 'foo.bar')

    expect(modelName).toBeUndefined()
  })

  it('returns undefined when path is not a ref', () => {
    const modelName = detective(InvoiceModel, '_id')

    expect(modelName).toBeUndefined()
  })

  it('returns the referenced model name', () => {
    const modelName = detective(InvoiceModel, 'customer')

    expect(modelName).toBe('Customer')
  })

  it('returns the referenced model name when ref is an array', () => {
    const modelName = detective(InvoiceModel, 'products')

    expect(modelName).toBe('Product')
  })

  it('returns the referenced model name at a deep path', () => {
    const modelName = detective(InvoiceModel, 'very.deep.ref')

    expect(modelName).toBe('Reference')
  })
})