<script setup>
import { onMounted } from 'vue'
import { socialMediaStore } from '@/modules/settings/stores/socialMediaStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'

onMounted(() => {
  if (socialMediaStore.socialMedia.length === 0) {
    socialMediaStore.fetchActiveSocialMedia()
  }
})

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <footer class="amazon-footer mt-auto">
    <!-- 1. Back to Top Bar -->
    <div 
      @click="scrollToTop" 
      class="back-to-top-bar text-center py-3 text-white cursor-pointer"
      role="button"
      tabindex="0"
    >
      <span class="fs-7 fw-semibold">Inicio de página</span>
    </div>

    <!-- 2. Real Store Directory Columns -->
    <div class="footer-links-section py-5 text-white">
      <div class="container">
        <div class="row g-4 justify-content-around">
          
          <!-- Column 1: Catálogo y Tienda -->
          <div class="col-12 col-sm-6 col-md-4">
            <h6 class="footer-heading fw-bold mb-3 text-white">Catálogo y Tienda</h6>
            <ul class="list-unstyled footer-list mb-0 d-flex flex-column gap-2">
              <li><router-link to="/">Inicio</router-link></li>
              <li><router-link to="/catalog">Catálogo Completo</router-link></li>
              <li><a href="/#tiendas">Nuestras Sucursales</a></li>
            </ul>
          </div>

          <!-- Column 3: Accesos al Sistema -->
          <div class="col-12 col-sm-6 col-md-4">
            <h6 class="footer-heading fw-bold mb-3 text-white">Accesos al Sistema</h6>
            <ul class="list-unstyled footer-list mb-0 d-flex flex-column gap-2">
              <li v-if="!authStore.isAuthenticated">
                <router-link to="/login">Iniciar Sesión</router-link>
              </li>
              <li v-if="authStore.isSeller() || authStore.isAdmin()">
                <router-link to="/seller">Panel de Vendedor</router-link>
              </li>
              <li v-if="authStore.hasPosAccess()">
                <router-link to="/pos">Punto de Venta (POS)</router-link>
              </li>
              <li v-if="authStore.isAdmin()">
                <router-link to="/admin">Panel de Administración</router-link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- 3. Middle Divider with Brand and Social Links -->
    <div class="footer-brand-section py-4 border-top border-secondary border-opacity-25 text-center">
      <div class="container d-flex flex-column flex-md-row align-items-center justify-content-center gap-4">
        <!-- Brand Logo (Clean JEILU) -->
        <router-link to="/" class="d-inline-flex flex-column align-items-center text-decoration-none text-white">
          <span class="fs-4 fw-bold">JEILU</span>
          <svg viewBox="0 0 100 20" width="60" height="10">
            <path d="M 5 5 Q 50 25 95 5" fill="none" stroke="#FEBD69" stroke-width="3.5" stroke-linecap="round"/>
            <polygon points="90,1 98,6 94,13" fill="#FEBD69" />
          </svg>
        </router-link>

        <!-- Social Media Links -->
        <div v-if="socialMediaStore.socialMedia.length > 0" class="d-flex gap-2">
          <a 
            v-for="item in socialMediaStore.socialMedia" 
            :key="item.id" 
            v-show="item.type !== 'whatsapp' && item.url"
            :href="item.url" 
            target="_blank" 
            class="footer-social-btn text-white text-decoration-none border border-secondary border-opacity-50 rounded px-2 py-1" 
            :title="item.type.toUpperCase()"
          >
            <i :class="['bi', `bi-${item.icon || item.type}`, 'fs-6']"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- 4. Bottom Copyright -->
    <div class="footer-legal-section py-3 text-center text-white-50 fs-8">
      <div class="container">
        <p class="m-0">
          © 2026 JEILU - Catálogo Online & Sistema POS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.amazon-footer {
  background-color: var(--amazon-navy-dark, #131921);
  color: #ffffff;
}

.back-to-top-bar {
  background-color: var(--amazon-navy-subtle, #37475a);
  transition: background-color 0.15s ease;
}

.back-to-top-bar:hover {
  background-color: #485769;
}

.footer-links-section {
  background-color: var(--amazon-navy-light, #232f3e);
}

.footer-heading {
  font-size: 0.95rem;
  color: #ffffff;
}

.footer-list a {
  color: #dddddd;
  font-size: 0.86rem;
  text-decoration: none;
  transition: color 0.1s ease;
}

.footer-list a:hover {
  color: #ffffff;
  text-decoration: underline;
}

.footer-brand-section {
  background-color: var(--amazon-navy-light, #232f3e);
}

.footer-social-btn:hover {
  border-color: #ffffff !important;
  color: #ffffff;
}

.footer-legal-section {
  background-color: var(--amazon-navy-dark, #131921);
}

.fs-7 {
  font-size: 0.85rem;
}

.fs-8 {
  font-size: 0.75rem;
}
</style>
