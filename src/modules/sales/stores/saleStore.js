import { reactive } from 'vue'
import saleService from '../services/saleService.js'

export const saleStore = reactive({
  sales: [],
  loading: false,
  page: 1,
  lastPage: 1,

  async fetchSales(page = 1, search = '', filters = {}) {
    this.loading = true
    this.page = page
    try {
      const data = await saleService.getAll({ page, per_page: 10, search, ...filters })
      if (data && data.success) {
        this.sales = data.data
        this.lastPage = data.meta.last_page
      }
    } finally {
      this.loading = false
    }
  }
})
