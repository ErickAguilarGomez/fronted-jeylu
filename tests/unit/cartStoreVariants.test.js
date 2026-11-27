import assert from 'node:assert/strict'
import test from 'node:test'

const values = new Map()
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key)
}

const { cartStore } = await import('../../src/modules/catalog/stores/cartStore.js')

test('cart keeps same-size variants with different colors as separate items', () => {
  cartStore.clearCart()
  const product = { id: 632, name: 'Ojota', sku: 'E-6213', price: 24900 }

  cartStore.addItem({
    product,
    variant: { sku: 'E-6213-36-BLANCO', size: '36', color: 'blanco', stock: 2 },
    size: '36',
    color: 'blanco'
  })
  cartStore.addItem({
    product,
    variant: { sku: 'E-6213-36-AZUL', size: '36', color: 'azul', stock: 3 },
    size: '36',
    color: 'azul'
  })

  assert.equal(cartStore.items.length, 2)
  assert.deepEqual(cartStore.items.map(({ color, sku }) => ({ color, sku })), [
    { color: 'blanco', sku: 'E-6213-36-BLANCO' },
    { color: 'azul', sku: 'E-6213-36-AZUL' }
  ])
  cartStore.clearCart()
})

test('size-only products continue merging repeated selections of the same size', () => {
  cartStore.clearCart()
  const product = { id: 700, name: 'Sandalia', sku: 'S-700', price: 100 }
  const variant = { sku: 'S-700-38', size: '38', stock: 5 }

  cartStore.addItem({ product, variant, size: '38', quantity: 1 })
  cartStore.addItem({ product, variant, size: '38', quantity: 2 })

  assert.equal(cartStore.items.length, 1)
  assert.equal(cartStore.items[0].quantity, 3)
  assert.equal(cartStore.items[0].color, null)
  cartStore.clearCart()
})
