<script setup>
import { posStore } from '../stores/posStore.js'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()
</script>

<template>
  <div class="card h-100 d-flex flex-column border-2">
    <div class="card-header bg-secondary p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center">
      <h2 class="m-0 text-uppercase fw-black fs-3">CARRITO</h2>
      <span class="badge bg-black text-white fs-5 border border-black shadow-sm px-3 py-2">{{ posStore.cart.length }} ITEMS</span>
    </div>
    
    <div class="card-body p-0 flex-grow-1 bg-white" style="overflow-y: auto; max-height: 45vh; min-height: 250px;">
      
      <div v-if="posStore.saleSuccess" class="alert bg-success border-bottom border-black border-2 p-5 text-center m-0 d-flex flex-column align-items-center justify-content-center h-100">
        <h1 class="fw-black m-0 text-black text-uppercase" style="font-size: 3rem;">¡VENTA ÉXITOSA!</h1>
        <p class="fw-bold mt-3 text-black fs-5">El inventario ha sido actualizado.</p>
      </div>
      
      <div v-else-if="posStore.cart.length === 0" class="p-5 text-center text-muted d-flex flex-column justify-content-center h-100 bg-light">
        <h1 class="fw-black text-uppercase text-secondary mb-3" style="font-size: 4rem;">VACÍO</h1>
        <h4 class="fw-bold text-uppercase text-black">Escanea un QR o busca un producto</h4>
      </div>
      
      <div v-else class="list-group list-group-flush">
        <div v-for="item in posStore.cart" :key="item.sku" class="list-group-item p-4 border-bottom border-black border-2 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center gap-4">
              <img v-if="item.image" :src="item.image" class="border border-black border-2 object-fit-cover shadow-sm" style="width: 80px; height: 80px;">
              <div>
                <h4 class="fw-black text-uppercase m-0 mb-1">{{ item.name }}</h4>
                <span class="badge bg-secondary text-black fw-bold fs-7 font-monospace border border-black">SKU: {{ item.sku }}</span>
              </div>
            </div>
            <div class="text-end d-flex flex-column align-items-end justify-content-center">
              <div class="input-group border border-black border-2 bg-white" style="width: 130px; height: 40px; box-shadow: 3px 3px 0px #000;">
                <span class="input-group-text bg-light border-0 fw-black px-2 py-0 fs-6">$</span>
                <input 
                  v-model.number="item.price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="form-control border-0 shadow-none fw-black fs-5 py-0 px-2 text-black text-end" 
                  placeholder="0.00"
                >
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center bg-light p-3 mt-3 border border-black border-2 shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <span class="fw-black text-uppercase fs-6 m-0">CANTIDAD:</span>
              <div class="d-flex align-items-center bg-white border border-black border-2 shadow-sm" style="height: 45px;">
                <button @click="posStore.decreaseQuantity(item)" class="btn rounded-0 border-0 fw-black fs-4 px-3 h-100 d-flex align-items-center justify-content-center bg-light" style="width: 45px;" :disabled="item.quantity <= 1">-</button>
                <div class="fw-black fs-5 px-3 text-center d-flex align-items-center justify-content-center border-start border-end border-black border-2 h-100 bg-white text-black" style="min-width: 60px;">{{ item.quantity }}</div>
                <button @click="posStore.increaseQuantity(item)" class="btn rounded-0 border-0 fw-black fs-4 px-3 h-100 d-flex align-items-center justify-content-center bg-light" style="width: 45px;" :disabled="item.quantity >= item.stock">+</button>
              </div>
            </div>
            <button @click="posStore.removeItem(item.sku)" class="btn btn-danger fw-black py-2 px-4 m-0 border border-black border-2 shadow-sm fs-6 d-flex align-items-center gap-2">
              X ELIMINAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
