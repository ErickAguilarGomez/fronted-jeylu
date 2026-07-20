import api from '@/plugins/axios'

class DiscountService {
  async getGeneralDiscount() {
    const res = await api.get('/discounts/general')
    return res.data
  }

  async saveGeneralDiscount(data) {
    const res = await api.post('/discounts/general', data)
    return res.data
  }

  async toggleGeneralDiscount() {
    const res = await api.patch('/discounts/general/toggle')
    return res.data
  }
}

export default new DiscountService()
