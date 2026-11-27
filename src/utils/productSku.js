export const PRODUCT_SKU_HELP = 'Hasta 100 caracteres: solo letras, números y guiones (-).'

export function isValidProductSku(sku, originalSku = '') {
  return sku === originalSku || (sku.length <= 100 && !/[^A-Za-z0-9-]/.test(sku))
}
