<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { authStore } from '@/modules/auth/stores/authStore.js'
import NavBar from '@/shared/components/NavBar.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import ToastContainer from '@/shared/components/ToastContainer.vue'
import LowStockAlert from '@/modules/admin/components/LowStockAlert.vue'
import WhatsappFloatButton from '@/shared/components/WhatsappFloatButton.vue'

const route = useRoute()
const showWhatsappButton = computed(() => {
  return ['Home', 'Catalog', 'ProductDetail'].includes(route.name)
})

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

    <LowStockAlert />
    <WhatsappFloatButton v-if="showWhatsappButton" />
    <ToastContainer />
  </div>
</template>

<style>
</style>
