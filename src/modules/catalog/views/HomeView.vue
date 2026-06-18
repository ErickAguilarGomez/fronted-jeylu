<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/plugins/axios'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'
import { settingsStore } from '@/modules/settings/stores/settingsStore.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issues with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const banners = ref([])
const activeBannerIndex = ref(0)
const autoplayTimer = ref(null)

const bestSellers = ref([])
const stores = ref([])
const loadingBestSellers = ref(true)
const loadingStores = ref(true)
const errorBestSellers = ref(null)
const errorStores = ref(null)

const map = ref(null)
const mapContainer = ref(null)
const markers = ref({})

const fetchBanners = async () => {
  try {
    const res = await api.get('/banners/active')
    if (res.data && res.data.success) {
      banners.value = res.data.banners
      if (banners.value.length > 0) {
        startAutoplay()
      }
    }
  } catch (err) {
    console.error('Error fetching active banners:', err)
  }
}

const startAutoplay = () => {
  stopAutoplay()
  if (banners.value.length <= 1) return
  autoplayTimer.value = setInterval(() => {
    nextBanner()
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

const nextBanner = () => {
  if (banners.value.length === 0) return
  activeBannerIndex.value = (activeBannerIndex.value + 1) % banners.value.length
}

const prevBanner = () => {
  if (banners.value.length === 0) return
  activeBannerIndex.value = (activeBannerIndex.value - 1 + banners.value.length) % banners.value.length
}

const setBanner = (index) => {
  activeBannerIndex.value = index
  startAutoplay()
}

const handleMouseEnter = () => {
  stopAutoplay()
}

const handleMouseLeave = () => {
  startAutoplay()
}

const fetchBestSellers = async () => {
  loadingBestSellers.value = true
  errorBestSellers.value = null
  try {
    const res = await api.get('/products/best-sellers')
    if (res.data && res.data.success) {
      bestSellers.value = res.data.data
    }
  } catch (err) {
    errorBestSellers.value = 'No se pudieron cargar los productos más vendidos.'
  } finally {
    loadingBestSellers.value = false
  }
}

const fetchStores = async () => {
  loadingStores.value = true
  errorStores.value = null
  try {
    const res = await api.get('/stores/public')
    if (res.data && res.data.success) {
      stores.value = res.data.stores
    }
  } catch (err) {
    errorStores.value = 'No se pudo cargar la lista de tiendas.'
  } finally {
    loadingStores.value = false
  }
}

const initMap = () => {
  if (!mapContainer.value) return

  const validStores = stores.value.filter(s => s.latitude && s.longitude)
  let center = [-12.046374, -77.042793] // Default to Lima, Peru
  
  if (validStores.length > 0) {
    center = [parseFloat(validStores[0].latitude), parseFloat(validStores[0].longitude)]
    map.value = L.map(mapContainer.value).setView(center, 18)
  } else {
    map.value = L.map(mapContainer.value).setView(center, 12)
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value)

  validStores.forEach(store => {
    const lat = parseFloat(store.latitude)
    const lng = parseFloat(store.longitude)
    
    const popupContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 5px;">
        <h5 style="margin: 0 0 5px 0; font-weight: 900; text-transform: uppercase; font-family: 'Archivo Black', sans-serif;">${store.name}</h5>
        <p style="margin: 0 0 5px 0; font-size: 0.9rem;"><b>Dirección:</b> ${store.address}</p>
        ${store.phone ? `<p style="margin: 0; font-size: 0.9rem;"><b>Teléfono:</b> ${store.phone}</p>` : ''}
      </div>
    `
    
    const marker = L.marker([lat, lng])
      .addTo(map.value)
      .bindPopup(popupContent)
      
    markers.value[store.id] = marker
  })
}

const focusStore = (store) => {
  if (!store.latitude || !store.longitude || !map.value) return
  
  const lat = parseFloat(store.latitude)
  const lng = parseFloat(store.longitude)
  
  map.value.setView([lat, lng], 18)
  
  const marker = markers.value[store.id]
  if (marker) {
    marker.openPopup()
  }
}

onMounted(async () => {
  settingsStore.fetchSettings()
  await fetchBanners()
  await fetchBestSellers()
  await fetchStores()
  
  if (stores.value.length > 0) {
    nextTick(() => {
      initMap()
    })
  }
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <div class="container py-4">

    <!-- Banner Slider (Brutalist style) -->
    <div 
      v-if="banners.length > 0" 
      class="banner-slider-container mb-5"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="banner-slider-wrapper position-relative">
        <div class="banner-slides overflow-hidden position-relative">
          <div 
            v-for="(banner, index) in banners" 
            :key="banner.id"
            class="banner-slide"
            :class="{ active: index === activeBannerIndex }"
          >
            <img 
              :src="banner.image_url" 
              alt="Banner Publicitario" 
              class="banner-image"
            />
          </div>
        </div>

        <!-- Controls (only if length > 1) -->
        <template v-if="banners.length > 1">
          <button 
            @click="prevBanner" 
            class="slider-control-btn prev-btn"
            aria-label="Anterior"
          >
            &lt;
          </button>
          <button 
            @click="nextBanner" 
            class="slider-control-btn next-btn"
            aria-label="Siguiente"
          >
            &gt;
          </button>

          <!-- Indicators -->
          <div class="slider-indicators">
            <span 
              v-for="(banner, index) in banners" 
              :key="'ind-' + banner.id"
              class="slider-indicator-dot"
              :class="{ active: index === activeBannerIndex }"
              @click="setBanner(index)"
            ></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Best Sellers Section -->
    <div class="mb-5">
      <div class="border-bottom border-black pb-3 mb-4 d-flex justify-content-between align-items-center">
        <h2 class="display-5 m-0 fw-black text-uppercase">Productos Más Vendidos</h2>
      </div>

      <div v-if="loadingBestSellers" class="text-center py-5">
        <div class="spinner-border text-black" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else-if="errorBestSellers" class="alert bg-danger text-white border-black border-2">
        {{ errorBestSellers }}
      </div>

      <div v-else-if="bestSellers.length === 0" class="text-center py-5 border border-black border-2 bg-light">
        <h3 class="fw-black text-muted text-uppercase m-0">No hay productos en esta sección</h3>
      </div>

      <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
        <div class="col" v-for="product in bestSellers" :key="product.sku">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>

    <!-- Stores Section -->
    <div class="mb-5">
      <div class="border-bottom border-black pb-3 mb-4">
        <h2 class="display-5 m-0 fw-black text-uppercase">Nuestras Tiendas</h2>
      </div>

      <div v-if="loadingStores" class="text-center py-5">
        <div class="spinner-border text-black" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else-if="errorStores" class="alert bg-danger text-white border-black border-2">
        {{ errorStores }}
      </div>

      <div v-else-if="stores.length === 0" class="text-center py-5 border border-black border-2 bg-light">
        <h3 class="fw-black text-muted text-uppercase m-0">No hay tiendas registradas</h3>
      </div>

      <div v-else class="row g-4">
        <!-- Stores List -->
        <div class="col-lg-4">
          <div class="stores-list-container d-flex flex-column gap-3" style="max-height: 450px; overflow-y: auto;">
            <div 
              v-for="store in stores" 
              :key="store.id"
              @click="focusStore(store)"
              class="store-item-card border border-black border-2 p-3 bg-white cursor-pointer transition"
              :class="{ 'has-coords': store.latitude && store.longitude }"
            >
              <h4 class="m-0 fw-black text-uppercase text-truncate">{{ store.name }}</h4>
              <p class="m-0 mt-2 small text-muted">
                {{ store.address }}
              </p>
              <p v-if="store.phone" class="m-0 mt-1 small text-muted">
                {{ store.phone }}
              </p>
              <div v-if="store.latitude && store.longitude" class="mt-2">
                <span class="badge bg-success text-black border-black border-1 p-1 px-2">Ver en Mapa &raquo;</span>
              </div>
              <div v-else class="mt-2 text-muted small italic">
                Sin coordenadas de ubicación
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Map -->
        <div class="col-lg-8">
          <div 
            ref="mapContainer" 
            class="store-map-wrapper border border-black border-2 shadow-solid" 
            style="height: 450px; z-index: 1;"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-slider-container {
  border: 3px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  background-color: #000000;
  position: relative;
}

.banner-slider-wrapper {
  width: 100%;
}

.banner-slides {
  width: 100%;
  height: 450px;
}

@media (max-width: 991.98px) {
  .banner-slides {
    height: 350px;
  }
}

@media (max-width: 575.98px) {
  .banner-slides {
    height: 220px;
  }
}

.banner-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
  z-index: 1;
}

.banner-slide.active {
  opacity: 1;
  visibility: visible;
  z-index: 2;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Controls */
.slider-control-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #FFFFFF;
  border: 2px solid #000000;
  color: #000000;
  font-family: 'Archivo Black', 'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.15s ease-in-out;
}

.slider-control-btn:hover {
  background-color: #FAFFA0; /* Yellow */
  transform: translateY(-50%) translate(-2px, -2px);
  box-shadow: 3px 3px 0px #000000;
}

.slider-control-btn:active {
  transform: translateY(-50%) translate(0, 0);
  box-shadow: none;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

/* Indicators */
.slider-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.slider-indicator-dot {
  width: 12px;
  height: 12px;
  background-color: #FFFFFF;
  border: 2px solid #000000;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.slider-indicator-dot.active {
  background-color: #000000;
  transform: scale(1.2);
}

.slider-indicator-dot:hover {
  background-color: #FAFFA0;
}

.store-item-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.store-item-card:hover {
  background-color: #FAFFA0 !important; /* Yellow hover effect matching brutalist style */
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000 !important;
}
.stores-list-container {
  padding-right: 5px;
}
/* Scrollbar brutalista */
.stores-list-container::-webkit-scrollbar {
  width: 10px;
}
.stores-list-container::-webkit-scrollbar-track {
  background: #FFFFFF;
  border-left: 2px solid #000000;
}
.stores-list-container::-webkit-scrollbar-thumb {
  background: #000000;
  border-left: 2px solid #000000;
}
</style>
