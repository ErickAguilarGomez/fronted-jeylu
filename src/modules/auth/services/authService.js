import api from '@/plugins/axios'

class AuthService {
  async initCsrf() {
    const backendUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : '';
    await api.get('/sanctum/csrf-cookie', { baseURL: backendUrl })
  }

  async login(email, password, remember = false) {
    await this.initCsrf()
    const response = await api.post('/auth/login', { email, password, remember })
    return response.data
  }

  async logout() {
    await api.post('/auth/logout')
  }

  async fetchUser() {
    const response = await api.get('/auth/user')
    return response.data
  }
}

export default new AuthService()
