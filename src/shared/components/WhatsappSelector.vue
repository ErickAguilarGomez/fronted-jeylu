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

const close = () => {
  showModal.value = false
}

const getWhatsAppUrl = (phone) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '')
  
  let text = ''
  if (targetProduct.value) {
    const defaultTemplate = "¡Hola JEILU Store! Quiero comprar el siguiente producto:\n\n*Producto:* {product_name}\n*SKU:* {product_sku}\n*Precio:* S/ {product_price}\n\n¿Tienen disponibilidad para envío inmediato?"
    
    text = defaultTemplate
      .replace('{product_name}', targetProduct.value.name || '')
      .replace('{product_sku}', targetProduct.value.sku || targetProduct.value.base_sku || '')
      .replace('{product_price}', targetProduct.value.price || '')
  } else if (targetMessage.value) {
    text = targetMessage.value
  } else {
    text = '¡Hola JEILU Store! Me gustaría hacer una consulta.'
  }
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

const startConversation = (numberObj) => {
  const url = getWhatsAppUrl(numberObj.phone)
  window.open(url, '_blank')
  close()
}

defineExpose({
  open
})
</script>

<template>
  <div v-if="showModal" class="modal-backdrop" style="background: rgba(0,0,0,0.85); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1060; display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div class="card border-3 border-black shadow-solid w-100" style="max-width: 450px;">
      <div class="card-header bg-black text-white p-4 border-bottom border-black border-3 d-flex justify-content-between align-items-center">
        <h3 class="m-0 fw-black text-uppercase fs-4 d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-whatsapp text-success" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.897 7.897 0 0 0-2.327-5.644zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.86c-.2-.1-1.185-.588-1.369-.653-.184-.066-.318-.1-.452.1-.134.2-.52.653-.637.786-.118.133-.235.148-.435.05-.2-.1-.843-.311-1.607-.99-.595-.53-1.002-1.185-1.119-1.386-.118-.2-.012-.307.088-.407.09-.09.2-.234.3-.35.1-.117.133-.198.2-.33.067-.133.034-.25-.017-.35-.05-.1-.452-1.09-.618-1.492-.161-.39-.327-.336-.452-.336-.118-.004-.254-.004-.39-.004-.137 0-.36.052-.55.258-.19.206-.723.708-.723 1.727 0 1.02.742 2.004.846 2.148.104.14 1.46 2.23 3.537 3.125.495.213.882.34 1.185.437.498.158.951.135 1.31.083.4-.058 1.185-.484 1.353-.95.168-.466.168-.867.118-.95-.05-.083-.184-.132-.383-.233z"/>
          </svg>
          CONTACTO POR WHATSAPP
        </h3>
        <button type="button" @click="close" class="btn btn-danger py-1 px-2 border-2 border-black text-white m-0 fs-5">X</button>
      </div>

      <div class="card-body p-4 bg-white">
        <p class="fw-bold text-muted mb-4 fs-6">
          {{ targetProduct ? 'Selecciona un canal para consultar sobre este producto:' : 'Selecciona el área con la que deseas comunicarte:' }}
        </p>

        <!-- Loading state -->
        <div v-if="whatsappStore.loading && whatsappStore.whatsappNumbers.length === 0" class="text-center py-4">
          <div class="spinner-border text-black border-4 mb-2" role="status"></div>
          <p class="fw-black text-uppercase small m-0">CARGANDO CONTACTOS...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="whatsappStore.whatsappNumbers.length === 0" class="text-center py-4 border-2 border-dashed border-black">
          <p class="fw-black text-uppercase m-0 fs-6 text-danger">No hay números activos disponibles</p>
        </div>

        <!-- Numbers List -->
        <div v-else class="d-flex flex-column gap-3">
          <button
            v-for="num in whatsappStore.whatsappNumbers"
            :key="num.id"
            @click="startConversation(num)"
            class="btn btn-outline-dark text-start border-3 border-black p-3 d-flex align-items-center justify-content-between transition shadow-solid-sm hover-translate"
          >
            <div>
              <div class="fw-black text-uppercase fs-5 mb-1">{{ num.alias || 'Contacto General' }}</div>
              <div class="font-monospace text-muted small fw-bold">{{ num.phone }}</div>
            </div>
            <span class="badge bg-success text-black border-2 border-black fw-black">🟢 EN LÍNEA</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 6px 6px 0px 0px #000000 !important;
}
.shadow-solid-sm {
  box-shadow: 4px 4px 0px 0px #000000 !important;
}
.hover-translate:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #000000 !important;
  background-color: #ffde59 !important;
  color: #000000 !important;
}
</style>
