import { reactive } from 'vue'
import api from '@/plugins/axios'

export const socialMediaStore = reactive({
  socialMedia: [],
  adminSocialMedia: [],
  loading: false,
  _fetchingActive: false,

  async fetchActiveSocialMedia() {
    if (this._fetchingActive || this.socialMedia.length > 0) return
    this._fetchingActive = true
    this.loading = true
    try {
      const res = await api.get('/settings/links')
      if (res.data && res.data.success) {
        this.socialMedia = res.data.data
      }
    } catch (e) {
      console.error('Error fetching active social media:', e)
    } finally {
      this.loading = false
      this._fetchingActive = false
    }
  },

  async fetchAdminSocialMedia() {
    this.loading = true
    try {
      const res = await api.get('/settings/links/admin')
      if (res.data && res.data.success) {
        this.adminSocialMedia = res.data.data
      }
    } catch (e) {
      console.error('Error fetching admin social media:', e)
    } finally {
      this.loading = false
    }
  },

  async createSocialMedia(data) {
    this.loading = true
    try {
      const res = await api.post('/settings/links', data)
      if (res.data && res.data.success) {
        await this.fetchAdminSocialMedia()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error creating social media:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async updateSocialMedia(id, data) {
    this.loading = true
    try {
      const res = await api.put(`/settings/links/${id}`, data)
      if (res.data && res.data.success) {
        await this.fetchAdminSocialMedia()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error updating social media:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async deleteSocialMedia(id) {
    this.loading = true
    try {
      const res = await api.delete(`/settings/links/${id}`)
      if (res.data && res.data.success) {
        await this.fetchAdminSocialMedia()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error deleting social media:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  },

  async updateOrder(orderArray) {
    this.loading = true
    try {
      const res = await api.post('/settings/links/sort', { order: orderArray })
      if (res.data && res.data.success) {
        await this.fetchAdminSocialMedia()
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error updating social media order:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  }
})
