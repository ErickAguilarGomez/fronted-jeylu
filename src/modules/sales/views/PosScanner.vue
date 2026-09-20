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
  <div class="pos-screen-container container-fluid px-3 py-2">
    <!-- Banner de Sucursal Asignada para Vendedores (Ultra Compacto) -->
    <div v-if="authStore.user?.role_id === 2 && authStore.user?.primary_store" class="alert alert-info py-1 px-3 mb-2 d-flex align-items-center justify-content-between border rounded-2 small shadow-sm">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-shop text-primary"></i>
        <span class="fw-bold text-dark">Sucursal: {{ authStore.user.primary_store.name }}</span>
        <span class="text-muted d-none d-md-inline">| {{ authStore.user.primary_store.address }}</span>
      </div>
      <span class="badge bg-primary text-white fs-8">Vendedor</span>
    </div>

    <!-- Si el Vendedor no tiene sucursal asignada -->
    <div v-if="authStore.user?.role_id === 2 && !authStore.user?.primary_store" class="alert alert-danger py-1 px-3 mb-2 d-flex align-items-center gap-2 small rounded-2">
      <i class="bi bi-exclamation-triangle-fill text-danger fs-6"></i>
      <div>
        <strong>Sin Sucursal Asignada:</strong> Solicita a un administrador asignarte una sucursal para procesar ventas.
      </div>
    </div>

    <div class="row g-2 flex-grow-1 overflow-hidden pos-main-row">
      <!-- LEFT SECTION: SCANNER & PRODUCT SEARCH -->
      <div class="col-lg-5 d-flex flex-column h-100 overflow-hidden pos-left-col">
        <PosScannerCamera :loadingItem="posStore.loadingItem" @add-product="addProductBySku" />
      </div>
      
      <!-- RIGHT SECTION: CART & CHECKOUT -->
      <div class="col-lg-7 d-flex flex-column h-100 overflow-hidden pos-right-col">
        <div class="card border shadow-sm rounded-3 h-100 d-flex flex-column overflow-hidden bg-white">
          
          <!-- Cart Items Section (Flex-grow with internal scroll) -->
          <div class="flex-grow-1 overflow-hidden d-flex flex-column">
            <PosCart />
          </div>
          
          <!-- Checkout Panel (Pinned at Bottom, Compact Amazon Card) -->
          <div class="card-footer bg-light p-2 p-md-3 border-top mt-auto">
            <!-- Client & Branch Form -->
            <PosClientForm />

            <!-- Selector de Método de Pago -->
            <div class="bg-white border rounded-2 p-2 px-3 mb-2 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label text-dark fw-semibold small m-0 d-flex align-items-center gap-1">
                  <i class="bi bi-credit-card text-secondary"></i>
                  <span>Método de Pago</span>
                </label>
                <div class="form-check form-switch m-0 d-flex align-items-center gap-1">
                  <input 
                    class="form-check-input shadow-none cursor-pointer" 
                    type="checkbox" 
                    id="multiPaymentToggle"
                    v-model="posStore.isMultiPayment"
                  >
                  <label class="form-check-label small fw-semibold text-secondary cursor-pointer" for="multiPaymentToggle">
                    {{ posStore.isMultiPayment ? 'Pago Mixto' : 'Pago Único' }}
                  </label>
                </div>
              </div>

              <!-- MODO PAGO ÚNICO -->
              <div v-if="!posStore.isMultiPayment">
                <select v-model="posStore.paymentMethodId" class="form-select form-select-sm border shadow-none fw-semibold" required>
                  <option value="" disabled>Seleccione una forma de pago...</option>
                  <option v-for="pm in posStore.paymentMethods" :key="pm.id" :value="pm.id">
                    {{ pm.name }}
                  </option>
                </select>
              </div>

              <!-- MODO PAGO MIXTO -->
              <div v-else class="d-flex flex-column gap-2 pt-1">
                <div v-for="(pRow, idx) in posStore.payments" :key="idx" class="p-1 px-2 bg-light border rounded">
                  <div class="row g-1 align-items-center">
                    <div class="col-6">
                      <select v-model="pRow.payment_method_id" class="form-select form-select-sm border shadow-none">
                        <option value="" disabled>Método #{{ idx + 1 }}...</option>
                        <option v-for="pm in posStore.paymentMethods" :key="pm.id" :value="pm.id">
                          {{ pm.name }}
                        </option>
                      </select>
                    </div>

                    <div class="col-4">
                      <div class="input-group input-group-sm border rounded bg-white">
                        <span class="input-group-text bg-light border-0 px-1 text-muted fs-8">$</span>
                        <input 
                          v-model.number="pRow.amount" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          class="form-control border-0 fw-bold shadow-none text-end p-1 fs-7"
                          placeholder="0.00"
                        >
                      </div>
                    </div>

                    <div class="col-2 text-end">
                      <button 
                        @click="posStore.removePaymentRow(idx)" 
                        class="btn btn-outline-danger btn-sm w-100 p-0 border-0 fs-7" 
                        :disabled="posStore.payments.length <= 1"
                        title="Eliminar forma de pago"
                        style="height: 30px;"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center pt-1">
                  <button @click="posStore.addPaymentRow()" class="btn btn-outline-secondary btn-sm py-0 px-2 fs-8 fw-semibold">
                    <i class="bi bi-plus-circle me-1"></i> Añadir pago
                  </button>
                  
                  <span class="badge py-1 px-2 fs-8" :class="posStore.remainingPaymentAmount === 0 ? 'bg-success text-white' : 'bg-warning text-dark'">
                    Restante: ${{ posStore.remainingPaymentAmount.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Total y Botón de Confirmación en una sola fila compacta -->
            <div class="d-flex align-items-center justify-content-between gap-3 p-2 px-3 bg-white border rounded-2 shadow-sm">
              <div>
                <span class="text-secondary small fw-semibold text-uppercase d-block" style="font-size: 0.72rem; line-height: 1;">Total a Cobrar</span>
                <span class="fw-bold text-dark" style="font-size: 1.75rem; line-height: 1.1;">
                  ${{ posStore.cartTotal.toFixed(2) }}
                </span>
              </div>
              
              <button 
                @click="processSale" 
                class="btn btn-amazon-primary flex-grow-1 py-2 px-3 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill"
                style="font-size: 1.05rem; max-width: 320px;"
                :disabled="posStore.cart.length === 0 || posStore.processingSale"
              >
                <span v-if="posStore.processingSale" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-check2-circle fs-5"></i>
                <span>{{ posStore.processingSale ? 'Procesando...' : 'Confirmar Venta POS' }}</span>
              </button>
            </div>

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
.pos-screen-container {
  height: calc(100vh - 105px);
  max-height: calc(100vh - 105px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

@media (max-width: 991px) {
  .pos-screen-container {
    height: auto;
    max-height: none;
    overflow-y: auto;
  }
  .pos-main-row {
    flex-direction: column;
  }
  .pos-left-col,
  .pos-right-col {
    height: auto !important;
    overflow: visible !important;
  }
}

.fs-7 {
  font-size: 0.88rem;
}
.fs-8 {
  font-size: 0.76rem;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
