import api from '@/plugins/axios'

class AuthService {
  async initCsrf() {
    delete api.defaults.headers.common['X-CSRF-TOKEN']

    const response = await api.get('/auth/csrf-token')
    if (!response.data?.token) {
      throw new Error('The API did not return a CSRF token.')
    }

    api.defaults.headers.common['X-CSRF-TOKEN'] = response.data.token
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
