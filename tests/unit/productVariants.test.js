import assert from 'node:assert/strict'
import test from 'node:test'
import { findProductVariant, getAvailableColors, getAvailableSizes } from '../../src/modules/catalog/utils/productVariants.js'

const variants = [
  { id: 1, sku: 'S-36-W', size: '36', color: 'Blanco', stock: 1 },
  { id: 2, sku: 'S-36-B', size: '36', color: 'Azul', stock: 2 },
  { id: 3, sku: 'S-37-W', size: '37', color: 'Blanco', stock: 3 },
  { id: 4, sku: 'S-37', size: '37', color: '', stock: 4 }
]

test('color choices and variant selection are scoped to the selected size', () => {
  assert.deepEqual(getAvailableSizes(variants), ['36', '37'])
  assert.deepEqual(getAvailableColors(variants, '36'), ['Blanco', 'Azul'])
  assert.equal(findProductVariant(variants, '36', 'Azul')?.sku, 'S-36-B')
  assert.equal(findProductVariant(variants, '36', null), null)
})

test('size-only products keep their existing variant selection behavior', () => {
  const sizeOnlyVariants = [
    { id: 5, sku: 'S-38', size: '38', color: '', stock: 2 },
    { id: 6, sku: 'S-39', size: '39', color: null, stock: 1 }
  ]

  assert.deepEqual(getAvailableColors(sizeOnlyVariants, '38'), [])
  assert.equal(findProductVariant(sizeOnlyVariants, '39', null)?.sku, 'S-39')
})
