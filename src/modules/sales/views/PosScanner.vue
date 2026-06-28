<script setup>
import { ref, onMounted, watch } from 'vue'
import { posStore } from '../stores/posStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { useToast } from '@/composables/useToast.js'
import PosScannerCamera from '../components/PosScannerCamera.vue'
import PosCart from '../components/PosCart.vue'
import PosClientForm from '../components/PosClientForm.vue'
import PosVariantModal from '../components/PosVariantModal.vue'

const toast = useToast()

const selectedBaseProduct = ref(null)
const showVariantModal = ref(false)

onMounted(() => {
  posStore.fetchStores()
})

const addProductBySku = async (sku) => {
  const result = await posStore.addProductBySku(sku, toast)
  if (result && result.type === 'select_variant') {
    selectedBaseProduct.value = result.product
    showVariantModal.value = true
  }
}

const selectVariant = async (variant) => {
  showVariantModal.value = false
  await addProductBySku(variant.sku)
}

const processSale = async () => {
  await posStore.processSale(toast)
}

watch(() => posStore.selectedStoreId, (newStore, oldStore) => {
  if (oldStore && posStore.cart.length > 0) {
    posStore.clearCart(toast)
  }
})
</script>

<template>
  <div class="container-fluid py-4 px-lg-5">
    <!-- Banner de Sucursal Asignada para Vendedores -->
    <div v-if="authStore.user?.role_id === 2 && authStore.user?.primary_store" class="alert bg-warning border-black border-3 shadow-solid mb-4 p-4 d-flex align-items-center gap-3" style="box-shadow: 6px 6px 0px #000 !important;">
      <span class="fs-1">🏪</span>
      <div>
        <h4 class="fw-black text-uppercase m-0">SUCURSAL ASIGNADA: {{ authStore.user.primary_store.name.toUpperCase() }}</h4>
        <p class="m-0 fw-bold text-black-50">{{ authStore.user.primary_store.address.toUpperCase() }}</p>
      </div>
    </div>

    <!-- Si el Vendedor no tiene sucursal asignada -->
    <div v-if="authStore.user?.role_id === 2 && !authStore.user?.primary_store" class="alert bg-danger text-white border-black border-3 shadow-solid mb-4 p-4 d-flex align-items-center gap-3" style="box-shadow: 6px 6px 0px #000 !important;">
      <span class="fs-1">⚠️</span>
      <div>
        <h4 class="fw-black text-uppercase m-0">SIN SUCURSAL ASIGNADA</h4>
        <p class="m-0 fw-bold text-white-50">Por favor, solicite a un administrador que le asigne una sucursal para poder procesar ventas.</p>
      </div>
    </div>

    <div class="row g-4 align-items-stretch">
      <!-- SCANNER SECTION -->
      <div class="col-lg-6 d-flex flex-column">
        <PosScannerCamera :loadingItem="posStore.loadingItem" @add-product="addProductBySku" />
      </div>
      
      <!-- CART SECTION -->
      <div class="col-lg-6 d-flex flex-column">
        <div class="card h-100 d-flex flex-column border-2">
          <div class="flex-grow-1 bg-white">
            <PosCart />
          </div>
          
          <div class="card-footer bg-secondary p-4 border-top border-black border-2 mt-auto">
            <PosClientForm />

            <div class="d-flex justify-content-between align-items-end mb-4 bg-white border border-black border-2 p-3 shadow-sm">
              <h2 class="fw-black text-uppercase m-0">TOTAL</h2>
              <h1 class="fw-black m-0 text-black text-uppercase" style="font-size: 3rem;">$ {{ posStore.cartTotal.toFixed(2) }}</h1>
            </div>
            <button 
              @click="processSale" 
              class="btn btn-primary w-100 py-4 fw-black text-uppercase m-0"
              style="font-size: 1.5rem;"
              :disabled="posStore.cart.length === 0 || posStore.processingSale"
            >
              {{ posStore.processingSale ? 'PROCESANDO TRANSACCIÓN...' : 'CONFIRMAR VENTA POS' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Selección de Variantes -->
    <PosVariantModal 
      :show="showVariantModal" 
      :product="selectedBaseProduct" 
      @close="showVariantModal = false"
      @select="selectVariant"
    />
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
</style>
