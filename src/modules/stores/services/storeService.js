import api from '@/plugins/axios'

class StoreService {
  async getAll(params = {}) {
    const res = await api.get('/stores', { params })
    return res.data
  }

  async create(data) {
    const res = await api.post('/stores', data)
    return res.data
  }

  async update(id, data) {
    const res = await api.put(`/stores/${id}`, data)
    return res.data
  }

  async delete(id) {
    const res = await api.delete(`/stores/${id}`)
    return res.data
  }

  async getEmployees(storeId) {
    const res = await api.get(`/stores/${storeId}/employees`)
    return res.data
  }

  async assignEmployee(storeId, data) {
    const res = await api.post(`/stores/${storeId}/employees`, data)
    return res.data
  }

  async unassignEmployee(storeId, userId) {
    const res = await api.delete(`/stores/${storeId}/employees/${userId}`)
    return res.data
  }
}

export default new StoreService()
