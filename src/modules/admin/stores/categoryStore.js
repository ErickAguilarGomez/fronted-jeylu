import { reactive } from 'vue'
import categoryService from '../services/categoryService.js'

export const categoryStore = reactive({
  categories: [],
  loading: false,
  page: 1,
  lastPage: 1,

  async fetchCategories(page = 1, search = '') {
    this.loading = true
    this.page = page
    try {
      const data = await categoryService.getAll({ page, per_page: 10, search })
      if (data && data.success) {
        this.categories = data.data
        this.lastPage = data.meta.last_page
      }
    } finally {
      this.loading = false
    }
  },

  async createCategory(formData) {
    await categoryService.create(formData)
    await this.fetchCategories(this.page)
  },

  async updateCategory(id, formData) {
    await categoryService.update(id, formData)
    await this.fetchCategories(this.page)
  },

  async deleteCategory(id) {
    this.loading = true
    await categoryService.delete(id)
    await this.fetchCategories(this.page)
  }
})
