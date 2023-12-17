import { Filter } from '../../../src/helpers/resource-filter'
import setupDb from '../../setup.ts'

describe('resourceFilter', () => {
  describe('filterObject', () => {
    const db = setupDb()

    db.initialize({
      connect: false
    })

    const filter = new Filter()

    filter.add(db.models.Invoice, {
      filteredKeys: {
        private: [],
        protected: []
      }
    })

    filter.add(db.models.Customer, {
      filteredKeys: {
        private: ['name'],
        protected: []
      }
    })

    filter.add(db.models.Product, {
      filteredKeys: {
        private: ['name'],
        protected: []
      }
    })

    test('removes keys in populated document', () => {
      const invoice = {
        customer: {
          name: 'John'
        },
        amount: '42'
      }

      filter.filterObject(invoice, {
        access: 'public',
        modelName: db.models.Invoice.modelName,
        populate: [
          {
            path: 'customer'
          }
        ]
      })

      expect(invoice).toEqual({
        customer: {},
        amount: '42'
      })
    })

    test('removes keys in array with populated document', () => {
      const invoices = [
        {
          customer: {
            name: 'John'
          },
          amount: '42'
        },
        {
          customer: {
            name: 'Bob'
          },
          amount: '3.14'
        }
      ]

      filter.filterObject(invoices, {
        access: 'public',
        modelName: db.models.Invoice.modelName,
        populate: [
          {
            path: 'customer'
          }
        ]
      })

      expect(invoices).toEqual([
        {
          customer: {},
          amount: '42'
        },
        {
          customer: {},
          amount: '3.14'
        }
      ])
    })

    test('ignores undefined path', () => {
      const invoice = {
        amount: '42'
      }

      filter.filterObject(invoice, {
        access: 'public',
        modelName: db.models.Invoice.modelName,
        populate: [
          {
            path: 'customer'
          }
        ]
      })

      expect(invoice).toEqual({
        amount: '42'
      })
    })

    test('skip when populate path is undefined', () => {
      const invoice = {
        customer: {
          name: 'John'
        },
        amount: '42'
      }

      filter.filterObject(invoice, {
        populate: [{}]
      })

      expect(invoice).toEqual({
        customer: {
          name: 'John'
        },
        amount: '42'
      })
    })

    test('removes keys in populated document array', () => {
      const invoice = {
        products: [
          {
            name: 'Squirt Gun'
          },
          {
            name: 'Water Balloons'
          }
        ],
        amount: '42'
      }

      filter.filterObject(invoice, {
        access: 'public',
        modelName: db.models.Invoice.modelName,
        populate: [
          {
            path: 'products'
          }
        ]
      })

      expect(invoice).toEqual({
        products: [{}, {}],
        amount: '42'
      })
    })

    test('removes keys in populated document in array', () => {
      const customer = {
        name: 'John',
        purchases: [
          {
            item: {
              name: 'Squirt Gun'
            }
          }
        ]
      }

      filter.filterObject(customer, {
        access: 'public',
        modelName: db.models.Customer.modelName,
        populate: [
          {
            path: 'purchases.item'
          }
        ]
      })

      expect(customer).toEqual({
        purchases: [
          {
            item: {}
          }
        ]
      })
    })
  })
})