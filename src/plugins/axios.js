import axios from 'axios'

let pendingRequests = []

export const cancelPendingRequests = () => {
  pendingRequests.forEach(request => {
    if (request && typeof request.cancel === 'function') {
      request.cancel('Route changed')
    }
  })
  pendingRequests = []
}

const removePendingRequest = (config) => {
  if (!config) return
  pendingRequests = pendingRequests.filter(req => req.url !== config.url)
}

const api = axios.create({
  baseURL: 'https://apijeylu.dinho.lat/api',
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
  config => {
    // Generar token de cancelación para la petición (excluyendo peticiones globales de autenticación y settings)
    const isGlobalRequest = config.url && (config.url.includes('/auth/') || config.url.includes('/settings/'))
    if (!isGlobalRequest) {
      const source = axios.CancelToken.source()
      config.cancelToken = source.token
      pendingRequests.push({
        url: config.url,
        cancel: source.cancel
      })
    }

    const matches = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    if (matches) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(matches[1])
    }
    return config
  },
  error => Promise.reject(error)
)

// Interceptor para respuestas: manejo de errores y redirección 401
api.interceptors.response.use(
  response => {
    removePendingRequest(response.config)
    return response
  },
  error => {
    removePendingRequest(error.config)

    // Silenciar errores de peticiones canceladas para evitar ruidos en la consola o toasts
    if (axios.isCancel(error)) {
      return new Promise(() => {})
    }

    if (error.response && error.response.status === 401) {
      // Limpiar sesión local porque el servidor dice que ya no estamos autenticados
      localStorage.removeItem('auth_user')

      import('@/modules/auth/stores/authStore.js').then(module => {
        module.authStore.user = null
        module.authStore.isAuthenticated = false

        // Redirigir a login SOLO DESPUÉS de haber actualizado el estado
        import('@/router.js').then(routerModule => {
          const router = routerModule.default
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
        })
      })
    }
    return Promise.reject(error)
  }
)

export default api
