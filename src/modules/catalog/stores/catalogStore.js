import { reactive } from 'vue'
import catalogService from '../services/catalogService.js'

export const catalogStore = reactive({
  products: [],
  categories: [],
  selectedCategoryId: null,
  loading: true,
  loadingCategories: false,
  error: null,
  page: 1,
  lastPage: 1,
  searchQuery: '',

  async fetchProducts(page = 1) {
    this.loading = true
    this.error = null
    try {
      const params = {
        page,
        per_page: 8,
        search: this.searchQuery
      }
      if (this.selectedCategoryId) {
        params.category_id = this.selectedCategoryId
      }
      const data = await catalogService.getProducts(params)
      this.products = data.data
      this.page = data.meta.current_page
      this.lastPage = data.meta.last_page
    } catch (err) {
      this.error = 'No se pudieron cargar los productos. Intenta nuevamente.'
    } finally {
      this.loading = false
    }
  },

  async fetchCategories() {
    this.loadingCategories = true
    try {
      const res = await catalogService.getCategories()
      if (res && res.success) {
        this.categories = res.categories
      }
    } catch (e) {
      console.error('Error fetching catalog categories:', e)
    } finally {
      this.loadingCategories = false
    }
  }
})
