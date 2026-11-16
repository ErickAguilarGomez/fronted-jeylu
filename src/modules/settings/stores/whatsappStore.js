import { reactive } from 'vue'
import api from '@/plugins/axios'

let activeNumbersRequest = null

export const whatsappStore = reactive({
  whatsappNumbers: [],
  activeNumbersLoaded: false,
  adminWhatsappNumbers: [],
  loading: false,
  _fetchingActive: false,

  async fetchActiveNumbers() {
    if (this.whatsappNumbers.length > 0) {
      this.activeNumbersLoaded = true
      return this.whatsappNumbers
    }
    if (activeNumbersRequest) return activeNumbersRequest

    this._fetchingActive = true
    this.loading = true
    activeNumbersRequest = api.get('/settings/whatsapp-numbers')
      .then(res => {
        if (res.data && res.data.success) {
          this.whatsappNumbers = Array.isArray(res.data.data) ? res.data.data : []
        }
        return this.whatsappNumbers
      })
      .catch(e => {
        console.error('Error fetching active whatsapp numbers:', e)
        return []
      })
      .finally(() => {
        this.loading = false
        this._fetchingActive = false
        this.activeNumbersLoaded = true
        activeNumbersRequest = null
      })

    return activeNumbersRequest
  },

  async fetchAdminNumbers() {
    this.loading = true
    try {
      const res = await api.get('/settings/whatsapp-numbers/admin')
      if (res.data && res.data.success) {
        this.adminWhatsappNumbers = res.data.data
      }
    } catch (e) {
      console.error('Error fetching admin whatsapp numbers:', e)
    } finally {
      this.loading = false
    }
  },

  async createNumber(data) {
    this.loading = true
    try {
      const res = await api.post('/settings/whatsapp-numbers', data)
      if (res.data && res.data.success) {
        await this.fetchAdminNumbers()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error creating whatsapp number:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async updateNumber(id, data) {
    this.loading = true
    try {
      const res = await api.put(`/settings/whatsapp-numbers/${id}`, data)
      if (res.data && res.data.success) {
        await this.fetchAdminNumbers()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error updating whatsapp number:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async deleteNumber(id) {
    this.loading = true
    try {
      const res = await api.delete(`/settings/whatsapp-numbers/${id}`)
      if (res.data && res.data.success) {
        await this.fetchAdminNumbers()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error deleting whatsapp number:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async toggleActive(id) {
    this.loading = true
    try {
      const res = await api.patch(`/settings/whatsapp-numbers/${id}/toggle`)
      if (res.data && res.data.success) {
        await this.fetchAdminNumbers()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error toggling active status:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async updateOrder(orderArray) {
    this.loading = true
    try {
      const res = await api.post('/settings/whatsapp-numbers/reorder', { order: orderArray })
      if (res.data && res.data.success) {
        await this.fetchAdminNumbers()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error updating order:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  }
})
