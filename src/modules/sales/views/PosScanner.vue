<script setup>
import { ref, onMounted, watch } from 'vue'
import { posStore } from '../stores/posStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { useToast } from '@/composables/useToast.js'
import PosScannerCamera from '../components/PosScannerCamera.vue'
import PosCart from '../components/PosCart.vue'
import PosClientForm from '../components/PosClientForm.vue'
import PosVariantModal from '../components/PosVariantModal.vue'
import PosReceiptModal from '../components/PosReceiptModal.vue'

const toast = useToast()

const selectedBaseProduct = ref(null)
const showVariantModal = ref(false)

const closeReceiptModal = () => {
  posStore.resetPosForm()
}

onMounted(() => {
  posStore.fetchStores()
  posStore.fetchPaymentMethods()
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

            <!-- Selector de Forma de Pago (Único vs Mixto) -->
            <div class="mb-4 bg-white border border-black border-2 p-3 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-black pb-2">
                <label class="form-label fw-black text-uppercase fs-6 m-0 text-primary">
                  💳 Forma de Pago
                </label>
                <div class="form-check form-switch m-0">
                  <input 
                    class="form-check-input border-black border-2 shadow-none cursor-pointer" 
                    type="checkbox" 
                    id="multiPaymentToggle"
                    v-model="posStore.isMultiPayment"
                  >
                  <label class="form-check-label fw-black small text-uppercase cursor-pointer ms-1" for="multiPaymentToggle">
                    {{ posStore.isMultiPayment ? '🔀 Pago Mixto' : '👤 Pago Único' }}
                  </label>
                </div>
              </div>

              <!-- MODO PAGO ÚNICO -->
              <div v-if="!posStore.isMultiPayment">
                <select v-model="posStore.paymentMethodId" class="form-select form-select-lg border-black border-2 fw-bold bg-white shadow-none" required>
                  <option value="" disabled>Seleccione una forma de pago...</option>
                  <option v-for="pm in posStore.paymentMethods" :key="pm.id" :value="pm.id">
                    {{ pm.name }}
                  </option>
                </select>
              </div>

              <!-- MODO PAGO MIXTO / MULTIPLE (100% RESPONSIVE) -->
              <div v-else class="d-flex flex-column gap-2">
                <div v-for="(pRow, idx) in posStore.payments" :key="idx" class="p-2 bg-light border border-black border-2 shadow-sm">
                  <div class="row g-2 align-items-center">
                    <!-- Dropdown del Método de Pago -->
                    <div class="col-12 col-sm-6">
                      <select v-model="pRow.payment_method_id" class="form-select border-black border-2 fw-bold bg-white shadow-none">
                        <option value="" disabled>Forma de Pago #{{ idx + 1 }}...</option>
                        <option v-for="pm in posStore.paymentMethods" :key="pm.id" :value="pm.id">
                          {{ pm.name }}
                        </option>
                      </select>
                    </div>

                    <!-- Input del Monto (Espacioso, numérico y responsive) -->
                    <div class="col-8 col-sm-4">
                      <div class="input-group border border-black border-2 bg-white" style="box-shadow: 2px 2px 0px #000;">
                        <span class="input-group-text bg-light border-0 fw-black px-2 py-0 fs-6">$</span>
                        <input 
                          v-model.number="pRow.amount" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          class="form-control border-0 fw-black fs-5 shadow-none text-end py-1 px-2 text-black"
                          placeholder="0.00"
                        >
                      </div>
                    </div>

                    <!-- Botón Eliminar Fila -->
                    <div class="col-4 col-sm-2 text-end">
                      <button 
                        @click="posStore.removePaymentRow(idx)" 
                        class="btn btn-danger w-100 border-black border-2 fw-black py-2 px-1 d-flex align-items-center justify-content-center gap-1 shadow-sm" 
                        :disabled="posStore.payments.length <= 1"
                        title="Eliminar forma de pago"
                      >
                        <span class="fs-6">✕</span>
                        <span class="d-inline d-sm-none small fw-bold">QUITAR</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-2 pt-2 border-top border-black border-2">
                  <button @click="posStore.addPaymentRow()" class="btn btn-dark btn-sm fw-black border border-black border-2 text-uppercase py-2 px-3 w-100 w-sm-auto">
                    + AGREGAR OTRA FORMA DE PAGO
                  </button>
                  
                  <span class="fw-black fs-6 py-1 px-3 border border-black border-2 bg-white text-uppercase" :class="posStore.remainingPaymentAmount === 0 ? 'text-success border-success' : 'text-danger border-danger'">
                    Restante: $ {{ posStore.remainingPaymentAmount.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

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

    <!-- Modal Comprobante y Ticket Térmico POS (58mm / 80mm) -->
    <PosReceiptModal
      :show="posStore.showReceiptModal"
      :saleData="posStore.lastCompletedSale"
      @close="closeReceiptModal"
    />
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
</style>
