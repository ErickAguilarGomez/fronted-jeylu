<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = 'Todos los campos son obligatorios.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value
    })
    
    successMessage.value = 'REGISTRO EXITOSO. REDIRIGIENDO...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al registrarse.'
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
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="form-label fw-black text-uppercase fs-5">NOMBRE COMPLETO</label>
          <input v-model="name" type="text" class="form-control form-control-lg border-2 shadow-none" required>
        </div>

        <div class="mb-4">
          <label class="form-label fw-black text-uppercase fs-5">CORREO ELECTRÓNICO</label>
          <input v-model="email" type="email" class="form-control form-control-lg border-2 shadow-none" required>
        </div>
        
        <div class="mb-5">
          <label class="form-label fw-black text-uppercase fs-5">CONTRASEÑA (MIN. 6)</label>
          <input v-model="password" type="password" class="form-control form-control-lg border-2 shadow-none" minlength="6" required>
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
