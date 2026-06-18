import api from '@/plugins/axios'

class CatalogService {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params })
    return res.data
  }

  async getProductBySku(sku) {
    const res = await api.get(`/products/${sku}`)
    return res.data
  }

  async getCategories() {
    const res = await api.get('/categories', { params: { all: 1 } })
    return res.data
  }
}

export default new CatalogService()
