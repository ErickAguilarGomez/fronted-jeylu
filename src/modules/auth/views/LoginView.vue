<script setup>
import { ref } from 'vue'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(false)
const errorMessage = ref('')
const loading = ref(false)

const errors = ref({
  email: '',
  password: ''
})

const clearError = (field) => {
  errors.value[field] = ''
}

const handleLogin = async () => {
  errors.value.email = ''
  errors.value.password = ''
  errorMessage.value = ''

  let hasError = false
  if (!email.value || !email.value.trim()) {
    errors.value.email = 'El correo electrónico es obligatorio.'
    hasError = true
  }
  if (!password.value) {
    errors.value.password = 'La contraseña es obligatoria.'
    hasError = true
  }

  if (hasError) {
    errorMessage.value = 'Por favor completa todos los campos requeridos.'
    return
  }

  loading.value = true
  
  const success = await authStore.login(email.value, password.value, remember.value)
  
  if (success) {
    const user = authStore.user
    const roleId = Number(user?.role_id)
    
    if (roleId === 1) {
      sessionStorage.setItem('just_logged_in', '1')
      window.location.href = '/admin'
    } else if (roleId === 2) {
      window.location.href = '/seller'
    } else {
      window.location.href = '/'
    }
  } else {
    errorMessage.value = authStore.error || 'Credenciales no válidas. Verifica tu correo y contraseña.'
  }
  
  loading.value = false
}
</script>

<template>
  <div class="amazon-login-page py-5 d-flex flex-column align-items-center justify-content-center flex-grow-1">
    
    <!-- Amazon Style Logo on top of Card -->
    <div class="mb-3 text-center">
      <router-link to="/" class="d-inline-flex flex-column align-items-center text-decoration-none">
        <span class="fs-2 fw-bold text-dark">JEILU</span>
        <svg viewBox="0 0 100 20" width="70" height="12">
          <path d="M 5 5 Q 50 25 95 5" fill="none" stroke="#FEBD69" stroke-width="3.5" stroke-linecap="round"/>
          <polygon points="90,1 98,6 94,13" fill="#FEBD69" />
        </svg>
      </router-link>
    </div>

    <!-- Login Card -->
    <div class="card p-4 p-sm-5 w-100 bg-white shadow-sm border rounded-3" style="max-width: 420px; border-color: #d5d9d9 !important;">
      <h2 class="fw-bold text-dark mb-4 fs-3">Iniciar sesión</h2>
      
      <div v-if="errorMessage" class="alert alert-danger p-3 small d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-exclamation-circle-fill text-danger fs-5"></i>
        <div>{{ errorMessage }}</div>
      </div>
      
      <form @submit.prevent="handleLogin" novalidate>
        <!-- Email -->
        <div class="mb-3">
          <label for="email" class="form-label fw-semibold text-dark small mb-1">
            Dirección de correo electrónico
          </label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            class="form-control" 
            :class="{ 'is-invalid': errors.email }"
            @input="clearError('email')"
            placeholder="usuario@ejemplo.com"
            required
          >
          <div v-if="errors.email" class="invalid-feedback small mt-1">
            {{ errors.email }}
          </div>
        </div>
        
        <!-- Password -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label for="password" class="form-label fw-semibold text-dark small m-0">
              Contraseña
            </label>
          </div>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            class="form-control" 
            :class="{ 'is-invalid': errors.password }"
            @input="clearError('password')"
            placeholder="••••••••"
            required
          >
          <div v-if="errors.password" class="invalid-feedback small mt-1">
            {{ errors.password }}
          </div>
        </div>
        
        <!-- Remember Me -->
        <div class="mb-4 form-check d-flex align-items-center gap-2">
          <input v-model="remember" type="checkbox" class="form-check-input m-0" id="rememberMe">
          <label class="form-check-label small text-muted cursor-pointer" for="rememberMe">
            Recordar mi sesión en este dispositivo
          </label>
        </div>
        
        <!-- Submit Button -->
        <button 
          type="submit" 
          class="btn btn-amazon-primary w-100 py-2 fw-semibold fs-6 mb-3" 
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <span>{{ loading ? 'Verificando...' : 'Continuar' }}</span>
        </button>

        <!-- Terms and Privacy -->
        <div class="small text-muted fs-8 mt-3" style="line-height: 1.4;">
          Al identificarte, aceptas las <a href="#" class="text-primary">Condiciones de Uso</a> y el <a href="#" class="text-primary">Aviso de Privacidad</a> de JEILU.
        </div>
      </form>
    </div>

    <!-- Bottom Help / Links -->
    <div class="text-center mt-4" style="max-width: 420px; width: 100%;">
      <div class="d-flex align-items-center my-3">
        <hr class="flex-grow-1 border-secondary border-opacity-25 m-0">
        <span class="px-2 text-muted fs-8">¿Nuevo en JEILU?</span>
        <hr class="flex-grow-1 border-secondary border-opacity-25 m-0">
      </div>
      <router-link to="/catalog" class="btn btn-light border w-100 py-2 small fw-semibold text-dark">
        Explorar el Catálogo de Productos
      </router-link>
    </div>

  </div>
</template>

<style scoped>
.amazon-login-page {
  min-height: 75vh;
  background-color: var(--amazon-bg, #eaeded);
}

.fs-8 {
  font-size: 0.75rem;
}
</style>
