import assert from 'node:assert/strict'
import test from 'node:test'
import { createLatestSearch } from '../../src/modules/sales/utils/latestSearch.js'

test('a stale response cannot replace results after clearing and repeating the same search', async () => {
  const appliedResults = []
  const pending = []
  const search = createLatestSearch()
  const fetchResults = (query) => new Promise((resolve) => pending.push({ query, resolve }))
  const applyResults = (results) => appliedResults.push(results)

  const firstSearch = search.run('PROD-7049', fetchResults, applyResults)
  search.invalidate()
  const repeatedSearch = search.run('PROD-7049', fetchResults, applyResults)

  pending[0].resolve([{ sku: 'PROD-7049', name: 'stale product' }])
  assert.equal(await firstSearch, null)
  assert.deepEqual(appliedResults, [])

  pending[1].resolve([{ sku: 'PROD-7049', name: 'current product' }])
  assert.equal(await repeatedSearch, true)
  assert.deepEqual(appliedResults, [[{ sku: 'PROD-7049', name: 'current product' }]])
})
