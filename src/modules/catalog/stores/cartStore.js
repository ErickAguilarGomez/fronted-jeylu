import { reactive } from 'vue'

const STORAGE_KEY = 'jeilu_customer_cart'

const toFiniteNumber = (value, fallback = NaN) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value !== 'string' || !value.trim()) return fallback

  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const discardStoredCart = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

const normalizeCartItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null

  const quantity = toFiniteNumber(item.quantity)
  const price = toFiniteNumber(item.price)
  if (!['string', 'number'].includes(typeof item.id) || !String(item.id).trim()) return null
  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isFinite(price) || price < 0) return null

  if (typeof item.sku !== 'string' || !item.sku.trim()) return null
  const stock = toFiniteNumber(item.stock, 0)
  return {
    ...item,
    id: String(item.id),
    sku: item.sku,
    name: typeof item.name === 'string' && item.name ? item.name : 'Producto',
    quantity,
    price,
    stock: Number.isFinite(stock) && stock > 0 ? stock : 0,
    image: typeof item.image === 'string' ? item.image : '',
    size: typeof item.size === 'string' ? item.size : null,
    color: typeof item.color === 'string' ? item.color : null,
    storeName: typeof item.storeName === 'string' ? item.storeName : ''
  }
}

const loadCartFromStorage = () => {
  let parsed
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    parsed = JSON.parse(stored)
  } catch (e) {
    console.warn('Invalid saved cart was discarded.', e)
    discardStoredCart()
    return []
  }

  if (!Array.isArray(parsed)) {
    discardStoredCart()
    return []
  }

  const items = parsed.map(normalizeCartItem).filter(Boolean)
  if (items.length !== parsed.length) {
    try {
      if (items.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } else {
        discardStoredCart()
      }
    } catch (error) {
      console.warn('Could not repair the saved cart in storage.', error)
    }
  }

  return items
}

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Error saving cart to localStorage:', e)
  }
}

export const cartStore = reactive({
  items: loadCartFromStorage(),

  get totalCount() {
    return this.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  },

  get totalAmount() {
    return this.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0)
  },

  get isEmpty() {
    return this.items.length === 0
  },

  addItem({ product, variant = null, size = null, color = null, quantity = 1 }) {
    const qty = Math.max(1, Number(quantity) || 1)
    const sku = variant?.sku || product.sku
    const sizeVal = size || variant?.size || null
    const colorVal = color || variant?.color || null
    const itemId = colorVal
      ? `${product.id}-${sizeVal || 'base'}-${colorVal}`
      : `${product.id}-${sizeVal || 'base'}`
    const price = Number(product.price || 0)
    const stock = variant ? Number(variant.stock || 0) : Number(product.total_stock || product.stock || 99)

    const existingIndex = this.items.findIndex(item => item.id === itemId)

    if (existingIndex > -1) {
      const existing = this.items[existingIndex]
      const newQty = existing.quantity + qty
      existing.quantity = stock > 0 ? Math.min(newQty, stock) : newQty
    } else {
      this.items.push({
        id: itemId,
        productId: product.id,
        name: product.name,
        sku: sku,
        size: sizeVal,
        color: colorVal,
        price: price, // Read-only, verified from backend product
        quantity: stock > 0 ? Math.min(qty, stock) : qty,
        stock: stock,
        image: product.image_url || '',
        category: product.category_name || '',
        storeName: product.store_name || ''
      })
    }

    saveCartToStorage(this.items)
  },

  updateQuantity(itemId, quantity) {
    const item = this.items.find(i => i.id === itemId)
    if (!item) return
    const qty = Number(quantity)
    if (qty <= 0) {
      this.removeItem(itemId)
    } else {
      item.quantity = item.stock > 0 ? Math.min(qty, item.stock) : qty
      saveCartToStorage(this.items)
    }
  },

  increaseQuantity(itemId) {
    const item = this.items.find(i => i.id === itemId)
    if (!item) return
    if (item.stock > 0 && item.quantity >= item.stock) return
    item.quantity++
    saveCartToStorage(this.items)
  },

  decreaseQuantity(itemId) {
    const item = this.items.find(i => i.id === itemId)
    if (!item) return
    if (item.quantity > 1) {
      item.quantity--
      saveCartToStorage(this.items)
    } else {
      this.removeItem(itemId)
    }
  },

  removeItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId)
    saveCartToStorage(this.items)
  },

  clearCart() {
    this.items = []
    saveCartToStorage(this.items)
  }
})
