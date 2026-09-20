<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { posStore } from '../stores/posStore.js'

const props = defineProps({
  loadingItem: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-product'])

const scanning = ref(true)
const showCamera = ref(true)
const searchQuery = ref('')
const showDropdown = ref(false)
const searching = ref(false)
const cameraError = ref('')
let searchTimeout = null
let html5QrcodeScanner = null

const onCameraError = (error) => {
  console.error('Error de cámara:', error)
  if (error.name === 'NotAllowedError') {
    cameraError.value = 'Permiso denegado para la cámara. Usa el buscador o lector USB.'
  } else if (error.name === 'NotFoundError') {
    cameraError.value = 'No se detectó cámara conectada.'
  } else if (error.name === 'NotSupportedError') {
    cameraError.value = 'La cámara requiere entorno HTTPS seguro.'
  } else {
    cameraError.value = `Cámara: ${error.message || error.name || 'No disponible'}`
  }
  scanning.value = false
}

const onDecode = (decodedString) => {
  if (!decodedString || !scanning.value) return
  
  const sku = decodedString.trim()
  if (!sku) return
  
  scanning.value = false
  emit('add-product', sku)
  setTimeout(() => { scanning.value = true }, 1800)
}

const startScanner = async () => {
  try {
    const devices = await Html5Qrcode.getCameras()
    if (!devices || devices.length === 0) {
      cameraError.value = 'No se detectaron cámaras conectadas.'
      return
    }

    html5QrcodeScanner = new Html5Qrcode("pos-barcode-reader", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.ITF
      ],
      verbose: false
    })

    const config = {
      fps: 25,
      aspectRatio: 1.6,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    }

    await html5QrcodeScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        onDecode(decodedText)
      },
      () => {}
    )
    cameraError.value = ''
  } catch (err) {
    onCameraError(err)
  }
}

const toggleCamera = () => {
  showCamera.value = !showCamera.value
  if (showCamera.value && (!html5QrcodeScanner || !html5QrcodeScanner.isScanning)) {
    startScanner()
  } else if (!showCamera.value && html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    html5QrcodeScanner.stop().catch(console.error)
  }
}

onMounted(() => {
  startScanner()
})

onUnmounted(() => {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    html5QrcodeScanner.stop().catch(console.error)
  }
})

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
  }, 250)
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
  <div class="card bg-white border shadow-sm rounded-3 h-100 d-flex flex-column">
    
    <!-- Top Header: Title & Camera Toggle -->
    <div class="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-upc-scan fs-5 text-dark"></i>
        <h6 class="fw-bold m-0 text-dark">Búsqueda y Escáner POS</h6>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Toggle Camera Button -->
        <button 
          @click="toggleCamera" 
          type="button" 
          class="btn btn-sm btn-outline-secondary py-1 px-2 d-flex align-items-center gap-1 fs-8"
        >
          <i :class="showCamera ? 'bi bi-camera-video-off' : 'bi bi-camera-video'"></i>
          <span>{{ showCamera ? 'Ocultar cámara' : 'Usar cámara' }}</span>
        </button>

        <span v-if="scanning && showCamera" class="badge bg-success text-white fs-8">
          <i class="bi bi-dot"></i> Activo
        </span>
      </div>
    </div>
    
    <div class="card-body p-3 d-flex flex-column gap-3">
      
      <!-- 1. Búsqueda Rápida de Productos (Top priority for cashiers) -->
      <div class="position-relative w-100">
        <div class="input-group shadow-sm border rounded-2 overflow-hidden">
          <span class="input-group-text bg-light border-0 text-muted px-3">
            <i class="bi bi-search"></i>
          </span>
          <input 
            v-model="searchQuery" 
            @input="handleSearchInput" 
            @keyup.enter="addManualSku" 
            type="text" 
            class="form-control border-0 py-2 fs-6 shadow-none" 
            placeholder="Escanear código de barra, SKU o buscar por nombre..."
            autofocus
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="btn btn-light border-0 text-muted px-3" 
            type="button"
          >
            ✕
          </button>
          <button 
            v-else 
            @click="addManualSku" 
            class="btn btn-amazon-primary border-0 px-3 fw-semibold fs-7" 
            type="button"
            :disabled="loadingItem"
          >
            Añadir
          </button>
        </div>

        <!-- Dropdown de Resultados de Búsqueda -->
        <div 
          v-if="showDropdown" 
          class="dropdown-menu show w-100 p-0 border shadow-lg mt-1 bg-white position-absolute z-3 rounded-2" 
          style="max-height: 280px; overflow-y: auto;"
        >
          <div v-if="searching" class="p-3 text-center text-muted small">
            <div class="spinner-border spinner-border-sm text-warning me-1" role="status"></div>
            Buscando en inventario...
          </div>
          <div v-else-if="posStore.searchResults.length === 0" class="p-3 text-center text-muted small">
            No se encontraron productos con ese SKU o nombre.
          </div>
          <div 
            v-for="item in posStore.searchResults" 
            :key="item.sku" 
            @click="selectProductFromSearch(item)" 
            class="dropdown-item p-2 border-bottom d-flex align-items-center gap-2 cursor-pointer search-item-row"
          >
            <img 
              v-if="item.image_url" 
              :src="item.image_url" 
              class="rounded border object-fit-cover flex-shrink-0" 
              style="width: 44px; height: 44px;"
            />
            <div class="flex-grow-1 overflow-hidden">
              <div class="fw-semibold text-dark text-truncate fs-7">{{ item.name }}</div>
              <div class="text-muted fs-8 font-monospace">SKU: {{ item.sku }}</div>
            </div>
            <div class="text-end ms-2 flex-shrink-0">
              <div class="fw-bold text-dark fs-7">$ {{ Number(item.price).toFixed(2) }}</div>
              <span :class="['badge fs-8 py-0 px-1', item.total_stock > 0 ? 'bg-success text-white' : 'bg-danger text-white']">
                Stock: {{ item.total_stock }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Cámara Escáner Compacta (Reducida en tamaño) -->
      <div v-show="showCamera" class="camera-container rounded border bg-dark overflow-hidden position-relative mx-auto w-100">
        <!-- Error / No camera message -->
        <div v-if="cameraError" class="d-flex flex-column align-items-center justify-content-center h-100 p-3 text-center text-light">
          <i class="bi bi-camera-video-off fs-4 text-warning mb-1"></i>
          <span class="fs-8 text-white-50">{{ cameraError }}</span>
          <span class="fs-8 text-warning mt-1">Puedes escanear con pistola lectora USB o escribir arriba.</span>
        </div>

        <!-- Video Reader Element (Compact 160px height) -->
        <div id="pos-barcode-reader" class="compact-barcode-reader"></div>

        <!-- Laser Scan Overlay Target Line -->
        <div v-if="!cameraError" class="laser-scanner-line"></div>
      </div>

      <!-- 3. Instrucción o Atajo Rápido -->
      <div class="d-flex align-items-center justify-content-between p-2 rounded bg-light border text-muted fs-8">
        <span class="d-flex align-items-center gap-1">
          <i class="bi bi-keyboard text-secondary"></i>
          <span>Lector de código de barras USB listo</span>
        </span>
        <span class="text-dark fw-semibold">Presiona Enter tras el SKU</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.camera-container {
  height: 160px;
  max-height: 160px;
  background-color: #111111;
  position: relative;
}

.compact-barcode-reader {
  width: 100% !important;
  height: 100% !important;
}

:deep(#pos-barcode-reader video) {
  width: 100% !important;
  height: 160px !important;
  object-fit: cover !important;
}

:deep(#pos-barcode-reader__scan_region) {
  width: 100% !important;
  height: 160px !important;
  background: transparent !important;
}

:deep(#pos-barcode-reader__scan_region img),
:deep(#pos-barcode-reader__dashboard),
:deep(#pos-barcode-reader__scan_region div[style*="border"]) {
  display: none !important;
}

.laser-scanner-line {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #ff3b30;
  box-shadow: 0 0 6px 1px #ff3b30;
  opacity: 0.8;
  pointer-events: none;
}

.search-item-row:hover {
  background-color: #f0f7ff !important;
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
