import api from '@/plugins/axios'
import { authStore } from '@/modules/auth/stores/authStore.js'

class ProductService {
  async getAll(params = {}) {
    const res = await api.get('/products/all', { params })
    return res.data
  }

  async getBySku(sku, params = {}) {
    const res = await api.get(`/products/${sku}`, { params })
    return res.data
  }

  async create(formData) {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }

  async update(sku, formData) {
    const res = await api.post(`/products/${sku}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }

  async delete(sku) {
    const res = await api.delete(`/products/${sku}`)
    return res.data
  }

  async restore(sku) {
    const res = await api.post(`/products/${sku}/restore`)
    return res.data
  }

  async deleteImage(imageUrl) {
    const res = await api.delete('/products/images', { data: { image_url: imageUrl } })
    return res.data
  }

  async getMetadata() {
    let stores = []
    let categories = []

    try {
      const catRes = await api.get('/categories', { params: { all: 1 } })
      categories = catRes.data?.categories || []
    } catch (e) { console.error('Error loading categories', e) }

    if (authStore.user?.role_id === 1) {
      try {
        const storesRes = await api.get('/stores', { params: { all: 1 } })
        stores = storesRes.data?.stores || []
      } catch (e) { console.error('Error loading stores', e) }
    } else if (authStore.user?.primary_store) {
      stores = [authStore.user.primary_store]
    }

    return { stores, categories }
  }
}

export default new ProductService()
