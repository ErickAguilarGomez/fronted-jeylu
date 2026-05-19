<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  whatsappNumber: {
    type: String,
    default: '51999999999' // Número de WhatsApp por defecto (Perú)
  }
})

const whatsappUrl = computed(() => {
  const text = `¡Hola JEILU Store! Quiero comprar el siguiente producto:\n\n*Producto:* ${props.product.name}\n*SKU:* ${props.product.sku}\n*Precio:* S/ ${Number(props.product.price).toFixed(2)}\n\n¿Tienen disponibilidad para envío inmediato?`
  return `https://wa.me/${props.whatsappNumber}?text=${encodeURIComponent(text)}`
})

const openWhatsApp = () => {
  window.open(whatsappUrl.value, '_blank')
}
</script>

<template>
  <div class="card brutalist-card d-flex flex-column h-100">
    <div class="img-container position-relative bg-secondary border-bottom border-black">
      <img 
        :src="product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'" 
        :alt="product.name" 
        class="product-img w-100 object-fit-cover"
      />
      <span class="badge bg-warning text-black position-absolute top-0 start-0 m-3 fs-6 border border-black shadow-sm">
        S/ {{ Number(product.price).toFixed(2) }}
      </span>
      <span v-if="!product.is_available" class="badge bg-danger text-white position-absolute bottom-0 start-0 m-3 fs-7 border border-black fw-black">
        ¡AGOTADO!
      </span>
      <span v-else class="badge bg-success text-black position-absolute bottom-0 start-0 m-3 fs-7 border border-black fw-black">
        DISPONIBLE
      </span>
    </div>

    <div class="card-body d-flex flex-column justify-content-between p-4 flex-grow-1">
      <div>
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span class="text-muted fw-bold fs-7 font-monospace">SKU: {{ product.sku }}</span>
          <span :class="['badge border border-black fs-8 fw-bold', product.is_available ? 'bg-warning text-black' : 'bg-danger text-white']">
            {{ product.is_available ? 'EN STOCK' : 'SIN STOCK' }}
          </span>
        </div>
        <h3 class="card-title fs-4 fw-black text-uppercase mb-3">{{ product.name }}</h3>
      </div>

      <div class="mt-4 pt-3 border-top border-black d-flex flex-column gap-2">
        <button 
          @click="openWhatsApp" 
          :class="['btn w-100 py-3 fs-5 fw-black d-flex justify-content-center align-items-center gap-2 border-2 border-black', product.is_available ? 'btn-primary' : 'btn-secondary text-muted']"
          :disabled="!product.is_available"
        >
          <svg v-if="product.is_available" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.23.148-.427.05-.197-.099-.835-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          {{ product.is_available ? 'COMPRAR AHORA' : 'AGOTADO' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brutalist-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.brutalist-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
.img-container {
  height: 280px;
  overflow: hidden;
}
.product-img {
  height: 100%;
  transition: transform 0.3s ease;
}
.brutalist-card:hover .product-img {
  transform: scale(1.05);
}
</style>
