<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/plugins/axios'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const props = defineProps({
  initialOrder: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update'])

const option = ref('none') // 'none', 'new', 'existing'

// New order form fields
const newOrder = ref({
  file: null,
  preview: null,
  isPdf: false,
  order_number: '',
  provider: '',
  purchase_date: '',
  total_amount: '',
  status: 'COMPLETADA',
  observations: ''
})

// Existing order fields
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const selectedOrder = ref(null)
const showDropdown = ref(false)
let searchTimeout = null

// Initialize from edit mode
onMounted(() => {
  if (props.initialOrder) {
    option.value = 'existing'
    selectedOrder.value = props.initialOrder
    
    // We also fill fields in case the user wants to update/edit this existing order
    newOrder.value = {
      file: null,
      preview: props.initialOrder.file_url,
      isPdf: props.initialOrder.file_url?.toLowerCase().endsWith('.pdf'),
      order_number: props.initialOrder.order_number || '',
      provider: props.initialOrder.provider || '',
      purchase_date: props.initialOrder.purchase_date || '',
      total_amount: props.initialOrder.total_amount || '',
      status: props.initialOrder.status || 'COMPLETADA',
      observations: props.initialOrder.observations || ''
    }
    
    notifyParent()
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    newOrder.value.file = file
    newOrder.value.isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    
    if (newOrder.value.isPdf) {
      newOrder.value.preview = null
    } else {
      newOrder.value.preview = URL.createObjectURL(file)
    }
    notifyParent()
  }
}

const searchOrders = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showDropdown.value = false
    return
  }
  
  searching.value = true
  showDropdown.value = true
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get('/purchase-orders', {
        params: { search: searchQuery.value.trim() }
      })
      if (res.data && res.data.success) {
        searchResults.value = res.data.data
      }
    } catch (e) {
      console.error('Error buscando órdenes de compra:', e)
    } finally {
      searching.value = false
    }
  }, 400)
}

const selectOrder = (order) => {
  selectedOrder.value = order
  searchQuery.value = ''
  showDropdown.value = false
  searchResults.value = []
  
  // Fill order edit fields as fallback
  newOrder.value = {
    file: null,
    preview: order.file_url,
    isPdf: order.file_url?.toLowerCase().endsWith('.pdf'),
    order_number: order.order_number || '',
    provider: order.provider || '',
    purchase_date: order.purchase_date || '',
    total_amount: order.total_amount || '',
    status: order.status || 'COMPLETADA',
    observations: order.observations || ''
  }
  
  notifyParent()
}

const clearSelection = () => {
  selectedOrder.value = null
  newOrder.value = {
    file: null,
    preview: null,
    isPdf: false,
    order_number: '',
    provider: '',
    purchase_date: '',
    total_amount: '',
    status: 'COMPLETADA',
    observations: ''
  }
  notifyParent()
}

const isImageFile = (url) => {
  if (!url) return false
  const cleanUrl = url.toLowerCase().split('?')[0]
  return cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.png') || cleanUrl.endsWith('.webp') || cleanUrl.endsWith('.gif')
}

// Watch option changes
watch(option, (newVal) => {
  if (newVal === 'none') {
    selectedOrder.value = null
  }
  notifyParent()
})

// Watch newOrder fields changes to notify parent
watch([
  () => newOrder.value.order_number,
  () => newOrder.value.provider,
  () => newOrder.value.purchase_date,
  () => newOrder.value.total_amount,
  () => newOrder.value.status,
  () => newOrder.value.observations
], () => {
  notifyParent()
})

function notifyParent() {
  emit('update', {
    option: option.value,
    purchase_order_id: selectedOrder.value ? selectedOrder.value.id : null,
    file: newOrder.value.file,
    order_number: newOrder.value.order_number,
    provider: newOrder.value.provider,
    purchase_date: newOrder.value.purchase_date,
    total_amount: newOrder.value.total_amount,
    status: newOrder.value.status,
    observations: newOrder.value.observations
  })
}
</script>

<template>
  <div class="purchase-order-section bg-white p-4 border border-black border-3 mb-4 shadow-solid-sm">
    <h5 class="fw-black text-uppercase border-bottom border-black pb-2 mb-3 d-flex align-items-center gap-2">
      <span>📄</span> 4. Orden de Compra asociada al Producto
    </h5>

    <!-- Opciones de selección -->
    <div class="row g-2 mb-4">
      <div class="col-md-4">
        <button 
          type="button"
          @click="option = 'none'" 
          :class="['btn w-100 py-3 fw-bold border-2 border-black rounded-0 text-uppercase transition-all', option === 'none' ? 'btn-black text-white shadow-solid-active' : 'btn-outline-dark bg-white']"
        >
          🚫 Sin Orden
        </button>
      </div>
      <div class="col-md-4">
        <button 
          type="button"
          @click="option = 'new'" 
          :class="['btn w-100 py-3 fw-bold border-2 border-black rounded-0 text-uppercase transition-all', option === 'new' ? 'btn-black text-white shadow-solid-active' : 'btn-outline-dark bg-white']"
        >
          ➕ Registrar Nueva
        </button>
      </div>
      <div class="col-md-4">
        <button 
          type="button"
          @click="option = 'existing'" 
          :class="['btn w-100 py-3 fw-bold border-2 border-black rounded-0 text-uppercase transition-all', option === 'existing' ? 'btn-black text-white shadow-solid-active' : 'btn-outline-dark bg-white']"
        >
          🔍 Buscar Existente
        </button>
      </div>
    </div>

    <!-- Opción 1: Sin Orden -->
    <div v-if="option === 'none'" class="p-3 bg-light border border-black border-2 border-dashed text-center">
      <p class="fw-bold text-muted m-0">El producto se registrará sin ninguna orden de compra vinculada.</p>
    </div>

    <!-- Opción 2: Registrar Nueva Orden -->
    <div v-if="option === 'new'" class="bg-light p-4 border border-black border-2">
      <div class="row g-3">
        <!-- Subir Archivo -->
        <div class="col-md-12">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Archivo de la Orden (PDF o Imagen) *</label>
          <div class="d-flex align-items-center gap-3">
            <input type="file" @change="handleFileChange" class="form-control border-black border-2 shadow-none fw-bold bg-white p-2" accept="image/*,application/pdf" required>
            
            <!-- Previsualización -->
            <div v-if="newOrder.preview && isImageFile(newOrder.preview)" class="border border-black border-2 bg-white p-1 flex-shrink-0" style="width: 70px; height: 70px;">
              <img :src="newOrder.preview" class="w-100 h-100 object-fit-cover">
            </div>
            <div v-else-if="newOrder.isPdf || (newOrder.preview && newOrder.preview.toLowerCase().includes('.pdf'))" class="border border-black border-2 bg-white d-flex align-items-center justify-content-center flex-shrink-0 text-danger fs-3" style="width: 70px; height: 70px;">
              📕
            </div>
          </div>
        </div>

        <!-- Campos de Información -->
        <div class="col-md-6">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Número de Orden</label>
          <input v-model="newOrder.order_number" type="text" class="form-control border-black border-2 fw-bold" placeholder="Ejem: OC-2026-001">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Proveedor</label>
          <input v-model="newOrder.provider" type="text" class="form-control border-black border-2 fw-bold" placeholder="Ejem: Distribuidora Textil Jeylu">
        </div>

        <div class="col-md-4">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Fecha de Compra</label>
          <input v-model="newOrder.purchase_date" type="date" class="form-control border-black border-2 fw-bold">
        </div>
        <div class="col-md-4">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Monto Total ($)</label>
          <input v-model="newOrder.total_amount" type="number" step="0.01" min="0" class="form-control border-black border-2 fw-bold" placeholder="0.00">
        </div>
        <div class="col-md-4">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Estado</label>
          <select v-model="newOrder.status" class="form-select border-black border-2 fw-bold bg-white">
            <option value="PENDIENTE">Pendiente</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div class="col-md-12">
          <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Observaciones</label>
          <textarea v-model="newOrder.observations" class="form-control border-black border-2 fw-bold" rows="2" placeholder="Notas sobre esta adquisición..."></textarea>
        </div>
      </div>
    </div>

    <!-- Opción 3: Utilizar Existente -->
    <div v-if="option === 'existing'" class="bg-light p-4 border border-black border-2">
      <!-- Buscador si no hay orden seleccionada -->
      <div v-if="!selectedOrder">
        <label class="form-label fw-bold text-uppercase fs-7 m-0 mb-1">Buscar Orden de Compra</label>
        <div class="position-relative">
          <input 
            v-model="searchQuery" 
            @input="searchOrders" 
            type="text" 
            class="form-control border-black border-2 fw-bold shadow-none p-3" 
            placeholder="Buscar por Nro. Orden, Proveedor, Producto..."
          >
          
          <!-- Dropdown de resultados -->
          <div v-if="showDropdown && (searchResults.length > 0 || searching)" class="position-absolute w-100 bg-white border border-black border-2 shadow-solid-sm mt-1 z-3" style="max-height: 250px; overflow-y: auto;">
            <div v-if="searching" class="p-3 text-center fw-bold text-muted bg-light">Buscando órdenes...</div>
            <div v-else v-for="order in searchResults" :key="order.id" @click="selectOrder(order)" class="dropdown-item p-3 border-bottom border-black d-flex align-items-center justify-content-between cursor-pointer transition-bg">
              <div class="d-flex align-items-center gap-3">
                <div v-if="isImageFile(order.file_url)" class="border border-black p-1 bg-white" style="width: 50px; height: 50px;">
                  <img :src="order.file_url" class="w-100 h-100 object-fit-cover">
                </div>
                <div v-else class="border border-black d-flex align-items-center justify-content-center bg-white text-danger fs-4" style="width: 50px; height: 50px;">
                  📕
                </div>
                <div>
                  <h6 class="fw-black text-uppercase m-0">{{ order.order_number || 'Orden sin número' }}</h6>
                  <small class="text-muted d-block">{{ order.provider || 'Proveedor no especificado' }}</small>
                </div>
              </div>
              <div class="text-end">
                <span class="badge bg-black text-white border border-black fw-bold">{{ order.products_count }} prod. vinculados</span>
                <small class="d-block text-success fw-bold mt-1" v-if="order.total_amount">$ {{ Number(order.total_amount).toFixed(2) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalle de la Orden seleccionada (O en edición/remplazo) -->
      <div v-else class="selected-order-container">
        <div class="d-flex flex-column flex-md-row gap-4 align-items-start border border-black border-2 p-3 bg-white mb-3">
          <!-- Document Preview/Thumbnail -->
          <div class="doc-preview border border-black border-2 p-2 bg-light text-center flex-shrink-0" style="width: 140px; min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div v-if="isImageFile(selectedOrder.file_url)" class="w-100 h-100">
              <img :src="selectedOrder.file_url" class="w-100 object-fit-contain mb-2" style="max-height: 110px;">
            </div>
            <div v-else class="fs-1 text-danger mb-2">📕</div>
            <a :href="selectedOrder.file_url" target="_blank" class="btn btn-dark btn-sm fw-black border border-black w-100 py-1 fs-8 text-uppercase">Ver documento</a>
          </div>

          <!-- Info Details -->
          <div class="flex-grow-1 overflow-hidden">
            <h4 class="fw-black text-uppercase text-danger mb-2">
              {{ selectedOrder.order_number || 'ORDEN SIN NÚMERO' }}
            </h4>
            <div class="row g-2 fs-7">
              <div class="col-sm-6">
                <span class="fw-bold text-muted text-uppercase d-block fs-8">Proveedor:</span>
                <span class="fw-bold text-black">{{ selectedOrder.provider || '—' }}</span>
              </div>
              <div class="col-sm-6">
                <span class="fw-bold text-muted text-uppercase d-block fs-8">Fecha de Compra:</span>
                <span class="fw-bold text-black">{{ selectedOrder.purchase_date || '—' }}</span>
              </div>
              <div class="col-sm-6">
                <span class="fw-bold text-muted text-uppercase d-block fs-8">Monto Total:</span>
                <span class="fw-black text-success" v-if="selectedOrder.total_amount">$ {{ Number(selectedOrder.total_amount).toFixed(2) }}</span>
                <span class="fw-bold text-black" v-else>—</span>
              </div>
              <div class="col-sm-6">
                <span class="fw-bold text-muted text-uppercase d-block fs-8">Productos asociados:</span>
                <span class="badge bg-black text-white border border-black fw-bold">{{ selectedOrder.products_count }} productos</span>
              </div>
            </div>
            <div class="mt-2" v-if="selectedOrder.observations">
              <span class="fw-bold text-muted text-uppercase d-block fs-8">Observaciones:</span>
              <p class="m-0 text-muted fst-italic">{{ selectedOrder.observations }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex flex-row flex-md-column gap-2 w-100 w-md-auto align-self-stretch justify-content-end justify-content-md-start">
            <button type="button" @click="clearSelection" class="btn btn-danger fw-black border border-black border-2 py-2 px-3 text-uppercase fs-7 m-0">
              Desvincular
            </button>
          </div>
        </div>

        <!-- Remplazar o actualizar archivo/detalles de la orden vinculada -->
        <div class="border border-black border-2 p-3 bg-white">
          <h6 class="fw-black text-uppercase border-bottom border-black pb-2 mb-3 fs-7">
            ⚙️ Editar o Remplazar documento de esta Orden
          </h6>
          <div class="row g-2 align-items-center">
            <div class="col-md-8">
              <label class="form-label fw-bold text-uppercase fs-8 m-0 mb-1">Remplazar Archivo (PDF/Imagen)</label>
              <input type="file" @change="handleFileChange" class="form-control border-black shadow-none fw-bold bg-white" accept="image/*,application/pdf">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold text-uppercase fs-8 m-0 mb-1">Actualizar Nro. Orden</label>
              <input v-model="newOrder.order_number" type="text" class="form-control border-black fw-bold">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-black {
  background-color: #000 !important;
  border-color: #000 !important;
}
.shadow-solid-sm {
  box-shadow: 6px 6px 0px #000 !important;
}
.shadow-solid-active {
  box-shadow: 4px 4px 0px #000 !important;
  transform: translate(2px, 2px);
}
.transition-bg {
  transition: background-color 0.15s ease;
}
.transition-bg:hover {
  background-color: #f8f9fa !important;
}
.border-dashed {
  border-style: dashed !important;
}
</style>
