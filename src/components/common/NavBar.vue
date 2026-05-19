<script setup>
import { authStore } from '@/modules/auth/stores/authStore.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg d-flex justify-content-between align-items-center mb-4">
    <div class="d-flex align-items-center gap-4">
      <router-link to="/" class="navbar-brand text-decoration-none text-black d-flex align-items-center gap-2">
        <span class="fs-1 fw-black" style="letter-spacing: -2px;">JEILU</span>
        <span class="badge bg-warning text-black ms-2 fs-6 border border-black shadow-sm">STORE</span>
      </router-link>
      <div class="d-none d-md-flex gap-3">
        <router-link to="/" class="nav-btn btn btn-secondary text-decoration-none py-2 px-3 fs-6">CATÁLOGO</router-link>
        <router-link v-if="authStore.hasPosAccess()" to="/admin/pos" class="nav-btn btn btn-secondary text-decoration-none py-2 px-3 fs-6">POS / SCANNER</router-link>
        <router-link v-if="authStore.isAdmin()" to="/admin" class="nav-btn btn btn-secondary text-decoration-none py-2 px-3 fs-6">ADMINISTRACIÓN</router-link>
      </div>
    </div>

    <div class="d-flex align-items-center gap-3">
      <template v-if="authStore.isAuthenticated">
        <div class="d-none d-lg-flex flex-column align-items-end me-2">
          <span class="fw-bold fs-6">{{ authStore.user?.name }}</span>
          <span class="badge bg-primary text-white fs-7">{{ authStore.user?.role_name || 'Cashier' }}</span>
        </div>
        <button @click="handleLogout" class="btn btn-danger py-2 px-3 fs-6">SALIR</button>
      </template>
      <template v-else>
        <router-link to="/login" class="btn btn-primary py-2 px-4 fs-6">INICIAR SESIÓN</router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #FFFFFF;
  border-bottom: 3px solid #000000;
  box-shadow: 0px 4px 0px #000000;
  padding: 1rem 2rem;
}
.nav-btn.router-link-active {
  background-color: #FAFFA0 !important;
  border-color: #000000 !important;
  font-weight: 900 !important;
  box-shadow: 2px 2px 0px #000000 !important;
}
</style>
