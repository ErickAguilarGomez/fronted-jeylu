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

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  
  const success = await authStore.login(email.value, password.value, remember.value)
  
  if (success) {
    router.push(authStore.isAdmin() ? '/admin' : '/')
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
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="form-label fw-black text-uppercase fs-5">CORREO ELECTRÓNICO</label>
          <input v-model="email" type="email" class="form-control form-control-lg border-2 shadow-none" required>
        </div>
        
        <div class="mb-4">
          <label class="form-label fw-black text-uppercase fs-5">CONTRASEÑA</label>
          <input v-model="password" type="password" class="form-control form-control-lg border-2 shadow-none" required>
        </div>
        
        <div class="mb-5 form-check d-flex align-items-center gap-2">
          <input v-model="remember" type="checkbox" class="form-check-input border-black border-2 shadow-none rounded-0 m-0" style="width: 20px; height: 20px;" id="rememberMe">
          <label class="form-check-label fw-bold text-uppercase mt-1" for="rememberMe">MANTENER SESIÓN INICIADA</label>
        </div>
        
        <button type="submit" class="btn btn-primary w-100 py-3 fs-4 fw-black text-uppercase" :disabled="loading">
          <span v-if="loading">VERIFICANDO...</span>
          <span v-else>INGRESAR</span>
        </button>

        <div class="text-center mt-4">
          <router-link to="/register" class="text-black fw-bold text-decoration-none border-bottom border-black pb-1">¿NO TIENES CUENTA? REGÍSTRATE</router-link>
        </div>
      </form>
    </div>
  </div>
</template>
