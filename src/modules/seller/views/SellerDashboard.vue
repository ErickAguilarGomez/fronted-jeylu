<script setup>
import { authStore } from '@/modules/auth/stores/authStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
</script>

<template>
  <div class="container py-4">
    <PageHeader title="Panel de Vendedor">
    </PageHeader>

    <div class="row g-4 mb-5 justify-content-center">
      <!-- Módulo de Productos e Inventario -->
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border bg-white shadow-sm transition-hover rounded-3">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="seller-icon-circle rounded-circle d-flex align-items-center justify-content-center mb-3">
              <i class="bi bi-box-seam fs-3 text-dark"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Productos</h5>
            <p class="small text-muted mb-4 flex-grow-1">Administra los productos, imágenes, variantes y stock.</p>
            <router-link to="/admin/products" class="btn btn-amazon-primary w-100 py-2 fw-semibold mt-auto small">
              Gestionar Productos
            </router-link>
          </div>
        </div>
      </div>

      <!-- Módulo de Categorías (Disponible si es Vendedor Ayudante o Admin) -->
      <div v-if="authStore.isHelper() || authStore.isAdmin()" class="col-md-6 col-lg-4">
        <div class="card h-100 border bg-white shadow-sm transition-hover rounded-3">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="seller-icon-circle rounded-circle d-flex align-items-center justify-content-center mb-3">
              <i class="bi bi-tags-fill fs-3 text-dark"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Categorías</h5>
            <p class="small text-muted mb-4 flex-grow-1">Administra las categorías de productos de la tienda.</p>
            <router-link to="/admin/categories" class="btn btn-amazon-primary w-100 py-2 fw-semibold mt-auto small">
              Gestionar Categorías
            </router-link>
          </div>
        </div>
      </div>

      <!-- Módulo de Mis Ventas (Disponible para todos los vendedores) -->
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border bg-white shadow-sm transition-hover rounded-3">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="seller-icon-circle rounded-circle d-flex align-items-center justify-content-center mb-3">
              <i class="bi bi-receipt fs-3 text-dark"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Mis Ventas</h5>
            <p class="small text-muted mb-4 flex-grow-1">Revisa el historial de ventas que has realizado en caja.</p>
            <router-link to="/seller/sales" class="btn btn-amazon-primary w-100 py-2 fw-semibold mt-auto small">
              Ver Historial de Ventas
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seller-icon-circle {
  width: 64px;
  height: 64px;
  background-color: #f0f2f2;
  border: 1px solid #d5d9d9;
}

.transition-hover {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-color: #d5d9d9 !important;
}

.transition-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08) !important;
  border-color: #e77600 !important;
}
</style>
