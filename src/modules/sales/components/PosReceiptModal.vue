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
  if (!props.saleData?.id) return 'TICK-0'
  return `TICK-${props.saleData.id}`
})

const triggerPrint = () => {
  const receiptEl = document.getElementById('printable-thermal-receipt')
  if (!receiptEl) {
    window.print()
    return
  }

  const is80 = paperWidth.value === '80mm'
  const printWidth = is80 ? '76mm' : '54mm'

  const printWin = window.open('', '_blank', 'width=450,height=650')
  if (!printWin) {
    window.print()
    return
  }

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ticket_${receiptCode.value}</title>
        <style>
          @page {
            margin: 0;
            size: auto;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 8px;
            background: #ffffff;
            color: #000000;
            font-family: 'Courier New', Courier, monospace;
            font-size: ${is80 ? '12px' : '10px'};
            line-height: 1.3;
          }
          .thermal-receipt-container {
            width: ${printWidth};
            margin: 0 auto;
            background: #ffffff;
          }
          .receipt-header .receipt-brand {
            font-family: 'Arial Black', sans-serif;
            font-size: 20px;
            margin: 0;
            text-align: center;
          }
          .receipt-header .receipt-subtitle {
            font-size: 9px;
            font-weight: bold;
            margin: 0;
            text-align: center;
          }
          .text-center { text-align: center; }
          .store-name { font-weight: bold; margin: 4px 0 0 0; text-transform: uppercase; text-align: center; }
          .store-address, .store-phone { margin: 0; font-size: 10px; text-align: center; }
          .divider-dashed { border-top: 1px dashed #000; margin: 6px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .payment-breakdown-list { margin-top: 3px; }
          .payment-item-row { display: flex; justify-content: space-between; align-items: flex-start; font-size: ${is80 ? '11px' : '10px'}; margin-bottom: 2px; gap: 6px; width: 100%; }
          .payment-name { word-break: break-word; overflow-wrap: anywhere; flex: 1; text-align: left; }
          .payment-price { font-weight: bold; white-space: nowrap; flex-shrink: 0; text-align: right; }
          .receipt-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          .receipt-table th { border-bottom: 1px solid #000; text-align: left; padding-bottom: 2px; }
          .receipt-table td { padding: 3px 0; vertical-align: top; }
          .col-qty { width: 12%; text-align: left; }
          .col-desc { width: 48%; text-align: left; word-break: break-word; }
          .col-price { width: 20%; text-align: right; }
          .col-total { width: 20%; text-align: right; }
          .receipt-totals .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .receipt-totals .main-total { font-size: 15px; font-weight: 900; margin-top: 4px; }
          .receipt-footer .thanks-msg { font-weight: bold; margin: 4px 0 2px 0; text-align: center; }
          .receipt-footer .policy-msg { font-size: 9px; margin: 0 0 2px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="thermal-receipt-container">
          ${receiptEl.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 300);
          }
        <\/script>
      </body>
    </html>
  `)
  printWin.document.close()
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="receipt-backdrop">
      <div class="receipt-dialog-card card p-4 bg-white position-relative">
        
        <!-- Header del Modal -->
        <div class="modal-header-bar d-flex align-items-center justify-content-between mb-3 border-bottom border-black border-2 pb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fs-2">🎉</span>
            <div>
              <h3 class="fw-black text-uppercase m-0 fs-5">¡VENTA COMPLETADA!</h3>
              <p class="m-0 text-muted fw-bold small">Comprobante POS generado correctamente</p>
            </div>
          </div>
          <button @click="handleClose" class="btn-close fs-5" aria-label="Cerrar"></button>
        </div>

        <!-- Selector de Ancho de Impresión (58mm vs 80mm) -->
        <div class="receipt-format-selector d-flex align-items-center justify-content-between bg-light border border-black border-2 p-2 mb-3">
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
        <div class="receipt-preview-wrapper mb-3">
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
              
              <!-- FORMA DE PAGO RESPONSIVE -->
              <div class="info-payment-section mt-1">
                <div class="info-row border-0 mb-1">
                  <span>Forma de Pago:</span>
                  <strong v-if="!saleData?.paymentMethodsList || saleData.paymentMethodsList.length <= 1" class="text-end">
                    {{ saleData?.paymentMethodName || 'Efectivo' }}
                  </strong>
                </div>
                <div v-if="saleData?.paymentMethodsList && saleData.paymentMethodsList.length > 1" class="payment-breakdown-list">
                  <div v-for="(pm, pIdx) in saleData.paymentMethodsList" :key="pIdx" class="payment-item-row">
                    <span class="payment-name">• {{ pm.name }}</span>
                    <span class="payment-price">S/ {{ Number(pm.amount).toFixed(2) }}</span>
                  </div>
                </div>
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
            </div>
          </div>
        </div>

        <!-- ACCIONES DEL MODAL -->
        <div class="receipt-actions d-flex flex-column flex-sm-row gap-2 mt-auto">
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
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.85) !important;
  z-index: 999999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 1rem !important;
}

.receipt-dialog-card {
  max-width: 480px !important;
  width: 100% !important;
  max-height: 90vh !important;
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border: 4px solid #000000 !important;
  box-shadow: 10px 10px 0px #000000 !important;
  z-index: 1000000 !important;
}

.receipt-preview-wrapper {
  overflow-y: auto !important;
  background: #f8f9fa !important;
  padding: 15px !important;
  border: 2px solid #000000 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  flex-grow: 1 !important;
  min-height: 220px !important;
  max-height: 52vh !important;
}

/* FORMATO TÉRMICO VISUAL */
.thermal-receipt-container {
  background: #ffffff !important;
  color: #000000 !important;
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
  padding: 12px !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
  border: 1px solid #cccccc !important;
  box-sizing: border-box !important;
}

.width-80mm {
  width: 280px !important;
}

.width-58mm {
  width: 210px !important;
  font-size: 10px !important;
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
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 2px;
  font-size: 11px;
  word-break: break-word;
}

.info-row span:first-child {
  flex-shrink: 0;
}

.info-row span:last-child,
.info-row strong:last-child {
  text-align: right;
  word-break: break-word;
  max-width: 100%;
}

.payment-breakdown-list {
  margin-top: 3px;
}

.payment-item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 11px;
  margin-bottom: 2px;
  gap: 6px;
  width: 100%;
}

.width-58mm .payment-item-row {
  font-size: 10px;
}

.payment-name {
  word-break: break-word;
  overflow-wrap: anywhere;
  flex: 1;
  text-align: left;
}

.payment-price {
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: right;
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
  /* Ocultar absolutamente todo en la página web */
  body * {
    visibility: hidden !important;
  }

  /* Desactivar fondos y bordes del modal */
  .receipt-backdrop,
  .receipt-dialog-card,
  .receipt-preview-wrapper {
    position: static !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: auto !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .btn,
  .btn-group,
  .btn-close,
  .modal-header-bar,
  .receipt-format-selector,
  .receipt-actions {
    display: none !important;
    visibility: hidden !important;
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
    padding: 5mm !important;
    border: none !important;
    box-shadow: none !important;
    background: #ffffff !important;
  }

  #printable-thermal-receipt.width-80mm {
    width: 80mm !important;
  }

  #printable-thermal-receipt.width-58mm {
    width: 58mm !important;
  }

  @page {
    margin: 0;
    size: auto;
  }
}
</style>
