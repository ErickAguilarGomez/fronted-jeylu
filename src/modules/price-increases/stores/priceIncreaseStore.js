import { reactive } from 'vue'
import priceIncreaseService from '../services/priceIncreaseService.js'

export const priceIncreaseStore = reactive({
  generalIncrease: {
    id: null,
    percentage: 0,
    is_active: false
  },
  loading: false,

  async fetchGeneralIncrease() {
    this.loading = true
    try {
      const res = await priceIncreaseService.getGeneralIncrease()
      if (res.success && res.data) {
        this.generalIncrease = res.data
      }
    } finally {
      this.loading = false
    }
  },

  async saveGeneralIncrease(percentage, is_active) {
    this.loading = true
    try {
      const res = await priceIncreaseService.saveGeneralIncrease({ percentage, is_active })
      if (res.success && res.data) {
        this.generalIncrease = res.data
      }
      return res
    } finally {
      this.loading = false
    }
  },

  async toggleGeneralIncrease() {
    this.loading = true
    try {
      const res = await priceIncreaseService.toggleGeneralIncrease()
      if (res.success && res.data) {
        this.generalIncrease = res.data
      }
      return res
    } finally {
      this.loading = false
    }
  }
})
