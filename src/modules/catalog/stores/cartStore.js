import { reactive } from 'vue'

const STORAGE_KEY = 'jeilu_customer_cart'

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Error loading cart from localStorage:', e)
    return []
  }
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

  addItem({ product, variant = null, size = null, quantity = 1 }) {
    const qty = Math.max(1, Number(quantity) || 1)
    const sku = variant?.sku || product.sku
    const sizeVal = size || variant?.size || null
    const itemId = `${product.id}-${sizeVal || 'base'}`
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
