<script setup>
import { onMounted } from 'vue'
import { authStore } from '@/modules/auth/stores/authStore.js'
import NavBar from '@/components/common/NavBar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchUser()
  }
})
</script>

<template>
  <div class="app-wrapper min-vh-100 d-flex flex-column bg-white text-black font-sans-serif">
    <NavBar />
    
    <main class="flex-grow-1 d-flex flex-column">
      <router-view></router-view>
    </main>

    <footer class="border-top border-black border-4 py-5 mt-auto bg-black text-white text-center">
      <div class="container">
        <h2 class="fw-black m-0 text-uppercase" style="letter-spacing: 2px;">JEILU VIRTUAL STORE</h2>
        <p class="fw-bold m-0 mt-3 text-secondary opacity-75">SISTEMA POS Y CATÁLOGO VIRTUAL © 2026</p>
      </div>
    </footer>

    <ToastContainer />
  </div>
</template>

<style>
</style>
