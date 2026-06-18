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
    errorMessage.value = 'Por favor completa todos los campos.'
    return
  }

  loading.value = true
  
  const success = await authStore.login(email.value, password.value, remember.value)
  
  if (success) {
    const user = authStore.user
    const roleId = Number(user?.role_id)
    
    if (roleId === 1) {
      window.location.href = '/admin'
    } else if (roleId === 2) {
      window.location.href = '/seller'
    } else {
      window.location.href = '/'
    }
  } else {
    errorMessage.value = authStore.error || 'Error al iniciar sesión'
  }
  
  loading.value = false
}
</script>

<template>
  <div class="container py-5 d-flex justify-content-center align-items-center flex-grow-1" style="min-height: 70vh;">
    <div class="card p-5 w-100 bg-white" style="max-width: 500px;">
      <h1 class="text-center mb-5 text-uppercase fw-black" style="font-size: 3rem; letter-spacing: -2px;">ACCESO</h1>
      
      <div v-if="errorMessage" class="alert bg-danger text-white border-black border-2 mb-4 p-3 fw-bold shadow-none text-uppercase">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-4">
          <label for="email" class="form-label fw-black text-uppercase fs-5">CORREO ELECTRÓNICO</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            class="form-control form-control-lg border-2 shadow-none" 
            :class="{ 'is-invalid': errors.email }"
            @input="clearError('email')"
            required
          >
          <div v-if="errors.email" class="invalid-feedback fw-bold text-uppercase mt-2">
            {{ errors.email }}
          </div>
        </div>
        
        <div class="mb-4">
          <label for="password" class="form-label fw-black text-uppercase fs-5">CONTRASEÑA</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            class="form-control form-control-lg border-2 shadow-none" 
            :class="{ 'is-invalid': errors.password }"
            @input="clearError('password')"
            required
          >
          <div v-if="errors.password" class="invalid-feedback fw-bold text-uppercase mt-2">
            {{ errors.password }}
          </div>
        </div>
        
        <div class="mb-5 form-check d-flex align-items-center gap-2">
          <input v-model="remember" type="checkbox" class="form-check-input border-black border-2 shadow-none rounded-0 m-0" style="width: 20px; height: 20px;" id="rememberMe">
          <label class="form-check-label fw-bold text-uppercase mt-1" for="rememberMe">MANTENER SESIÓN INICIADA</label>
        </div>
        
        <button type="submit" class="btn btn-primary w-100 py-3 fs-4 fw-black text-uppercase" :disabled="loading">
          <span v-if="loading">VERIFICANDO...</span>
          <span v-else>INGRESAR</span>
        </button>

        <!-- <div class="text-center mt-4">
          <router-link to="/register" class="text-black fw-bold text-decoration-none border-bottom border-black pb-1">¿NO TIENES CUENTA? REGÍSTRATE</router-link>
        </div> -->
      </form>
    </div>
  </div>
</template>

