import api from '@/plugins/axios'

class PriceIncreaseService {
  async getGeneralIncrease() {
    const res = await api.get('/discounts/general')
    return res.data
  }

  async saveGeneralIncrease(data) {
    const res = await api.post('/discounts/general', data)
    return res.data
  }

  async toggleGeneralIncrease() {
    const res = await api.patch('/discounts/general/toggle')
    return res.data
  }
}

export default new PriceIncreaseService()
