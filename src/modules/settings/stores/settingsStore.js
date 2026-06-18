import { reactive } from 'vue'
import api from '@/plugins/axios'

export const settingsStore = reactive({
  whatsappNumber: '51999999999',
  whatsappMessageTemplate: '',
  loading: false,

  async fetchSettings() {
    this.loading = true
    try {
      const res = await api.get('/settings/whatsapp')
      if (res.data && res.data.success) {
        this.whatsappNumber = res.data.whatsapp_number
        this.whatsappMessageTemplate = res.data.whatsapp_message_template
      }
    } catch (e) {
      console.error('Error fetching WhatsApp settings:', e)
    } finally {
      this.loading = false
    }
  },

  async updateSettings(data) {
    this.loading = true
    try {
      const res = await api.post('/settings/whatsapp', data)
      if (res.data && res.data.success) {
        this.whatsappNumber = data.whatsapp_number
        this.whatsappMessageTemplate = data.whatsapp_message_template
        return { success: true }
      }
      return { success: false, message: res.data?.message || 'Error' }
    } catch (e) {
      console.error('Error updating WhatsApp settings:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error de conexión'
      return { success: false, message: errorMsg }
    } finally {
      this.loading = false
    }
  }
})
