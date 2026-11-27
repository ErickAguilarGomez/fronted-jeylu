import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidProductSku } from '../../src/utils/productSku.js'

test('accepts only letters, numbers and hyphens in a new SKU', () => {
  assert.equal(isValidProductSku('CABL-7851'), true)
  assert.equal(isValidProductSku('0'), true)
  assert.equal(isValidProductSku('2000/G'), false)
  assert.equal(isValidProductSku('CABL_7851'), false)
  assert.equal(isValidProductSku('CABL 7851'), false)
  assert.equal(isValidProductSku('A'.repeat(101)), false)
})

test('accepts a blank SKU and permits an unchanged legacy SKU but not a new invalid value', () => {
  assert.equal(isValidProductSku(''), true)
  assert.equal(isValidProductSku('2000/G', '2000/G'), true)
  assert.equal(isValidProductSku('2000/R', '2000/G'), false)
})
