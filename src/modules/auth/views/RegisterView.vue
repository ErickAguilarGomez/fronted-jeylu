<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const errors = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const backendErrors = ref({})

const clearError = (field) => {
  errors.value[field] = ''
  if (backendErrors.value[field]) {
    delete backendErrors.value[field]
  }
}

const getFieldError = (field) => {
  if (errors.value[field]) {
    return errors.value[field]
  }
  if (backendErrors.value[field]) {
    return Array.isArray(backendErrors.value[field]) ? backendErrors.value[field][0] : backendErrors.value[field]
  }
  return ''
}

const handleRegister = async () => {
  // Limpiar errores previos
  errors.value = { name: '', email: '', password: '', password_confirmation: '' }
  backendErrors.value = {}
  errorMessage.value = ''
  successMessage.value = ''

  // Validación en frontend
  let hasError = false
  
  if (!name.value || !name.value.trim()) {
    errors.value.name = 'El nombre completo es obligatorio.'
    hasError = true
  }
  
  if (!email.value || !email.value.trim()) {
    errors.value.email = 'El correo electrónico es obligatorio.'
    hasError = true
  } else {
    // Regex para validar el correo electrónico al registrarse
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.value)) {
      errors.value.email = 'El formato del correo electrónico es inválido.'
      hasError = true
    }
  }

  if (!password.value) {
    errors.value.password = 'La contraseña es obligatoria.'
    hasError = true
  } else if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.'
    hasError = true
  }

  if (!password_confirmation.value) {
    errors.value.password_confirmation = 'La confirmación de la contraseña es obligatoria.'
    hasError = true
  }

  if (password.value && password_confirmation.value && password.value !== password_confirmation.value) {
    errors.value.password_confirmation = 'Las contraseñas no coinciden.'
    hasError = true
  }

  if (hasError) {
    errorMessage.value = 'Por favor, corrige los errores en el formulario.'
    return
  }

  loading.value = true

  try {
    await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    })
    
    successMessage.value = 'REGISTRO EXITOSO. REDIRIGIENDO...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al registrarse.'
    if (error.response?.data?.errors) {
      backendErrors.value = error.response.data.errors
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-5 d-flex justify-content-center align-items-center flex-grow-1" style="min-height: 70vh;">
    <div class="card p-5 w-100 bg-white" style="max-width: 500px;">
      <h1 class="text-center mb-5 text-uppercase fw-black" style="font-size: 3rem; letter-spacing: -2px;">REGISTRO</h1>
      
      <div v-if="errorMessage" class="alert bg-danger text-white border-black border-2 mb-4 p-3 fw-bold shadow-none text-uppercase">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="alert bg-success border-black border-2 mb-4 p-3 fw-black text-black shadow-none text-uppercase">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleRegister" novalidate>
        <div class="mb-4">
          <label for="name" class="form-label fw-black text-uppercase fs-5">NOMBRE COMPLETO</label>
          <input 
            id="name"
            v-model="name" 
            type="text" 
            class="form-control form-control-lg border-2 shadow-none" 
            :class="{ 'is-invalid': getFieldError('name') }"
            @input="clearError('name')"
            required
          >
          <div v-if="getFieldError('name')" class="invalid-feedback fw-bold text-uppercase mt-2">
            {{ getFieldError('name') }}
          </div>
        </div>

        <div class="mb-4">
          <label for="email" class="form-label fw-black text-uppercase fs-5">CORREO ELECTRÓNICO</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            class="form-control form-control-lg border-2 shadow-none" 
            :class="{ 'is-invalid': getFieldError('email') }"
            @input="clearError('email')"
            required
          >
          <div v-if="getFieldError('email')" class="invalid-feedback fw-bold text-uppercase mt-2">
            {{ getFieldError('email') }}
          </div>
        </div>
        
        <div class="mb-4">
          <label for="password" class="form-label fw-black text-uppercase fs-5">CONTRASEÑA (MIN. 6)</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            class="form-control form-control-lg border-2 shadow-none" 
            :class="{ 'is-invalid': getFieldError('password') }"
            @input="clearError('password')"
            required
          >
          <div v-if="getFieldError('password')" class="invalid-feedback fw-bold text-uppercase mt-2">
            {{ getFieldError('password') }}
          </div>
        </div>

        <div class="mb-5">
          <label for="password_confirmation" class="form-label fw-black text-uppercase fs-5">CONFIRMAR CONTRASEÑA</label>
          <input 
            id="password_confirmation"
            v-model="password_confirmation" 
            type="password" 
            class="form-control form-control-lg border-2 shadow-none" 
            :class="{ 'is-invalid': getFieldError('password_confirmation') }"
            @input="clearError('password_confirmation')"
            required
          >
          <div v-if="getFieldError('password_confirmation')" class="invalid-feedback fw-bold text-uppercase mt-2">
            {{ getFieldError('password_confirmation') }}
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary w-100 py-3 fs-4 fw-black text-uppercase" :disabled="loading">
          <span v-if="loading">PROCESANDO...</span>
          <span v-else>CREAR CUENTA</span>
        </button>

        <div class="text-center mt-4">
          <router-link to="/login" class="text-black fw-bold text-decoration-none border-bottom border-black pb-1">¿YA TIENES CUENTA? INICIA SESIÓN</router-link>
        </div>
      </form>
    </div>
  </div>
</template>
