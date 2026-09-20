<script setup>
import { ref, defineExpose, onMounted } from 'vue'
import { whatsappStore } from '@/modules/settings/stores/whatsappStore.js'

const showModal = ref(false)
const targetProduct = ref(null)
const targetMessage = ref(null)

const open = (product = null, customMessage = null) => {
  targetProduct.value = product
  targetMessage.value = customMessage
  
  whatsappStore.fetchActiveNumbers()
  showModal.value = true
}

const openModal = (customMessage = null) => {
  open(null, customMessage)
}

const close = () => {
  showModal.value = false
}

const getWhatsAppUrl = (phone) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '')
  
  let text = ''
  if (targetMessage.value) {
    text = targetMessage.value
  } else if (targetProduct.value) {
    const defaultTemplate = "¡Hola JEILU Store! Quiero comprar el siguiente producto:\n\n*Producto:* {product_name}\n*SKU:* {product_sku}\n*Precio:* $ {product_price}\n\n¿Tienen disponibilidad para envío inmediato?"
    
    text = defaultTemplate
      .replace('{product_name}', targetProduct.value.name || '')
      .replace('{product_sku}', targetProduct.value.sku || targetProduct.value.base_sku || '')
      .replace('{product_price}', targetProduct.value.price || '')
  } else {
    text = '¡Hola JEILU Store! Me gustaría hacer una consulta.'
  }
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

const startConversation = (numberObj) => {
  const url = getWhatsAppUrl(numberObj.phone_number || numberObj.phone)
  window.open(url, '_blank')
  close()
}

defineExpose({
  open,
  openModal
})
</script>

<template>
  <div v-if="showModal" class="modal-backdrop" style="background: rgba(15, 17, 17, 0.6); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1060; display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div class="card border-0 shadow-lg w-100 rounded-3 overflow-hidden" style="max-width: 460px;">
      
      <!-- Amazon Navy Header -->
      <div class="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center" style="background-color: var(--amazon-navy-light, #232f3e) !important;">
        <h6 class="m-0 fw-bold d-flex align-items-center gap-2 text-white">
          <i class="bi bi-whatsapp text-success fs-5"></i>
          Atención al Cliente JEILU
        </h6>
        <button type="button" @click="close" class="btn-close btn-close-white" aria-label="Cerrar"></button>
      </div>

      <div class="card-body p-4 bg-white">
        <p class="text-muted small mb-3">
          {{ targetProduct ? 'Selecciona un canal de WhatsApp para coordinar la compra de este producto:' : 'Selecciona el área o sucursal con la que deseas comunicarte:' }}
        </p>

        <!-- Loading state -->
        <div v-if="whatsappStore.loading && whatsappStore.whatsappNumbers.length === 0" class="text-center py-4">
          <div class="spinner-border text-warning mb-2" role="status"></div>
          <p class="small text-muted m-0">Cargando canales de atención...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="whatsappStore.whatsappNumbers.length === 0" class="text-center py-4 border rounded bg-light">
          <p class="m-0 small text-danger fw-semibold">No hay números activos disponibles en este momento</p>
        </div>

        <!-- Numbers List -->
        <div v-else class="d-flex flex-column gap-2">
          <button
            v-for="num in whatsappStore.whatsappNumbers"
            :key="num.id"
            @click="startConversation(num)"
            class="btn btn-light text-start p-3 d-flex align-items-center justify-content-between border rounded-2 amazon-wa-item"
          >
            <div>
              <div class="fw-bold text-dark fs-6">{{ num.alias || 'Asesor de Ventas' }}</div>
              <div class="small text-muted">{{ num.phone_number || num.phone }}</div>
            </div>
            <span class="badge bg-success text-white small px-2 py-1">
              <i class="bi bi-chat-fill me-1"></i> Chatear
            </span>
          </button>
        </div>
      </div>

      <div class="card-footer bg-light p-3 text-center border-top">
        <button @click="close" class="btn btn-sm btn-outline-secondary px-4">
          Cancelar
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.amazon-wa-item {
  transition: all 0.15s ease;
  border-color: #d5d9d9 !important;
}

.amazon-wa-item:hover {
  background-color: #f7fafa !important;
  border-color: #e77600 !important;
  box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.3);
}
</style>
