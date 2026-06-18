import api from '@/plugins/axios'

class PosService {
  async searchProducts(params = {}) {
    const res = await api.get('/products', { params })
    return res.data
  }

  async getProductBySku(sku, params = {}) {
    const res = await api.get(`/products/${sku}`, { params })
    return res.data
  }

  async processSale(payload) {
    const res = await api.post('/sales', payload)
    return res.data
  }

  async getUsers() {
    const res = await api.get('/users', { params: { all: 1 } })
    return res.data
  }

  async getStores() {
    const res = await api.get('/stores')
    return res.data
  }
}

export default new PosService()
