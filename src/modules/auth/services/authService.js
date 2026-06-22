import api from '@/plugins/axios'

class AuthService {
  async initCsrf() {
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : '';
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
