<script setup>
import { computed } from 'vue'
import { cartStore } from '../stores/cartStore.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCheckout = () => {
  if (cartStore.isEmpty) return
  router.push('/checkout')
}
</script>

<template>
  <div class="amazon-cart-page py-4">
    <div class="container-fluid px-3 px-lg-5">
      
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small mb-0">
          <li class="breadcrumb-item"><router-link to="/" class="text-muted text-decoration-none">Inicio</router-link></li>
          <li class="breadcrumb-item"><router-link to="/catalog" class="text-muted text-decoration-none">Catálogo</router-link></li>
          <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">Carrito de Compras</li>
        </ol>
      </nav>

      <!-- Empty Cart State -->
      <div v-if="cartStore.isEmpty" class="card bg-white p-5 border-0 shadow-sm text-center my-4">
        <div class="empty-cart-icon mb-3">
          <i class="bi bi-cart-x fs-1 text-secondary opacity-50"></i>
        </div>
        <h3 class="fw-bold text-dark mb-2">Tu carrito de JEILU está vacío</h3>
        <p class="text-muted mb-4 mx-auto" style="max-width: 500px;">
          Descubre nuestro catálogo exclusivo de calzado y moda. Agrega tus modelos y talles favoritos para continuar con tu compra.
        </p>
        <div>
          <router-link to="/catalog" class="btn btn-amazon-primary px-4 py-2 fw-semibold rounded-pill">
            <i class="bi bi-grid me-2"></i> Explorar Catálogo
          </router-link>
        </div>
      </div>

      <!-- Active Cart Layout (Amazon 2-Column) -->
      <div v-else class="row g-4 align-items-start">
        
        <!-- Left Column: Items List -->
        <div class="col-lg-8">
          <div class="card bg-white p-4 border-0 shadow-sm rounded-3">
            
            <div class="d-flex justify-content-between align-items-end border-bottom pb-3 mb-3">
              <div>
                <h2 class="h4 fw-bold text-dark m-0">Carrito de compras</h2>
                <span class="text-muted small">
                  {{ cartStore.totalCount }} {{ cartStore.totalCount === 1 ? 'artículo seleccionado' : 'artículos seleccionados' }}
                </span>
              </div>
              <span class="text-muted small d-none d-sm-inline">Precio</span>
            </div>

            <!-- List of Items -->
            <div class="d-flex flex-column gap-3">
              <div 
                v-for="item in cartStore.items" 
                :key="item.id"
                class="cart-item-row p-3 rounded border bg-light bg-opacity-25 d-flex flex-column flex-sm-row gap-3 align-items-sm-center justify-content-between"
              >
                <!-- Thumbnail & Main Info -->
                <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
                  <router-link :to="'/producto/' + item.sku" class="flex-shrink-0">
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name" 
                      class="rounded border object-fit-contain bg-white" 
                      style="width: 80px; height: 80px;"
                    />
                    <div v-else class="rounded border bg-light d-flex align-items-center justify-content-center text-muted flex-shrink-0" style="width: 80px; height: 80px;">
                      <i class="bi bi-image fs-3 opacity-50"></i>
                    </div>
                  </router-link>

                  <div class="overflow-hidden flex-grow-1">
                    <h5 class="m-0 mb-1 fs-6 fw-bold">
                      <router-link :to="'/producto/' + item.sku" class="text-dark text-decoration-none hover-link text-truncate d-block">
                        {{ item.name }}
                      </router-link>
                    </h5>
                    
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span v-if="item.size" class="badge bg-warning text-dark fw-bold px-2 py-1">
                        Talle: {{ item.size }}
                      </span>
                      <span class="text-muted small font-monospace">SKU: {{ item.sku }}</span>
                      <span class="text-success small fw-semibold">
                        <i class="bi bi-check-circle-fill me-1"></i> En Stock
                      </span>
                    </div>

                    <div v-if="item.storeName" class="text-muted fs-8">
                      <i class="bi bi-shop me-1"></i> {{ item.storeName }}
                    </div>
                  </div>
                </div>

                <!-- Controls: Stepper, Delete & Price -->
                <div class="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 flex-shrink-0 border-top border-sm-0 pt-2 pt-sm-0">
                  
                  <!-- Quantity Stepper -->
                  <div class="d-flex align-items-center border rounded bg-white overflow-hidden shadow-none">
                    <button 
                      @click="cartStore.decreaseQuantity(item.id)" 
                      class="btn btn-sm btn-light border-0 py-1 px-2 fw-bold text-dark"
                      style="width: 32px; height: 32px;"
                      title="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span class="fw-bold px-3 text-center text-dark fs-7" style="min-width: 36px;">
                      {{ item.quantity }}
                    </span>
                    <button 
                      @click="cartStore.increaseQuantity(item.id)" 
                      class="btn btn-sm btn-light border-0 py-1 px-2 fw-bold text-dark"
                      :disabled="item.stock > 0 && item.quantity >= item.stock"
                      style="width: 32px; height: 32px;"
                      title="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <!-- Unit Price & Subtotal (Read-only!) -->
                  <div class="text-end" style="min-width: 100px;">
                    <div class="fw-bold text-dark fs-6">
                      ${{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                    <div v-if="item.quantity > 1" class="text-muted fs-8">
                      (${{ Number(item.price).toFixed(2) }} c/u)
                    </div>
                  </div>

                  <!-- Remove Action -->
                  <button 
                    @click="cartStore.removeItem(item.id)" 
                    class="btn btn-sm btn-outline-danger border-0 p-2"
                    title="Eliminar producto del carrito"
                  >
                    <i class="bi bi-trash3 fs-6"></i>
                  </button>
                </div>

              </div>
            </div>

            <!-- List Subtotal Footer -->
            <div class="d-flex justify-content-end align-items-center gap-2 pt-4 mt-3 border-top text-end">
              <span class="fs-6 text-muted">Subtotal ({{ cartStore.totalCount }} productos):</span>
              <span class="fs-4 fw-bold text-dark">${{ cartStore.totalAmount.toFixed(2) }}</span>
            </div>

          </div>
        </div>

        <!-- Right Column: Order Summary & Checkout Card -->
        <div class="col-lg-4">
          <div class="card bg-white p-4 border-0 shadow-sm rounded-3 sticky-top" style="top: 85px;">
            
            <div class="mb-3">
              <div class="d-flex align-items-center gap-2 text-success small fw-semibold mb-2">
                <i class="bi bi-shield-check fs-5"></i>
                <span>Compra protegida y confirmación directa</span>
              </div>
              <p class="text-muted fs-8 m-0">
                Coordina la entrega a domicilio o retiro inmediato en sucursal con atención oficial.
              </p>
            </div>

            <!-- Summary Amount -->
            <div class="d-flex justify-content-between align-items-baseline mb-4 p-3 bg-light rounded">
              <span class="text-muted fw-semibold">Total a pagar:</span>
              <span class="fs-3 fw-bold text-dark">${{ cartStore.totalAmount.toFixed(2) }}</span>
            </div>

            <!-- Primary Checkout Button -->
            <button 
              @click="goToCheckout" 
              class="btn btn-amazon-primary w-100 py-3 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill mb-2 fs-6"
            >
              <i class="bi bi-bag-check fs-5"></i>
              <span>Proceder al Pago</span>
            </button>

            <!-- Secondary Continue Shopping Button -->
            <router-link 
              to="/catalog" 
              class="btn btn-outline-secondary w-100 py-2 fw-semibold rounded-pill fs-7"
            >
              Seguir Comprando
            </router-link>

            <!-- Trust Badge -->
            <div class="d-flex align-items-center justify-content-center gap-2 text-muted fs-8 mt-3 pt-3 border-top">
              <i class="bi bi-lock-fill"></i>
              <span>Garantía oficial JEILU</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.amazon-cart-page {
  min-height: 80vh;
  background-color: var(--amazon-bg, #eaeded);
}

.cart-item-row {
  border-color: #e5e7eb !important;
  transition: background-color 0.15s ease;
}

.cart-item-row:hover {
  background-color: #ffffff !important;
}

.hover-link:hover {
  color: var(--amazon-link-hover, #c7511f) !important;
  text-decoration: underline !important;
}

.fs-7 {
  font-size: 0.88rem;
}

.fs-8 {
  font-size: 0.76rem;
}
</style>
