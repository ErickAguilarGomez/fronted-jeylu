import { reactive } from 'vue'
import posService from '../services/posService.js'
import api from '@/plugins/axios.js'
import { authStore } from '@/modules/auth/stores/authStore.js'

export const posStore = reactive({
  cart: [],
  users: [],
  stores: [],
  searchResults: [],
  loadingItem: false,
  processingSale: false,
  saleSuccess: false,
  showReceiptModal: false,
  selectedStoreId: '',
  customerId: '',
  paymentMethodId: '',
  paymentMethods: [],
  isMultiPayment: false,
  payments: [
    { payment_method_id: '', amount: 0 }
  ],

  get cartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  },

  get paymentsSum() {
    return this.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  },

  get remainingPaymentAmount() {
    return Math.max(0, this.cartTotal - this.paymentsSum)
  },

  addPaymentRow() {
    this.payments.push({
      payment_method_id: '',
      amount: Number(this.remainingPaymentAmount.toFixed(2))
    })
  },

  removePaymentRow(index) {
    if (this.payments.length > 1) {
      this.payments.splice(index, 1)
    }
  },

  async fetchPaymentMethods() {
    try {
      const res = await api.get('/payment-methods?active_only=1')
      this.paymentMethods = res.data?.data || []
      if (this.paymentMethods.length > 0 && !this.paymentMethodId) {
        this.paymentMethodId = this.paymentMethods[0].id
      }
    } catch (e) {
      console.error('Error cargando formas de pago:', e)
    }
  },

  async fetchUsers() {
    if (!authStore.user || !['1', '2', 1, 2].includes(authStore.user.role_id)) return
    try {
      const data = await posService.getUsers()
      if (data && data.success) {
        this.users = data.users
      }
    } catch (e) {
      console.error('Error cargando usuarios:', e)
    }
  },

  async fetchStores() {
    if (authStore.user?.role_id !== 1) return
    try {
      const data = await posService.getStores()
      if (data && data.success) {
        this.stores = data.stores || data.data || []
      }
    } catch (e) {
      console.error('Error cargando tiendas:', e)
    }
  },

  async searchProductsApi(query) {
    const data = await posService.searchProducts({ search: query, per_page: 15 })
    if (data && data.success) {
      this.searchResults = data.data
      return this.searchResults.length > 0
    }
    return false
  },

  async addProductBySku(sku, toast) {
    if (authStore.user?.role_id === 1 && !this.selectedStoreId) {
      toast.warning('Debe seleccionar una sucursal de origen antes de agregar productos al carrito.', 'Seleccione Sucursal')
      return null
    }
    if (authStore.user?.role_id === 2 && !authStore.user?.primary_store) {
      toast.error('No tiene ninguna sucursal asignada para realizar ventas.', 'Acceso Denegado')
      return null
    }

    const existingItem = this.cart.find(item => item.sku === sku)
    this.loadingItem = true

    try {
      const params = {}
      if (authStore.user?.role_id === 1 && this.selectedStoreId) {
        params.store_id = this.selectedStoreId
      }
      const data = await posService.getProductBySku(sku, params)
      const product = data.data

      if (!product.variant_sku) {
        if (product.variants && product.variants.length > 0) {
          return { type: 'select_variant', product }
        } else {
          toast.warning(`El producto "${product.name}" no tiene variantes disponibles.`, 'Sin variantes')
          return null
        }
      }

      if (product.stock <= 0) {
        toast.warning(`"${product.name}" no tiene stock disponible en esta tienda.`, 'Sin stock')
        return null
      }

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.warning(`Stock máximo alcanzado para "${product.name}". Solo hay ${product.stock} unidad(es).`, 'Límite de stock')
          return null
        }
        existingItem.quantity++
      } else {
        let displayName = product.name
        if (product.size) displayName += ` - Talla: ${product.size}`
        if (product.color) displayName += ` - Color: ${product.color}`

        this.cart.push({
          sku: product.variant_sku,
          name: displayName,
          price: Number(product.price),
          stock: product.stock,
          quantity: 1,
          image: product.image_url
        })
        toast.success(`"${product.name}" añadido al carrito.`, 'Producto añadido', 2000)
      }
      return { type: 'added' }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error(`No se encontró ningún producto con SKU: ${sku}`, 'Producto no encontrado')
      } else {
        toast.error(error, 'Error al buscar producto')
      }
      return null
    } finally {
      this.loadingItem = false
    }
  },

  increaseQuantity(item) {
    if (item.quantity < item.stock) {
      item.quantity++
    }
  },

  decreaseQuantity(item) {
    if (item.quantity > 1) {
      item.quantity--
    }
  },

  removeItem(sku) {
    this.cart = this.cart.filter(item => item.sku !== sku)
  },

  async processSale(toast) {
    if (this.cart.length === 0) {
      toast.warning('Añade al menos un producto al carrito antes de procesar.', 'Carrito vacío')
      return false
    }

    if (authStore.user?.role_id === 1 && !this.selectedStoreId) {
      toast.warning('Debe seleccionar una sucursal de origen antes de procesar la venta.', 'Seleccione Sucursal')
      return false
    }

    if (authStore.user?.role_id === 2 && !authStore.user?.primary_store) {
      toast.error('No tiene ninguna sucursal asignada para realizar ventas.', 'Acceso Denegado')
      return false
    }

    if (!this.isMultiPayment) {
      if (!this.paymentMethodId) {
        toast.warning('Debe seleccionar una forma de pago antes de procesar la venta.', 'Forma de Pago Requerida')
        return false
      }
    } else {
      const invalidRow = this.payments.find(p => !p.payment_method_id || Number(p.amount) <= 0)
      if (invalidRow) {
        toast.warning('Cada fila de pago mixto debe tener un método seleccionado y un monto mayor a 0.', 'Forma de Pago Incompleta')
        return false
      }
      if (Math.abs(this.paymentsSum - this.cartTotal) > 0.01) {
        toast.warning(`La suma de los pagos ($${this.paymentsSum.toFixed(2)}) no coincide con el total ($${this.cartTotal.toFixed(2)}).`, 'Monto Incorrecto')
        return false
      }
    }

    this.processingSale = true

    try {
      const payload = {
        items: this.cart.map(item => ({
          sku: item.sku,
          quantity: item.quantity,
          price: Number(item.price)
        }))
      }

      if (this.isMultiPayment) {
        payload.payments = this.payments.map(p => ({
          payment_method_id: p.payment_method_id,
          amount: Number(p.amount)
        }))
        payload.payment_method_id = this.payments[0].payment_method_id
      } else {
        payload.payment_method_id = this.paymentMethodId
      }

      if (this.customerId) payload.customer_id = this.customerId
      if (this.customerName) payload.customer_name = this.customerName
      if (authStore.user?.role_id === 1 && this.selectedStoreId) {
        payload.store_id = this.selectedStoreId
      }

      const res = await posService.processSale(payload)

      // Obtener información de la tienda
      let storeName = 'TIENDA PRINCIPAL'
      let storeAddress = ''
      let storePhone = ''

      if (authStore.user?.role_id === 2 && authStore.user?.primary_store) {
        storeName = authStore.user.primary_store.name
        storeAddress = authStore.user.primary_store.address || ''
        storePhone = authStore.user.primary_store.phone || ''
      } else if (this.selectedStoreId) {
        const foundStore = this.stores.find(s => s.id == this.selectedStoreId)
        if (foundStore) {
          storeName = foundStore.name
          storeAddress = foundStore.address || ''
          storePhone = foundStore.phone || ''
        }
      }

      let paymentMethodName = 'Efectivo'
      if (this.isMultiPayment) {
        const parts = this.payments.map(p => {
          const pm = this.paymentMethods.find(m => m.id == p.payment_method_id)
          return `${pm ? pm.name : 'Pago'}: $${Number(p.amount).toFixed(2)}`
        })
        paymentMethodName = `PAGO MIXTO (${parts.join(' + ')})`
      } else {
        const pmObj = this.paymentMethods.find(p => p.id == this.paymentMethodId)
        paymentMethodName = pmObj ? pmObj.name : 'Efectivo'
      }

      this.lastCompletedSale = {
        id: res?.sale_id || Date.now(),
        total: this.cartTotal,
        items: [...this.cart],
        customerName: this.customerName || 'Cliente General',
        sellerName: authStore.user?.name || 'Vendedor',
        paymentMethodName,
        storeName,
        storeAddress,
        storePhone,
        date: new Date().toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
      }

      toast.success('La venta fue registrada exitosamente. Comprobante generado.', '¡Venta completada!', 5000)
      this.cart = []
      this.customerId = ''
      this.customerName = ''
      this.saleSuccess = true
      this.showReceiptModal = true
      return true
    } catch (error) {
      toast.error(error, 'Error al procesar la venta')
      return false
    } finally {
      this.processingSale = false
    }
  },

  clearCart(toast) {
    this.cart = []
    if (toast) {
      toast.info('Se ha cambiado la sucursal. El carrito ha sido limpiado para evitar inconsistencias de stock.', 'Carrito Reiniciado')
    }
  }
})
