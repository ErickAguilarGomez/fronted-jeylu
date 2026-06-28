import api from '@/plugins/axios'

class SaleService {
  async getAll(params = {}) {
    const res = await api.get('/sales', { params })
    return res.data
  }

  async getStats(params = {}) {
    const res = await api.get('/sales/stats', { params })
    return res.data
  }

  async updateSale(id, payload) {
    const res = await api.put(`/sales/${id}`, payload)
    return res.data
  }
}

export default new SaleService()
