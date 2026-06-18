import api from '@/plugins/axios'

class UserService {
  async getAll(params = {}) {
    const res = await api.get('/users', { params })
    return res.data
  }

  async create(data) {
    const res = await api.post('/users', data)
    return res.data
  }

  async update(id, data) {
    const res = await api.put(`/users/${id}`, data)
    return res.data
  }

  async delete(id) {
    const res = await api.delete(`/users/${id}`)
    return res.data
  }

  async getRoles() {
    const res = await api.get('/users/roles')
    return res.data
  }

  async getAllStores() {
    const res = await api.get('/stores', { params: { all: 1 } })
    return res.data
  }
}

export default new UserService()
