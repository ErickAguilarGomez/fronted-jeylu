import api from '@/plugins/axios'

class CategoryService {
  async getAll(params = {}) {
    const res = await api.get('/categories', { params })
    return res.data
  }

  async create(data) {
    const res = await api.post('/categories', data)
    return res.data
  }

  async update(id, data) {
    const res = await api.put(`/categories/${id}`, data)
    return res.data
  }

  async delete(id) {
    const res = await api.delete(`/categories/${id}`)
    return res.data
  }
}

export default new CategoryService()
