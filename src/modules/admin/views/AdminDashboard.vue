<script setup>
import { authStore } from '@/modules/auth/stores/authStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Panel de Administración">
    </PageHeader>

    <div class="row g-4 mb-5">
      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.84l-6.5-2.6v7.922l6.5 2.6zM5.22 4.254 1.846 2.904 8 1.442l3.15 1.26-5.93 2.373z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Productos</h2>
            <p class="fw-bold mb-4 text-muted">Gestiona el inventario, actualiza precios y genera códigos QR.</p>
            <router-link to="/admin/products" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">ADMINISTRAR</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-tags" viewBox="0 0 16 16">
                <path d="M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2z"/>
                <path d="M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1v5.086z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Categorías</h2>
            <p class="fw-bold mb-4 text-muted">Organiza los productos de tu inventario.</p>
            <router-link to="/admin/categories" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">ADMINISTRAR</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16">
                <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .364-.976l2.605-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Tiendas</h2>
            <p class="fw-bold mb-4 text-muted">Gestión de sucursales.</p>
            <router-link to="/admin/stores" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">ADMINISTRAR</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Usuarios</h2>
            <p class="fw-bold mb-4 text-muted">Gestión de roles y accesos.</p>
            <router-link to="/admin/users" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">ADMINISTRAR</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-receipt" viewBox="0 0 16 16">
                <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Ventas</h2>
            <p class="fw-bold mb-4 text-muted">Revisa el historial de ventas.</p>
            <router-link to="/admin/sales" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">HISTORIAL</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
                <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2zM14 3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Banners</h2>
            <p class="fw-bold mb-4 text-muted">Gestiona las imágenes del carrusel del inicio.</p>
            <router-link to="/admin/banners" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">ADMINISTRAR</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 border-2 shadow-sm transition-hover">
          <div class="card-body p-5 d-flex flex-column align-items-center text-center">
            <div class="bg-black text-white rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </div>
            <h2 class="fw-black text-uppercase mb-3 fs-3">Redes Sociales</h2>
            <p class="fw-bold mb-4 text-muted">Configura enlaces de contacto y redes de la tienda.</p>
            <router-link to="/admin/social-media" class="btn btn-outline-dark border-2 w-100 py-3 fw-black mt-auto fs-5">CONFIGURAR</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.transition-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.transition-hover:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
</style>
