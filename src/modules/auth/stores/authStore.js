import { reactive } from 'vue'
import api from '@/plugins/axios.js'
import axios from 'axios'
import router from '@/router/index.js'

export const authStore = reactive({
  user: JSON.parse(localStorage.getItem('auth_user')) || null,
  isAuthenticated: !!localStorage.getItem('auth_user'),
  loading: false,
  error: null,

  async initCsrf() {
    try {
      await api.get('/sanctum/csrf-cookie', {
        baseURL: ''
      })
    } catch (e) {
      console.warn('Advertencia al inicializar CSRF cookie:', e)
    }
  },

  async login(email, password, remember = false) {
    this.loading = true
    this.error = null
    try {
      await this.initCsrf()
      const response = await api.post('/auth/login', { email, password, remember })
      if (response.data && response.data.success) {
        this.user = response.data.user
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
      await api.post('/auth/logout')
    } catch (e) {
      console.warn('Error durante logout en servidor', e)
    } finally {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_user')
      router.push('/login')
      this.loading = false
    }
  },

  async fetchUser() {
    try {
      const response = await api.get('/auth/user')
      if (response.data && response.data.success) {
        this.user = response.data.user
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
