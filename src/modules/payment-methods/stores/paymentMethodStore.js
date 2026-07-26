import { reactive } from 'vue'
import paymentMethodService from '../services/paymentMethodService.js'

export const paymentMethodStore = reactive({
  methods: [],
  loading: false,

  async fetchMethods(activeOnly = false) {
    this.loading = true
    try {
      const res = await paymentMethodService.getAll(activeOnly ? { active_only: 1 } : {})
      this.methods = res.data || []
    } catch (err) {
      console.error('Error fetching payment methods:', err)
    } finally {
      this.loading = false
    }
  },

  async createMethod(data) {
    await paymentMethodService.create(data)
    await this.fetchMethods()
  },

  async updateMethod(id, data) {
    await paymentMethodService.update(id, data)
    await this.fetchMethods()
  },

  async toggleMethod(id) {
    await paymentMethodService.toggle(id)
    await this.fetchMethods()
  }
})
