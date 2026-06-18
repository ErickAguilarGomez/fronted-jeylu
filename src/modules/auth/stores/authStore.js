import { reactive } from 'vue'
import authService from '../services/authService.js'
import router from '@/router.js'

export const authStore = reactive({
  user: JSON.parse(localStorage.getItem('auth_user')) || null,
  isAuthenticated: !!localStorage.getItem('auth_user'),
  loading: false,
  error: null,

  async login(email, password, remember = false) {
    this.loading = true
    this.error = null
    try {
      const data = await authService.login(email, password, remember)
      if (data && data.success) {
        this.user = data.user
        this.isAuthenticated = true
        localStorage.setItem('auth_user', JSON.stringify(this.user))
        return true
      }
    } catch (e) {
      this.error = e.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      return false
    } finally {
      this.loading = false
    }
  },

  async logout() {
    this.loading = true
    try {
      await authService.logout()
    } catch (e) {
      console.warn('Error durante logout en servidor', e)
    } finally {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
      this.loading = false
    }
  },

  async fetchUser() {
    try {
      const data = await authService.fetchUser()
      if (data && data.success) {
        this.user = data.user
        this.isAuthenticated = true
        localStorage.setItem('auth_user', JSON.stringify(this.user))
      }
    } catch (e) {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_user')
    }
  },

  isAdmin() {
    return this.user && (this.user.role_id === 1 || this.user.role_name === 'Admin')
  },

  isSeller() {
    return this.user && (this.user.role_id === 2 || this.user.role_name === 'Vendedor')
  },

  hasPosAccess() {
    return this.isAdmin() || this.isSeller()
  }
})
