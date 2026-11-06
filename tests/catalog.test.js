import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addItem, restoreCart, orderSummary, products, weight } from '../src/catalog.js'

test('every advertised pack has the correct net weight', () => {
  assert.deepEqual(products.map(weight), [25, 50, 100, 250, 50, 100, 200, 500])
})
test('adding from different selectors merges the same product', () => {
  const initial = addItem([], '10g-20', 2)
  assert.deepEqual(addItem(initial, '10g-20', 3), [{ id: '10g-20', quantity: 5 }])
  assert.equal(initial[0].quantity, 2)
})
test('invalid products cannot enter the bag and quantity is bounded', () => {
  assert.deepEqual(addItem([], 'unknown'), [])
  assert.equal(addItem([], '5g-5', -2)[0].quantity, 1)
  assert.equal(addItem([{ id: '5g-5', quantity: 98 }], '5g-5', 20)[0].quantity, 99)
})
test('corrupt or unavailable browser storage yields an empty bag', () => {
  for (const content of ['{bad', '{}', 'null']) {
    assert.deepEqual(restoreCart({ getItem: () => content }), [])
  }
  assert.deepEqual(restoreCart({ getItem: () => { throw new Error('blocked') } }), [])
})
test('restoring saved data removes unknown products and merges duplicates', () => {
  const entries = [{ id: '5g-5', quantity: 2 }, { id: '5g-5', quantity: 3 }, { id: 'unknown', quantity: 1 }, { id: '10g-5', quantity: -1 }, null]
  assert.deepEqual(restoreCart({ getItem: () => JSON.stringify(entries) }), [{ id: '5g-5', quantity: 5 }])
})
test('enquiry includes exact variants and amounts selected', () => {
  const cart = addItem(addItem([], '5g-10', 1), '10g-50', 2)
  assert.equal(orderSummary(cart), '1 × 5g honey sticks, pack of 10 (50g per pack)\n2 × 10g honey sticks, pack of 50 (500g per pack)')
})
