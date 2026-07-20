import { reactive } from 'vue'
import discountService from '../services/discountService.js'

export const discountStore = reactive({
  generalDiscount: {
    id: null,
    percentage: 0,
    is_active: false
  },
  loading: false,

  async fetchGeneralDiscount() {
    this.loading = true
    try {
      const res = await discountService.getGeneralDiscount()
      if (res && res.success && res.data) {
        this.generalDiscount = res.data
      }
    } finally {
      this.loading = false
    }
  },

  async saveGeneralDiscount(percentage, is_active) {
    this.loading = true
    try {
      const res = await discountService.saveGeneralDiscount({ percentage, is_active })
      if (res && res.success && res.data) {
        this.generalDiscount = res.data
      }
      return res
    } finally {
      this.loading = false
    }
  },

  async toggleGeneralDiscount() {
    this.loading = true
    try {
      const res = await discountService.toggleGeneralDiscount()
      if (res && res.success && res.data) {
        this.generalDiscount = res.data
      }
      return res
    } finally {
      this.loading = false
    }
  }
})
