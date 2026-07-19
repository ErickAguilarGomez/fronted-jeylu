<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  product: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'select'])
</script>

<template>
  <div v-if="show && product" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative" style="max-width: 750px;">
      <button @click="$emit('close')" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
      <div class="d-flex align-items-center gap-4 mb-4 border-bottom border-black pb-4">
        <img v-if="product.image_url" :src="product.image_url" class="border border-black border-2 object-fit-cover shadow-sm" style="width: 90px; height: 90px;">
        <div>
          <h2 class="display-6 fw-black text-uppercase m-0">{{ product.name }}</h2>
          <span class="badge bg-secondary text-black fs-6 font-monospace border border-black mt-1">SKU BASE: {{ product.sku }}</span>
        </div>
      </div>
      
      <h4 class="fw-black text-uppercase mb-4">SELECCIONAR VARIANTE DISPONIBLE</h4>
      <div class="row g-3 mb-4 max-vh-50 overflow-y-auto p-1">
        <div v-for="variant in product.variants" :key="variant.sku" class="col-md-6">
          <button 
            @click="$emit('select', variant)" 
            :class="['btn w-100 p-4 text-start border border-black border-3 d-flex justify-content-between align-items-center shadow-sm', variant.stock > 0 ? 'bg-white hover-highlight' : 'bg-secondary text-muted']"
            :disabled="variant.stock <= 0"
            style="transition: transform 0.1s, box-shadow 0.1s;"
          >
            <div>
              <div class="fw-black fs-5 text-uppercase">
                <span v-if="variant.size">TALLA: {{ variant.size }} </span>
                <span v-if="variant.color" :class="variant.size ? 'ms-2' : ''">COLOR: {{ variant.color }}</span>
                <span v-if="!variant.size && !variant.color">VARIANTE #{{ variant.id }}</span>
              </div>
              <div class="fs-7 font-monospace text-muted mt-1">{{ variant.sku }}</div>
            </div>
            <span :class="['badge border border-black fs-6 px-3 py-2', variant.stock > 0 ? 'bg-black text-white shadow-sm' : 'bg-danger text-white']">
              {{ variant.stock > 0 ? `STOCK: ${variant.stock}` : 'AGOTADO' }}
            </span>
          </button>
        </div>
      </div>
      
      <div class="d-flex justify-content-end mt-2">
        <button @click="$emit('close')" class="btn btn-secondary py-3 px-5 fw-black fs-5 border border-black shadow-sm">CANCELAR</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-highlight:hover {
  transform: translate(-3px, -3px);
  box-shadow: 4px 4px 0px #000 !important;
  background-color: #ffde59 !important;
}
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}
.modal-card {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
