<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  saleData: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['close'])

const paperWidth = ref('80mm') // Options: '80mm' or '58mm'

const formattedDate = computed(() => {
  if (!props.saleData?.date) {
    return new Date().toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }
  return props.saleData.date
})

const receiptCode = computed(() => {
  if (!props.saleData?.id) return 'TICK-0000'
  return `TICK-${String(props.saleData.id).padStart(6, '0')}`
})

const triggerPrint = () => {
  window.print()
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="receipt-backdrop d-flex align-items-center justify-content-center p-3">
      <div class="receipt-dialog-card card border-black border-4 shadow-solid p-4 bg-white position-relative">
        
        <!-- Header del Modal -->
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-black border-2 pb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fs-2">🎉</span>
            <div>
              <h3 class="fw-black text-uppercase m-0">¡VENTA COMPLETADA!</h3>
              <p class="m-0 text-muted fw-bold small">Comprobante POS generado correctamente</p>
            </div>
          </div>
          <button @click="handleClose" class="btn-close fs-4" aria-label="Cerrar"></button>
        </div>

        <!-- Selector de Ancho de Impresión (58mm vs 80mm) -->
        <div class="d-flex align-items-center justify-content-between bg-light border border-black border-2 p-2 mb-3">
          <span class="fw-bold small text-uppercase">Formato Térmico:</span>
          <div class="btn-group btn-group-sm" role="group">
            <button 
              type="button" 
              class="btn btn-outline-dark fw-bold" 
              :class="{ active: paperWidth === '80mm' }"
              @click="paperWidth = '80mm'"
            >
              80 mm (Estándar)
            </button>
            <button 
              type="button" 
              class="btn btn-outline-dark fw-bold" 
              :class="{ active: paperWidth === '58mm' }"
              @click="paperWidth = '58mm'"
            >
              58 mm (Compacto)
            </button>
          </div>
        </div>

        <!-- VISTA PREVIA DEL TICKET (Sección Imprimible) -->
        <div class="receipt-preview-wrapper mb-4">
          <div 
            id="printable-thermal-receipt" 
            class="thermal-receipt-container"
            :class="`width-${paperWidth}`"
          >
            <!-- LOGO / CABECERA -->
            <div class="receipt-header text-center">
              <h2 class="receipt-brand">JEILU</h2>
              <p class="receipt-subtitle">PUNTO DE VENTA POS</p>
              <div class="divider-dashed"></div>
              <p class="store-name">{{ saleData?.storeName || 'TIENDA PRINCIPAL' }}</p>
              <p v-if="saleData?.storeAddress" class="store-address">{{ saleData.storeAddress }}</p>
              <p v-if="saleData?.storePhone" class="store-phone">Tel: {{ saleData.storePhone }}</p>
            </div>

            <div class="divider-dashed"></div>

            <!-- DATOS DEL COMPROBANTE -->
            <div class="receipt-info">
              <div class="info-row">
                <span>N° Ticket:</span>
                <strong>{{ receiptCode }}</strong>
              </div>
              <div class="info-row">
                <span>Fecha:</span>
                <span>{{ formattedDate }}</span>
              </div>
              <div class="info-row" v-if="saleData?.sellerName">
                <span>Atendido por:</span>
                <span>{{ saleData.sellerName }}</span>
              </div>
              <div class="info-row">
                <span>Cliente:</span>
                <span>{{ saleData?.customerName || 'Cliente General' }}</span>
              </div>
              <div class="info-row">
                <span>Forma de Pago:</span>
                <span>{{ saleData?.paymentMethodName || 'Efectivo' }}</span>
              </div>
            </div>

            <div class="divider-dashed"></div>

            <!-- DETALLE DE PRODUCTOS -->
            <table class="receipt-table">
              <thead>
                <tr>
                  <th class="col-qty">Cant</th>
                  <th class="col-desc">Producto</th>
                  <th class="col-price">P.U.</th>
                  <th class="col-total">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in saleData?.items || []" :key="idx">
                  <td class="col-qty">{{ item.quantity }}</td>
                  <td class="col-desc">{{ item.name }}</td>
                  <td class="col-price">{{ Number(item.price).toFixed(2) }}</td>
                  <td class="col-total">{{ (item.quantity * item.price).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="divider-dashed"></div>

            <!-- TOTALES -->
            <div class="receipt-totals">
              <div class="total-row main-total">
                <span>TOTAL:</span>
                <span>S/ {{ Number(saleData?.total || 0).toFixed(2) }}</span>
              </div>
            </div>

            <div class="divider-dashed"></div>

            <!-- PIE DE PÁGINA -->
            <div class="receipt-footer text-center">
              <p class="thanks-msg">¡GRACIAS POR TU COMPRA!</p>
              <p class="policy-msg">Conserve este ticket para cualquier cambio o reclamo.</p>
              <p class="sys-msg">Powered by JEILU POS</p>
            </div>
          </div>
        </div>

        <!-- ACCIONES DEL MODAL -->
        <div class="d-flex flex-column flex-sm-row gap-2 mt-auto">
          <button 
            @click="triggerPrint" 
            class="btn btn-primary flex-grow-1 py-3 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2"
          >
            <span class="fs-5">🖨️</span> IMPRIMIR TICKET
          </button>
          <button 
            @click="handleClose" 
            class="btn btn-dark py-3 px-4 fw-black text-uppercase"
          >
            NUEVA VENTA
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.receipt-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
}

.receipt-dialog-card {
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}

.receipt-preview-wrapper {
  overflow-y: auto;
  background: #e9ecef;
  padding: 15px;
  border: 2px solid #000;
  display: flex;
  justify-content: center;
  max-height: 50vh;
}

/* FORMATO TÉRMICO VISUAL */
.thermal-receipt-container {
  background: #ffffff;
  color: #000000;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.3;
  padding: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.width-80mm {
  width: 300px;
}

.width-58mm {
  width: 220px;
  font-size: 10px;
}

.receipt-header .receipt-brand {
  font-family: 'Archivo Black', 'Arial Black', sans-serif;
  font-size: 20px;
  margin: 0;
  letter-spacing: -1px;
}

.receipt-header .receipt-subtitle {
  font-size: 9px;
  font-weight: bold;
  margin: 0;
}

.store-name {
  font-weight: bold;
  margin: 4px 0 0 0;
  text-transform: uppercase;
}

.store-address, .store-phone {
  margin: 0;
  font-size: 10px;
}

.divider-dashed {
  border-top: 1px dashed #000;
  margin: 8px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  font-size: 11px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 4px;
}

.receipt-table th {
  border-bottom: 1px solid #000;
  text-align: left;
  font-size: 10px;
  padding-bottom: 2px;
}

.receipt-table td {
  padding: 3px 0;
  vertical-align: top;
  font-size: 11px;
}

.col-qty { width: 12%; text-align: left; }
.col-desc { width: 50%; text-align: left; word-break: break-word; }
.col-price { width: 18%; text-align: right; }
.col-total { width: 20%; text-align: right; }

.receipt-totals .total-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 2px;
}

.receipt-totals .main-total {
  font-size: 16px;
  font-weight: 900;
  margin-top: 4px;
}

.receipt-footer .thanks-msg {
  font-weight: bold;
  margin: 4px 0 2px 0;
}

.receipt-footer .policy-msg {
  font-size: 9px;
  margin: 0 0 2px 0;
}

.receipt-footer .sys-msg {
  font-size: 8px;
  margin: 0;
  color: #555;
}

/* REGLAS CSS PARA IMPRESIÓN DIRECTA CON window.print() */
@media print {
  /* Ocultar absolutamente todo en el DOM */
  body * {
    visibility: hidden !important;
  }

  /* Desactivar fondos, bordes y sombras del modal */
  .receipt-backdrop,
  .receipt-dialog-card,
  .receipt-preview-wrapper,
  .btn,
  .btn-group,
  .btn-close {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Mostrar ÚNICAMENTE la tirilla del ticket térmico */
  #printable-thermal-receipt,
  #printable-thermal-receipt * {
    visibility: visible !important;
  }

  #printable-thermal-receipt {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    margin: 0 !important;
    padding: 5px !important;
    border: none !important;
    box-shadow: none !important;
    background: #ffffff !important;
  }

  @page {
    margin: 0;
    size: auto;
  }
}
</style>
