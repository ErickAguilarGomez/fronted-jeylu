<script setup>
import { onMounted, ref } from 'vue'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { useRouter } from 'vue-router'
import { socialMediaStore } from '@/modules/settings/stores/socialMediaStore.js'
import { whatsappStore } from '@/modules/settings/stores/whatsappStore.js'
import WhatsappSelector from '@/shared/components/WhatsappSelector.vue'

const router = useRouter()
const whatsappSelectorRef = ref(null)

onMounted(() => {
  if (socialMediaStore.socialMedia.length === 0) {
    socialMediaStore.fetchActiveSocialMedia()
  }
  whatsappStore.fetchActiveNumbers()
})

const handleLogout = async () => {
  await authStore.logout()
  window.location.href = '/login'
}

const openWhatsappSelector = () => {
  if (whatsappSelectorRef.value) {
    whatsappSelectorRef.value.open()
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-xl mb-4">
    <div class="container-fluid p-0 d-flex align-items-center justify-content-between">
      
      <!-- Brand Logo -->
      <router-link to="/" class="navbar-brand text-decoration-none text-black d-flex align-items-center gap-2 m-0 me-3">
        <span class="fs-1 fw-black" style="letter-spacing: -2px;">JEILU</span>
      </router-link>

      <!-- Mobile Toggle Button (Styled Brutalist) -->
      <button 
        class="navbar-toggler border-2 border-black p-2 ms-auto" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#jeiluNavbar" 
        aria-controls="jeiluNavbar" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
        style="box-shadow: 2px 2px 0px #000; background-color: #fff; border-radius: 0px;"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar Links & Actions Collapse Container -->
      <div class="collapse navbar-collapse mt-3 mt-xl-0" id="jeiluNavbar">
        <!-- Center/Left Navigation Links -->
        <div class="navbar-nav me-auto gap-2 gap-xl-3 my-2 my-xl-0">
          <router-link to="/" class="nav-btn btn btn-outline-dark text-decoration-none py-2 px-3 fs-6 fw-black border-2 border-black text-center" :class="{ 'active-link': $route.path === '/' }">INICIO</router-link>
          <router-link to="/catalog" class="nav-btn btn btn-outline-dark text-decoration-none py-2 px-3 fs-6 fw-black border-2 border-black text-center" :class="{ 'active-link': $route.path === '/catalog' }">CATÁLOGO</router-link>
          <router-link v-if="authStore.hasPosAccess()" to="/pos" class="nav-btn btn btn-outline-dark text-decoration-none py-2 px-3 fs-6 fw-black border-2 border-black text-center">POS / SCANNER</router-link>
          <router-link v-if="authStore.isAdmin()" to="/admin" class="nav-btn btn btn-outline-dark text-decoration-none py-2 px-3 fs-6 fw-black border-2 border-black text-center">ADMINISTRACIÓN</router-link>
          <router-link v-if="authStore.isSeller()" to="/seller" class="nav-btn btn btn-outline-dark text-decoration-none py-2 px-3 fs-6 fw-black border-2 border-black text-center">MI PANEL</router-link>
        </div>

        <!-- Social Media Icons (Navbar) -->
        <div v-if="socialMediaStore.socialMedia.length > 0 || whatsappStore.whatsappNumbers.length > 0" class="d-flex align-items-center gap-3 me-xl-4 my-3 my-xl-0 justify-content-center">
          <!-- WhatsApp Icon (Selector Trigger) -->
          <a 
            v-if="whatsappStore.whatsappNumbers.length > 0"
            href="#"
            @click.prevent="openWhatsappSelector"
            class="social-nav-link" 
            title="WHATSAPP"
          >
            <i class="bi bi-whatsapp fs-4"></i>
          </a>

          <!-- Other networks -->
          <a 
            v-for="item in socialMediaStore.socialMedia" 
            :key="item.id" 
            v-show="item.type !== 'whatsapp' && item.url"
            :href="item.url" 
            target="_blank" 
            class="social-nav-link" 
            :title="item.type.toUpperCase()"
          >
            <i :class="['bi', `bi-${item.icon || item.type}`, 'fs-4']"></i>
          </a>
        </div>

        <!-- Right User Actions & Logout -->
        <div class="d-flex flex-column flex-xl-row align-items-stretch align-items-xl-center gap-3 mt-2 mt-xl-0 border-xl-0 border-black pt-3 pt-xl-0">
          <template v-if="authStore.isAuthenticated">
            <div class="d-flex flex-column align-items-start align-items-xl-end justify-content-center me-xl-3 gap-1">
              <span class="fw-black text-uppercase fs-6 text-nowrap">{{ authStore.user?.name }}</span>
              <span class="badge bg-black text-white fs-7 py-1 px-2 border-0">{{ authStore.user?.role_name || 'Cashier' }}</span>
            </div>
            <button @click="handleLogout" class="btn btn-outline-dark py-2 px-3 fs-6 fw-black border-2 border-black text-center w-100 w-xl-auto">SALIR</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-dark py-2 px-4 fs-6 fw-black border-2 border-black text-center w-100 w-xl-auto">INICIAR SESIÓN</router-link>
          </template>
        </div>
      </div>
      
    </div>
    
    <!-- Selector de WhatsApp reusable -->
    <WhatsappSelector ref="whatsappSelectorRef" />
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #FFFFFF;
  border-bottom: 3px solid #000000;
  box-shadow: 0px 4px 0px #000000;
  padding: 0.75rem 1.5rem;
}
.nav-btn.router-link-active:not([href="/"]),
.nav-btn.active-link {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  border-color: #000000 !important;
  font-weight: 900 !important;
  box-shadow: 2px 2px 0px #000000 !important;
}

/* Force compact buttons inside navbar to override global brutalist padding */
.navbar .btn,
.navbar button,
.navbar .nav-btn {
  padding: 8px 16px !important;
  font-size: 0.85rem !important;
  letter-spacing: 0.5px !important;
}

@media (max-width: 1199.98px) {
  .navbar-nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .nav-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

.social-nav-link {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  color: #000000 !important;
  border: none !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
}

.social-nav-link:hover {
  color: #ffde59 !important;
  transform: scale(1.2) rotate(8deg);
}
</style>
