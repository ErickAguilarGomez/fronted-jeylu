import { reactive } from 'vue'
import productService from '../services/productService.js'

export const productStore = reactive({
  products: [],
  stores: [],
  categories: [],
  loading: false,
  page: 1,
  lastPage: 1,
  selectedFilterStore: '',

  async fetchMetadata() {
    try {
      const { stores, categories } = await productService.getMetadata()
      this.stores = stores
      this.categories = categories
    } catch (err) {
      console.error('Error fetching metadata', err)
    }
  },

  async fetchProducts(page = 1, search = '', includeDeleted = false) {
    this.loading = true
    this.page = page
    try {
      const params = { page, per_page: 10, search }
      if (this.selectedFilterStore) {
        params.store_id = this.selectedFilterStore
      }
      if (includeDeleted) {
        params.include_deleted = 1
      }
      const data = await productService.getAll(params)
      this.products = data.data
      this.lastPage = data.meta.last_page
    } catch (err) {
      console.error('Error fetching products', err)
    } finally {
      this.loading = false
    }
  },

  async getProductBySku(sku) {
    const storeParam = this.selectedFilterStore ? { store_id: this.selectedFilterStore } : {}
    const data = await productService.getBySku(sku, storeParam)
    return data.data
  },

  async createProduct(formData) {
    await productService.create(formData)
    await this.fetchProducts(this.page)
  },

  async updateProduct(sku, formData) {
    await productService.update(sku, formData)
    await this.fetchProducts(this.page)
  },

  async deleteProduct(sku) {
    this.loading = true
    await productService.delete(sku)
    await this.fetchProducts(this.page)
  },

  async restoreProduct(sku) {
    this.loading = true
    await productService.restore(sku)
    await this.fetchProducts(this.page)
  },

  async deleteImage(imageUrl) {
    await productService.deleteImage(imageUrl)
    await this.fetchProducts(this.page)
  },

  filterByStore(storeId) {
    this.selectedFilterStore = storeId
    this.fetchProducts(1)
  }
})
