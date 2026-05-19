import axios from 'axios'
import router from '@/router/index.js'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para solicitudes: asegura que Sanctum CSRF cookie esté presente si se requiere
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// Interceptor para respuestas: manejo de errores y redirección 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Limpiar sesión local porque el servidor dice que ya no estamos autenticados
      localStorage.removeItem('auth_user')
      
      import('@/modules/auth/stores/authStore.js').then(module => {
        module.authStore.user = null
        module.authStore.isAuthenticated = false
        
        // Redirigir a login SOLO DESPUÉS de haber actualizado el estado
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
      })
    }
    return Promise.reject(error)
  }
)

export default api
