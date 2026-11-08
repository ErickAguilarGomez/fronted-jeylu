<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import storeService from '../services/storeService.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issues with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const stores = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedStoreId = ref(null)

const map = ref(null)
const mapContainer = ref(null)
const markers = ref({})

const fetchStores = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await storeService.getPublicStores()
    if (res && res.success) {
      stores.value = res.stores || []
    } else {
      error.value = 'No se pudo cargar la información de las tiendas.'
    }
  } catch (err) {
    console.error('Error cargando tiendas públicas:', err)
    error.value = 'Ocurrió un error al consultar las tiendas. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

const filteredStores = computed(() => {
  if (!searchQuery.value.trim()) return stores.value
  const q = searchQuery.value.toLowerCase().trim()
  return stores.value.filter(s => 
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.address && s.address.toLowerCase().includes(q)) ||
    (s.phone && s.phone.toLowerCase().includes(q))
  )
})

const initMap = () => {
  if (!mapContainer.value) return

  const validStores = stores.value.filter(s => s.latitude && s.longitude)
  let center = [-12.046374, -77.042793] // Lima / Perú default
  let zoom = 12

  if (validStores.length > 0) {
    center = [parseFloat(validStores[0].latitude), parseFloat(validStores[0].longitude)]
    zoom = 15
    selectedStoreId.value = validStores[0].id
  }

  map.value = L.map(mapContainer.value).setView(center, zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value)

  markers.value = {}

  validStores.forEach(store => {
    const lat = parseFloat(store.latitude)
    const lng = parseFloat(store.longitude)

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

    const popupContent = `
      <div style="font-family: inherit; padding: 4px; min-width: 180px;">
        <h6 style="margin: 0 0 6px 0; font-weight: 700; color: #0f1111;">${store.name}</h6>
        <p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #565959;">
          <i class="bi bi-geo-alt-fill text-danger"></i> ${store.address}
        </p>
        ${store.phone ? `<p style="margin: 0 0 8px 0; font-size: 0.85rem; color: #565959;"><b>Teléfono:</b> ${store.phone}</p>` : ''}
        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; color: #0d6efd; text-decoration: underline; font-weight: 600;">
          Abrir en Google Maps &raquo;
        </a>
      </div>
    `

    const marker = L.marker([lat, lng])
      .addTo(map.value)
      .bindPopup(popupContent)

    markers.value[store.id] = marker
  })
}

const focusStore = (store) => {
  selectedStoreId.value = store.id
  if (!store.latitude || !store.longitude || !map.value) return

  const lat = parseFloat(store.latitude)
  const lng = parseFloat(store.longitude)

  map.value.setView([lat, lng], 17)

  const marker = markers.value[store.id]
  if (marker) {
    marker.openPopup()
  }
}

const getWhatsAppUrl = (phone, storeName) => {
  if (!phone) return '#'
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(`¡Hola JEILU! Me gustaría consultar información sobre la sucursal "${storeName}".`)
  return `https://wa.me/${cleanPhone}?text=${message}`
}

const getGoogleMapsUrl = (store) => {
  if (store.latitude && store.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || store.name)}`
}

onMounted(async () => {
  await fetchStores()
  if (stores.value.length > 0) {
    nextTick(() => {
      initMap()
    })
  }
})
</script>

<template>
  <div class="amazon-stores-page py-3">
    <div class="container-fluid px-3 px-lg-4">
      
      <!-- Breadcrumbs -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-muted text-decoration-none">Inicio</router-link>
          </li>
          <li class="breadcrumb-item active text-dark fw-bold" aria-current="page">
            Nuestras Tiendas
          </li>
        </ol>
      </nav>

      <!-- Page Header Card -->
      <div class="card bg-white p-4 border-0 shadow-sm mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <h2 class="h3 fw-bold text-dark m-0">Nuestras Tiendas y Sucursales</h2>
              <span class="badge bg-warning text-dark fw-bold px-2 py-1">
                {{ stores.length }} {{ stores.length === 1 ? 'Sucursal Activa' : 'Sucursales Activas' }}
              </span>
            </div>
            <p class="text-muted small m-0">
              Visítanos para probarte tus modelos favoritos, realizar retiros gratuitos de tus pedidos online o recibir atención personalizada.
            </p>
          </div>

          <!-- Feature Badges -->
          <div class="d-flex flex-wrap gap-2">
            <span class="badge bg-light text-dark border px-3 py-2 d-flex align-items-center gap-2">
              <i class="bi bi-box-seam text-primary"></i> Retiro en Tienda Gratis
            </span>
            <span class="badge bg-light text-dark border px-3 py-2 d-flex align-items-center gap-2">
              <i class="bi bi-patch-check-fill text-success"></i> Garantía Oficial JEILU
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card bg-white p-5 text-center shadow-sm border-0 my-4">
        <div class="spinner-border text-warning mx-auto" style="width: 3.5rem; height: 3.5rem;" role="status">
          <span class="visually-hidden">Cargando sucursales...</span>
        </div>
        <h5 class="mt-3 text-muted">Cargando sucursales de JEILU...</h5>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger shadow-sm my-4 p-4 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <i class="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
          <div>
            <h6 class="fw-bold m-0">Error al cargar tiendas</h6>
            <p class="small m-0 text-muted">{{ error }}</p>
          </div>
        </div>
        <button @click="fetchStores" class="btn btn-sm btn-outline-danger px-3">
          Reintentar
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="stores.length === 0" class="card bg-white p-5 text-center shadow-sm border-0 my-4">
        <i class="bi bi-shop fs-1 text-muted opacity-50 mb-3"></i>
        <h4 class="fw-bold text-dark">No hay sucursales registradas actualmente</h4>
        <p class="text-muted small">Pronto publicaremos nuestras nuevas tiendas físicas. Mientras tanto, puedes adquirir nuestros productos a través de la tienda online.</p>
        <div>
          <router-link to="/catalog" class="btn btn-amazon-primary px-4 py-2">
            Explorar Catálogo de Productos
          </router-link>
        </div>
      </div>

      <!-- Stores & Map Layout -->
      <div v-else class="row g-4">
        
        <!-- Left: Stores List & Filter -->
        <div class="col-lg-5 col-xl-4">
          <div class="card bg-white p-3 border-0 shadow-sm h-100 d-flex flex-column">
            
            <!-- Quick Filter Bar -->
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  class="form-control border-start-0 bg-light" 
                  placeholder="Buscar tienda por nombre o dirección..." 
                />
                <button 
                  v-if="searchQuery" 
                  @click="searchQuery = ''" 
                  class="btn btn-light border border-start-0" 
                  type="button"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>

            <!-- Stores Cards Container -->
            <div class="stores-list-container d-flex flex-column gap-3 overflow-y-auto pe-1" style="max-height: 560px;">
              <div 
                v-for="store in filteredStores" 
                :key="store.id"
                @click="focusStore(store)"
                :class="['store-item-card p-3 rounded border transition cursor-pointer', selectedStoreId === store.id ? 'active-store-card' : 'bg-white hover-light']"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                    <i class="bi bi-shop text-primary"></i>
                    {{ store.name }}
                  </h6>
                  <span v-if="store.latitude && store.longitude" class="badge bg-success small">
                    <i class="bi bi-geo-alt-fill me-1"></i> En Mapa
                  </span>
                </div>

                <p class="small text-muted mb-2 d-flex align-items-start gap-2">
                  <i class="bi bi-pin-map text-secondary mt-1"></i>
                  <span>{{ store.address }}</span>
                </p>

                <div v-if="store.phone" class="small text-muted mb-3 d-flex align-items-center gap-2">
                  <i class="bi bi-telephone text-secondary"></i>
                  <a :href="`tel:${store.phone}`" class="text-decoration-none text-dark fw-semibold">
                    {{ store.phone }}
                  </a>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex flex-wrap gap-2 pt-2 border-top">
                  <button 
                    type="button"
                    @click.stop="focusStore(store)"
                    class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  >
                    <i class="bi bi-compass"></i> Ver en mapa
                  </button>

                  <a 
                    :href="getGoogleMapsUrl(store)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    @click.stop
                    class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  >
                    <i class="bi bi-geo-alt"></i> Cómo llegar
                  </a>

                  <a 
                    v-if="store.phone"
                    :href="getWhatsAppUrl(store.phone, store.name)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    @click.stop
                    class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 ms-auto"
                  >
                    <i class="bi bi-whatsapp"></i> WhatsApp
                  </a>
                </div>

              </div>

              <!-- No filter match -->
              <div v-if="filteredStores.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-search fs-3 mb-2 d-block"></i>
                <p class="small m-0">No se encontraron tiendas con "{{ searchQuery }}".</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Right: Leaflet Interactive Map -->
        <div class="col-lg-7 col-xl-8">
          <div class="card bg-white p-3 border-0 shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-bold text-muted text-uppercase tracking-wider">
                <i class="bi bi-map me-1 text-warning"></i> Mapa Interactivo de Ubicación
              </span>
              <span class="small text-muted">
                Haz clic en los pines para ver detalles
              </span>
            </div>
            <div 
              ref="mapContainer" 
              class="rounded overflow-hidden border shadow-sm w-100" 
              style="height: 560px; min-height: 400px; z-index: 1;"
            ></div>
          </div>
        </div>

      </div>

      <!-- Bottom Help & Catalog Call to Action -->
      <div class="card bg-white border-0 shadow-sm p-4 mt-4 text-center">
        <div class="row align-items-center">
          <div class="col-md-8 text-md-start mb-3 mb-md-0">
            <h5 class="fw-bold text-dark mb-1">¿Deseas comprar en línea y retirar en tienda?</h5>
            <p class="text-muted small m-0">
              Agrega los productos a tu carrito y al finalizar la compra selecciona "Retiro en tienda". Te notificaremos tan pronto tu pedido esté listo para recoger.
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <router-link to="/catalog" class="btn btn-amazon-primary px-4 py-2 fw-semibold">
              <i class="bi bi-bag-check me-1"></i> Explorar Catálogo
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.amazon-stores-page {
  min-height: 80vh;
  background-color: var(--amazon-bg-light, #f8f9fa);
}

.store-item-card {
  border-color: #e3e6e6 !important;
  background-color: #ffffff;
}

.store-item-card:hover {
  border-color: #febd69 !important;
  background-color: #fafafa;
}

.active-store-card {
  border-left: 4px solid #f08804 !important;
  border-color: #febd69 !important;
  background-color: #fdfbf7 !important;
}

.cursor-pointer {
  cursor: pointer;
}

.transition {
  transition: all 0.2s ease-in-out;
}

.tracking-wider {
  letter-spacing: 0.5px;
}

.btn-amazon-primary {
  background-color: #ffd814;
  border-color: #fcd200;
  color: #0f1111;
}

.btn-amazon-primary:hover {
  background-color: #f7ca00;
  border-color: #f2c200;
  color: #0f1111;
}
</style>
