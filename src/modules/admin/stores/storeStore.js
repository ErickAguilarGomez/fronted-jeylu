import { reactive, computed } from 'vue'
import storeService from '../services/storeService.js'
import api from '@/plugins/axios'

export const storeStore = reactive({
  stores: [],
  users: [],
  currentStoreEmployees: [],
  loading: false,
  page: 1,
  lastPage: 1,

  get sellerUsers() {
    return this.users.filter(u => Number(u.role_id) === 2)
  },

  async fetchStores(page = 1, search = '') {
    this.loading = true
    this.page = page
    try {
      const data = await storeService.getAll({ page, per_page: 10, search })
      if (data && data.success) {
        this.stores = data.data
        this.lastPage = data.meta.last_page
      }
    } finally {
      this.loading = false
    }
  },

  async fetchAllUsers() {
    try {
      const res = await api.get('/users', { params: { all: 1 } })
      if (res.data && res.data.success) {
        this.users = res.data.users
      }
    } catch (e) {
      console.error('Error al cargar usuarios:', e)
    }
  },

  async createStore(formData) {
    await storeService.create(formData)
    await this.fetchStores(this.page)
  },

  async updateStore(id, formData) {
    await storeService.update(id, formData)
    await this.fetchStores(this.page)
  },

  async deleteStore(id) {
    this.loading = true
    await storeService.delete(id)
    await this.fetchStores(this.page)
  },

  async fetchEmployees(storeId) {
    this.loading = true
    try {
      const data = await storeService.getEmployees(storeId)
      if (data && data.success) {
        this.currentStoreEmployees = data.employees
      }
    } finally {
      this.loading = false
    }
  },

  async assignEmployee(storeId, employeeData) {
    this.loading = true
    try {
      await storeService.assignEmployee(storeId, employeeData)
      await this.fetchEmployees(storeId)
    } finally {
      this.loading = false
    }
  },

  async unassignEmployee(storeId, userId) {
    this.loading = true
    try {
      await storeService.unassignEmployee(storeId, userId)
      await this.fetchEmployees(storeId)
    } finally {
      this.loading = false
    }
  }
})
