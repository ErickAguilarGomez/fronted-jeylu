<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseModal from '@/shared/components/BaseModal.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issues with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  storeData: {
    type: Object,
    default: () => ({ name: '', address: '', phone: '', latitude: null, longitude: null })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const localForm = ref({
  name: '',
  address: '',
  phone: '',
  latitude: null,
  longitude: null
})

const editMap = ref(null)
const editMapContainer = ref(null)
const editMarker = ref(null)
const suggestions = ref([])
const showSuggestions = ref(false)
let debounceTimer = null

watch(() => props.show, (newShow) => {
  if (newShow) {
    localForm.value = { ...props.storeData }
    initEditMap()
  }
})

const initEditMap = () => {
  nextTick(() => {
    if (!editMapContainer.value) return

    if (editMap.value) {
      editMap.value.remove()
      editMap.value = null
      editMarker.value = null
    }

    let center = [-12.046374, -77.042793] // Default to Lima, Peru
    let zoomLevel = 14
    if (localForm.value.latitude && localForm.value.longitude) {
      center = [parseFloat(localForm.value.latitude), parseFloat(localForm.value.longitude)]
      zoomLevel = 18
    }

    editMap.value = L.map(editMapContainer.value).setView(center, zoomLevel)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(editMap.value)

    editMarker.value = L.marker(center, {
      draggable: true
    }).addTo(editMap.value)

    editMarker.value.on('dragend', () => {
      const position = editMarker.value.getLatLng()
      localForm.value.latitude = parseFloat(position.lat.toFixed(8))
      localForm.value.longitude = parseFloat(position.lng.toFixed(8))
    })

    editMap.value.on('click', (e) => {
      const { lat, lng } = e.latlng
      editMarker.value.setLatLng(e.latlng)
      localForm.value.latitude = parseFloat(lat.toFixed(8))
      localForm.value.longitude = parseFloat(lng.toFixed(8))
    })
  })
}

const updateMarkerFromInputs = () => {
  if (localForm.value.latitude && localForm.value.longitude && editMarker.value && editMap.value) {
    const lat = parseFloat(localForm.value.latitude)
    const lng = parseFloat(localForm.value.longitude)
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const newLatLng = new L.LatLng(lat, lng)
      editMarker.value.setLatLng(newLatLng)
      editMap.value.setView(newLatLng, editMap.value.getZoom())
    }
  }
}

const handleAddressInput = () => {
  if (!localForm.value.address || localForm.value.address.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  if (debounceTimer) clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localForm.value.address)}&limit=5`, {
        headers: {
          'Accept-Language': 'es'
        }
      })
      if (res.ok) {
        const data = await res.json()
        suggestions.value = data
        showSuggestions.value = data.length > 0
      }
    } catch (e) {
      console.error('Error fetching suggestions:', e)
    }
  }, 500)
}

const selectSuggestion = (item) => {
  localForm.value.address = item.display_name
  localForm.value.latitude = parseFloat(parseFloat(item.lat).toFixed(8))
  localForm.value.longitude = parseFloat(parseFloat(item.lon).toFixed(8))
  
  if (editMarker.value && editMap.value) {
    const newLatLng = new L.LatLng(localForm.value.latitude, localForm.value.longitude)
    editMarker.value.setLatLng(newLatLng)
    editMap.value.setView(newLatLng, 18)
  }
  
  suggestions.value = []
  showSuggestions.value = false
}

const closeSuggestionsWithDelay = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleSubmit = () => {
  emit('submit', { ...localForm.value })
}
</script>

<template>
  <BaseModal :show="show" :title="isEditing ? 'Editar Tienda' : 'Nueva Tienda'" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Nombre de la Sucursal</label>
        <input v-model="localForm.name" type="text" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="EJ. SUCURSAL MIRAFLORES" required />
      </div>
      <div class="position-relative">
        <label class="form-label fw-black text-uppercase fs-5">Dirección Física</label>
        <input 
          v-model="localForm.address" 
          @input="handleAddressInput" 
          @focus="showSuggestions = suggestions.length > 0"
          @blur="closeSuggestionsWithDelay"
          type="text" 
          class="form-control border-black border-3 p-3 fs-5 fw-bold" 
          placeholder="Av. Larco 123" 
          required 
          autocomplete="off"
        />
        <!-- Suggestion Dropdown styled Brutalist -->
        <div 
          v-if="showSuggestions && suggestions.length > 0" 
          class="suggestions-dropdown border border-black border-3 bg-white position-absolute w-100 z-3"
          style="top: 100%; left: 0; max-height: 200px; overflow-y: auto; margin-top: 5px; box-shadow: 4px 4px 0px #000;"
        >
          <div 
            v-for="item in suggestions" 
            :key="item.place_id"
            @click="selectSuggestion(item)"
            class="suggestion-item p-3 border-bottom border-black text-black cursor-pointer fw-bold small text-uppercase"
          >
            {{ item.display_name }}
          </div>
        </div>
      </div>
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Teléfono (Opcional)</label>
        <input v-model="localForm.phone" type="text" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="+51 999 999 999" />
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <label class="form-label fw-black text-uppercase fs-5">Latitud</label>
          <input v-model.number="localForm.latitude" type="number" step="0.00000001" min="-90" max="90" @input="updateMarkerFromInputs" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="-12.046374" />
        </div>
        <div class="col-md-6">
          <label class="form-label fw-black text-uppercase fs-5">Longitud</label>
          <input v-model.number="localForm.longitude" type="number" step="0.00000001" min="-180" max="180" @input="updateMarkerFromInputs" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="-77.042793" />
        </div>
      </div>
      
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Ubicación en el Mapa</label>
        <div ref="editMapContainer" class="border border-black border-3 shadow-solid" style="height: 250px; z-index: 1;"></div>
        <p class="small text-muted mt-2">Arrastra el pin o haz clic en el mapa para ubicar la tienda con precisión.</p>
      </div>

      <div class="d-flex justify-content-end gap-3 mt-3">
        <BaseButton type="button" variant="secondary" @click="emit('close')" class="py-3 px-4 fs-5">CANCELAR</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="loading" class="py-3 px-5 fs-5">
          {{ loading ? 'GUARDANDO...' : 'GUARDAR SUCURSAL' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.suggestion-item {
  cursor: pointer;
  transition: background-color 0.2s;
}
.suggestion-item:hover {
  background-color: #FAFFA0 !important;
}
.suggestions-dropdown::-webkit-scrollbar {
  width: 8px;
}
.suggestions-dropdown::-webkit-scrollbar-track {
  background: #FFFFFF;
  border-left: 2px solid #000000;
}
.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: #000000;
  border-left: 2px solid #000000;
}
.shadow-solid {
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
</style>
