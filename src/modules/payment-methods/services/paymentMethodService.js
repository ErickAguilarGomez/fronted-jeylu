import api from '@/plugins/axios.js'

export default {
  async getAll(params = {}) {
    const res = await api.get('/payment-methods', { params })
    return res.data
  },

  async create(data) {
    const res = await api.post('/payment-methods', data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`/payment-methods/${id}`, data)
    return res.data
  },

  async toggle(id) {
    const res = await api.post(`/payment-methods/${id}/toggle`)
    return res.data
  }
}
