<script setup>
import { authStore } from '@/modules/auth/stores/authStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'

const modules = [
  {
    title: 'Productos',
    description: 'Gestiona el inventario, actualiza precios y genera códigos QR.',
    icon: 'bi-box-seam',
    link: '/admin/products',
    btnText: 'Administrar'
  },
  {
    title: 'Categorías',
    description: 'Organiza los productos y subcategorías de tu inventario.',
    icon: 'bi-tags',
    link: '/admin/categories',
    btnText: 'Administrar'
  },
  {
    title: 'Tiendas',
    description: 'Gestión de sucursales físicas y asignación de personal.',
    icon: 'bi-shop',
    link: '/admin/stores',
    btnText: 'Administrar'
  },
  {
    title: 'Usuarios',
    description: 'Gestión de vendedores, roles, ayudantes y credenciales.',
    icon: 'bi-people',
    link: '/admin/users',
    btnText: 'Administrar'
  },
  {
    title: 'Ventas',
    description: 'Revisa el historial de ventas, comprobantes y reportes.',
    icon: 'bi-receipt',
    link: '/admin/sales',
    btnText: 'Historial'
  },
  {
    title: 'Banners',
    description: 'Gestiona las promociones del carrusel principal de la tienda.',
    icon: 'bi-images',
    link: '/admin/banners',
    btnText: 'Administrar'
  },
  {
    title: 'Redes Sociales & WhatsApp',
    description: 'Configura canales de atención y números de WhatsApp.',
    icon: 'bi-share',
    link: '/admin/social-media',
    btnText: 'Configurar'
  },
  {
    title: 'Comisiones',
    description: 'Configura las tasas de comisión para los vendedores.',
    icon: 'bi-wallet2',
    link: '/admin/commissions',
    btnText: 'Configurar'
  },
  {
    title: 'Formas de Pago',
    description: 'Administra métodos de pago aceptados en POS y tienda.',
    icon: 'bi-credit-card-2-front',
    link: '/admin/payment-methods',
    btnText: 'Administrar'
  },
  {
    title: 'Aumentos Masivos',
    description: 'Ajuste general de precios por categoría o marca.',
    icon: 'bi-percent',
    link: '/admin/price-increases',
    btnText: 'Administrar'
  }
]
</script>

<template>
  <div class="container py-4">
    <PageHeader title="Panel de Control y Administración">
    </PageHeader>

    <div class="row g-3 g-lg-4 mb-5">
      <div class="col-md-6 col-lg-4 col-xl-3" v-for="mod in modules" :key="mod.title">
        <div class="card h-100 border bg-white shadow-sm transition-hover rounded-3">
          <div class="card-body p-4 d-flex flex-column align-items-center text-center">
            <div class="admin-icon-circle rounded-circle d-flex align-items-center justify-content-center mb-3">
              <i :class="['bi', mod.icon, 'fs-3 text-dark']"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">{{ mod.title }}</h5>
            <p class="small text-muted mb-4 flex-grow-1">{{ mod.description }}</p>
            <router-link :to="mod.link" class="btn btn-amazon-primary w-100 py-2 fw-semibold mt-auto small">
              {{ mod.btnText }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-icon-circle {
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
