import { reactive } from 'vue'
import authService from '../services/authService.js'
import router from '@/router.js'

const AUTH_USER_KEY = 'auth_user'

const isPositiveInteger = (value) => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return false

  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0
}

const loadStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(AUTH_USER_KEY)
    if (!storedUser) return null

    const user = JSON.parse(storedUser)
    const isValidUser = user &&
      typeof user === 'object' &&
      !Array.isArray(user) &&
      isPositiveInteger(user.id) &&
      isPositiveInteger(user.role_id) &&
      typeof user.email === 'string' &&
      user.email.trim().length > 0

    if (isValidUser) return user
  } catch {
    // Corrupt or unavailable browser storage must not prevent the app from starting.
  }

  try {
    localStorage.removeItem(AUTH_USER_KEY)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  return null
}

const storedUser = loadStoredUser()

export const authStore = reactive({
  user: storedUser,
  isAuthenticated: Boolean(storedUser),
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
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.user))
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
      localStorage.removeItem(AUTH_USER_KEY)
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
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.user))
      }
    } catch (e) {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem(AUTH_USER_KEY)
    }
  },

  isHelper() {
    return this.user && Boolean(this.user.is_helper)
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
