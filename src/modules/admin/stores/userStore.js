import { reactive } from 'vue'
import userService from '../services/userService.js'

export const userStore = reactive({
  users: [],
  roles: [],
  stores: [],
  loading: false,
  page: 1,
  lastPage: 1,

  async fetchUsers(page = 1, search = '') {
    this.loading = true
    this.page = page
    try {
      const data = await userService.getAll({ page, per_page: 10, search })
      if (data && data.success) {
        this.users = data.data
        this.lastPage = data.meta.last_page
      }
    } finally {
      this.loading = false
    }
  },

  async fetchRoles() {
    try {
      const data = await userService.getRoles()
      if (data && data.success) {
        this.roles = data.roles
      }
    } catch (e) {
      console.error('Error al cargar roles:', e)
    }
  },

  async fetchAllStores() {
    try {
      const data = await userService.getAllStores()
      if (data && data.success) {
        this.stores = data.stores
      }
    } catch (e) {
      console.error('Error al cargar sucursales:', e)
    }
  },

  async createUser(formData) {
    await userService.create(formData)
    await this.fetchUsers(this.page)
  },

  async updateUser(id, formData) {
    await userService.update(id, formData)
    await this.fetchUsers(this.page)
  },

  async deleteUser(id) {
    this.loading = true
    await userService.delete(id)
    await this.fetchUsers(this.page)
  }
})
