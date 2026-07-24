<script setup>
import { authStore } from '@/modules/auth/stores/authStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Panel de Vendedor">
    </PageHeader>

    <div class="row g-4 mb-5 justify-content-center">
      <!-- Módulo de Productos e Inventario -->
      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover border-black">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px; height: 70px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.84l-6.5-2.6v7.922l6.5 2.6zM5.22 4.254 1.846 2.904 8 1.442l3.15 1.26-5.93 2.373z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-4">Productos</h2>
            <p class="fw-bold mb-4 text-muted small">Administra los productos, imágenes, variantes y stock.</p>
            <router-link to="/admin/products" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-6">GESTIONAR PRODUCTOS</router-link>
          </div>
        </div>
      </div>

      <!-- Módulo de Categorías (Disponible si es Vendedor Ayudante o Admin) -->
      <div v-if="authStore.isHelper() || authStore.isAdmin()" class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover border-black">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px; height: 70px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-tags-fill" viewBox="0 0 16 16">
                <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-4">Categorías</h2>
            <p class="fw-bold mb-4 text-muted small">Administra las categorías de productos.</p>
            <router-link to="/admin/categories" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-6">GESTIONAR CATEGORÍAS</router-link>
          </div>
        </div>
      </div>

      <!-- Módulo de Mis Ventas (Disponible para todos los vendedores) -->
      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover border-black">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px; height: 70px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-receipt" viewBox="0 0 16 16">
                <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-4">Mis Ventas</h2>
            <p class="fw-bold mb-4 text-muted small">Revisa el historial de ventas que has realizado.</p>
            <router-link to="/seller/sales" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-6">VER HISTORIAL</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.transition-hover:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
</style>
