import api from '@/plugins/axios'

class AuthService {
  async initCsrf() {
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : '';
    await api.get('/sanctum/csrf-cookie', { baseURL: backendUrl })
    
    try {
      const response = await api.get('/auth/csrf-token')
      if (response.data && response.data.token) {
        api.defaults.headers.common['X-CSRF-TOKEN'] = response.data.token
      }
    } catch (e) {
      console.error('Failed to fetch CSRF token:', e)
    }
  }

  async login(email, password, remember = false) {
    await this.initCsrf()
    const response = await api.post('/auth/login', { email, password, remember })
    if (response.data && response.data.token) {
      api.defaults.headers.common['X-CSRF-TOKEN'] = response.data.token
    }
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
