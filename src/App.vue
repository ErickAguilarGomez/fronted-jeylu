<script setup>
import { onMounted } from 'vue'
import { authStore } from '@/modules/auth/stores/authStore.js'
import NavBar from '@/shared/components/NavBar.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import ToastContainer from '@/shared/components/ToastContainer.vue'

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

    <AppFooter />

    <ToastContainer />
  </div>
</template>

<style>
</style>
