<script setup>
import { ref, watch } from 'vue'
import { QrcodeStream } from 'vue3-qrcode-reader'
import { posStore } from '../stores/posStore.js'

const props = defineProps({
  loadingItem: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-product'])

const scanning = ref(true)
const searchQuery = ref('')
const showDropdown = ref(false)
const searching = ref(false)
const cameraError = ref('')
let searchTimeout = null

const onCameraError = (error) => {
  console.error('Error de cámara QR:', error)
  if (error.name === 'NotAllowedError') {
    cameraError.value = 'Permiso denegado para acceder a la cámara.'
  } else if (error.name === 'NotFoundError') {
    cameraError.value = 'No se encontró ningún dispositivo de cámara o lector conectado.'
  } else if (error.name === 'NotSupportedError') {
    cameraError.value = 'La cámara no es soportada en este navegador (requiere HTTPS).'
  } else {
    cameraError.value = `Error de cámara: ${error.message || error.name}`
  }
  scanning.value = false
}

const onDecode = (decodedString) => {
  if (!decodedString) return
  
  const sku = decodedString.trim()
  if (!sku) return
  
  scanning.value = false
  emit('add-product', sku)
  setTimeout(() => { scanning.value = true }, 2000)
}

const handleSearchInput = () => {
  if (!searchQuery.value.trim()) {
    posStore.searchResults = []
    showDropdown.value = false
    return
  }
  
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      const hasResults = await posStore.searchProductsApi(searchQuery.value.trim())
      showDropdown.value = hasResults
    } catch (e) {
      console.error('Error buscando productos:', e)
    } finally {
      searching.value = false
    }
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  posStore.searchResults = []
  showDropdown.value = false
}

const selectProductFromSearch = (product) => {
  showDropdown.value = false
  searchQuery.value = ''
  emit('add-product', product.sku)
}

const addManualSku = () => {
  if (!searchQuery.value.trim()) return
  emit('add-product', searchQuery.value.trim())
  searchQuery.value = ''
  showDropdown.value = false
}
</script>

<template>
  <div class="card h-100 flex-grow-1 border-2">
    <div class="card-header bg-black text-white p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center">
      <h2 class="m-0 text-uppercase fw-black fs-3">ESCANER POS</h2>
      <span v-if="!scanning" class="badge bg-warning text-black fs-6 border border-black shadow-sm">PAUSADO</span>
      <span v-else class="badge bg-success text-black fs-6 border border-black shadow-sm">ACTIVO</span>
    </div>
    
    <div class="card-body p-4 d-flex flex-column">
      
      <div class="scanner-wrapper border border-black border-4 mb-4 position-relative bg-secondary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center" style="min-height: 350px; overflow: hidden;">
        <div v-if="cameraError" class="text-center p-4">
          <span class="fs-1">📷</span>
          <h4 class="fw-black text-uppercase text-danger mt-3">{{ cameraError }}</h4>
          <p class="fw-bold text-muted mt-2">Puedes utilizar el buscador de productos o ingresar el SKU manualmente abajo.</p>
        </div>
        <QrcodeStream v-else-if="scanning" @decode="onDecode" @error="onCameraError" />
        <div v-else class="text-center p-4">
          <div class="spinner-border text-black mb-3" style="width: 3rem; height: 3rem; border-width: 0.3em;" role="status"></div>
          <h3 class="fw-black text-uppercase m-0">PROCESANDO CÓDIGO...</h3>
        </div>
      </div>
      
      <div class="position-relative w-100">
        <div class="input-group input-group-lg border border-black border-2 shadow-sm" style="box-shadow: 4px 4px 0px #000 !important;">
          <span class="input-group-text bg-secondary border-0 fw-black text-uppercase fs-6">BUSCAR PRODUCTO</span>
          <input v-model="searchQuery" @input="handleSearchInput" @keyup.enter="addManualSku" type="text" class="form-control border-0 fw-bold shadow-none fs-5 p-3" placeholder="Escribe nombre de producto o SKU...">
          <button v-if="searchQuery" @click="clearSearch" class="btn btn-dark border-0 fw-black px-4 m-0 shadow-none fs-5">X</button>
          <button v-else @click="addManualSku" class="btn btn-primary border-0 fw-black px-4 m-0 shadow-none fs-5" :disabled="loadingItem">AÑADIR</button>
        </div>

        <!-- Lista Desplegable de Resultados -->
        <div v-if="showDropdown" class="dropdown-menu show w-100 p-0 border border-black border-3 shadow-solid mt-2 bg-white position-absolute z-3" style="max-height: 350px; overflow-y: auto;">
          <div v-if="searching" class="p-4 text-center fw-bold fs-5 bg-light">BUSCANDO INVENTARIO...</div>
          <div v-else-if="posStore.searchResults.length === 0" class="p-4 text-center fw-bold fs-5 text-muted bg-light">NO SE ENCONTRARON COINCIDENCIAS</div>
          <div v-for="item in posStore.searchResults" :key="item.sku" @click="selectProductFromSearch(item)" class="dropdown-item p-3 border-bottom border-black d-flex align-items-center gap-3 cursor-pointer transition-bg">
            <img v-if="item.image_url" :src="item.image_url" class="border border-black border-2 object-fit-cover shadow-sm" style="width: 60px; height: 60px;">
            <div class="flex-grow-1 overflow-hidden">
              <div class="fw-black text-uppercase fs-5 text-truncate">{{ item.name }}</div>
              <div class="text-muted fs-6 font-monospace">SKU: {{ item.sku }}</div>
            </div>
            <div class="text-end ms-3">
              <div class="fw-black fs-4">$ {{ Number(item.price).toFixed(2) }}</div>
              <span :class="['badge border border-black fs-7 fw-bold', item.total_stock > 0 ? 'bg-warning text-black' : 'bg-danger text-white']">
                STOCK: {{ item.total_stock }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner-wrapper video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
.cursor-pointer {
  cursor: pointer;
}
.transition-bg {
  transition: background-color 0.15s ease;
}
.transition-bg:hover {
  background-color: #f8f9fa !important;
}
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
</style>
