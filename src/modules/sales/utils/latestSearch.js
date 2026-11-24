export function createLatestSearch() {
  let generation = 0

  return {
    invalidate() {
      generation += 1
    },

    async run(query, fetchResults, applyResults) {
      const requestGeneration = ++generation
      const results = await fetchResults(query)

      if (requestGeneration !== generation) return null

      const safeResults = Array.isArray(results) ? results : []
      applyResults(safeResults)
      return safeResults.length > 0
    }
  }
}
