const variantSize = (variant) => variant?.size || null
const variantColor = (variant) =>
  typeof variant?.color === 'string' ? variant.color.trim() || null : null

export const getAvailableSizes = (variants = []) => [
  ...new Set(variants.map(variantSize).filter(Boolean))
]

export const getAvailableColors = (variants = [], size = null) => [
  ...new Set(
    variants
      .filter((variant) => !size || variantSize(variant) === size)
      .map(variantColor)
      .filter(Boolean)
  )
]

export const findProductVariant = (variants = [], size = null, color = null) => {
  if (!variants.length) return null

  const sizes = getAvailableSizes(variants)
  if (!sizes.length) {
    const colors = getAvailableColors(variants)
    if (colors.length && !color) return null
    return variants.find((variant) => variantColor(variant) === (color || null)) || null
  }

  if (!size) return null

  const colors = getAvailableColors(variants, size)
  if (colors.length && !color) return null

  return variants.find((variant) =>
    variantSize(variant) === size && variantColor(variant) === (color || null)
  ) || null
}
