<script setup>
import { posStore } from '../stores/posStore.js'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()
</script>

<template>
  <div class="pos-cart-container d-flex flex-column h-100">
    
    <!-- Cart Header -->
    <div class="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-cart3 fs-5 text-dark"></i>
        <h6 class="fw-bold m-0 text-dark">Productos en Venta</h6>
        <span class="badge bg-warning text-dark fw-bold ms-1">
          {{ posStore.cart.length }} {{ posStore.cart.length === 1 ? 'artículo' : 'artículos' }}
        </span>
      </div>

      <button 
        v-if="posStore.cart.length > 0"
        @click="posStore.clearCart(toast)" 
        type="button" 
        class="btn btn-sm btn-outline-danger py-1 px-2 fs-8"
        title="Limpiar todo el carrito"
      >
        <i class="bi bi-trash me-1"></i> Vaciar
      </button>
    </div>
    
    <!-- Cart Items Scrollable List -->
    <div class="card-body p-0 bg-white custom-cart-scroll flex-grow-1" style="overflow-y: auto; min-height: 120px;">
      
      <!-- Sale Success Notice -->
      <div v-if="posStore.saleSuccess" class="alert alert-success border-0 p-4 text-center m-0 d-flex flex-column align-items-center justify-content-center h-100">
        <i class="bi bi-check-circle-fill fs-2 text-success mb-1"></i>
        <h5 class="fw-bold text-success m-0">¡Venta Exitosa!</h5>
        <span class="small text-muted">Comprobante generado e inventario actualizado.</span>
      </div>
      
      <!-- Empty Cart State (Compact) -->
      <div v-else-if="posStore.cart.length === 0" class="p-4 text-center text-muted d-flex flex-column align-items-center justify-content-center h-100 bg-light">
        <i class="bi bi-cart-x fs-2 text-secondary opacity-50 mb-2"></i>
        <div class="fw-semibold text-dark fs-7">El carrito está vacío</div>
        <div class="fs-8 text-muted mt-1">Escanea un código de barras o busca un producto a la izquierda.</div>
      </div>
      
      <!-- Cart Table / Rows -->
      <div v-else class="list-group list-group-flush">
        <div 
          v-for="item in posStore.cart" 
          :key="item.sku" 
          class="list-group-item p-2 px-3 border-bottom d-flex align-items-center gap-2 cart-row"
        >
          <!-- Thumbnail -->
          <img 
            v-if="item.image" 
            :src="item.image" 
            class="rounded border object-fit-cover flex-shrink-0" 
            style="width: 44px; height: 44px;"
          />
          <div v-else class="rounded border bg-light d-flex align-items-center justify-content-center flex-shrink-0 text-muted" style="width: 44px; height: 44px;">
            <i class="bi bi-image fs-6 opacity-50"></i>
          </div>

          <!-- Product Name & SKU -->
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold text-dark text-truncate fs-7 lh-sm" :title="item.name">
              {{ item.name }}
            </div>
            <div class="d-flex align-items-center gap-1 mt-1">
              <span class="badge bg-light text-secondary border font-monospace fs-8 py-0 px-1">
                {{ item.sku }}
              </span>
              <span v-if="item.size" class="badge bg-warning text-dark fs-8 py-0 px-1">
                Talle: {{ item.size }}
              </span>
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div class="d-flex align-items-center border rounded bg-white overflow-hidden flex-shrink-0">
            <button 
              @click="posStore.decreaseQuantity(item)" 
              class="btn btn-sm btn-light border-0 py-0 px-2 fw-bold text-dark" 
              :disabled="item.quantity <= 1"
              style="height: 28px;"
            >
              -
            </button>
            <span class="fw-bold fs-7 px-2 text-center text-dark" style="min-width: 28px;">
              {{ item.quantity }}
            </span>
            <button 
              @click="posStore.increaseQuantity(item)" 
              class="btn btn-sm btn-light border-0 py-0 px-2 fw-bold text-dark" 
              :disabled="item.quantity >= item.stock"
              style="height: 28px;"
            >
              +
            </button>
          </div>

          <!-- Unit Price Input -->
          <div class="input-group input-group-sm flex-shrink-0" style="width: 85px;">
            <span class="input-group-text bg-light border-end-0 px-1 fs-8 text-muted">$</span>
            <input 
              v-model.number="item.price" 
              type="number" 
              step="0.01" 
              min="0" 
              class="form-control text-end p-1 fs-7 fw-semibold border-start-0 shadow-none"
              title="Precio unitario (editable)"
            />
          </div>

          <!-- Subtotal -->
          <div class="text-end fw-bold text-dark fs-7 flex-shrink-0" style="min-width: 65px;">
            ${{ (item.price * item.quantity).toFixed(2) }}
          </div>

          <!-- Remove Item Button -->
          <button 
            @click="posStore.removeItem(item.sku)" 
            class="btn btn-sm btn-outline-danger border-0 p-1 flex-shrink-0 ms-1"
            title="Quitar producto"
          >
            <i class="bi bi-x-circle fs-5"></i>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-cart-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-cart-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-cart-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.cart-row:hover {
  background-color: #fafafa;
}
.fs-7 {
  font-size: 0.88rem;
}
.fs-8 {
  font-size: 0.76rem;
}
</style>
