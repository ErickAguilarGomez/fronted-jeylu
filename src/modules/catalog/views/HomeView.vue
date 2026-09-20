<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/plugins/axios'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'
import { catalogStore } from '@/modules/catalog/stores/catalogStore.js'
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
  let center = [-34.6037, -58.3816] // Default to Buenos Aires, Argentina
  
  if (validStores.length > 0) {
    center = [parseFloat(validStores[0].latitude), parseFloat(validStores[0].longitude)]
    map.value = L.map(mapContainer.value).setView(center, 16)
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
      <div style="font-family: 'Inter', sans-serif; padding: 4px;">
        <h6 style="margin: 0 0 4px 0; font-weight: 700; color: #0f1111;">${store.name}</h6>
        <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #565959;"><b>Dirección:</b> ${store.address}</p>
        ${store.phone ? `<p style="margin: 0; font-size: 0.85rem; color: #565959;"><b>Teléfono:</b> ${store.phone}</p>` : ''}
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
  
  map.value.setView([lat, lng], 17)
  
  const marker = markers.value[store.id]
  if (marker) {
    marker.openPopup()
  }
}

onMounted(async () => {
  catalogStore.fetchCategories()
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
  <div class="amazon-home-page">

    <!-- 1. Hero Banner Carousel with Amazon Bottom Gradient Mask -->
    <div 
      v-if="banners.length > 0" 
      class="amazon-hero-slider position-relative"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="amazon-hero-wrapper position-relative overflow-hidden">
        <div 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          class="amazon-hero-slide"
          :class="{ active: index === activeBannerIndex }"
        >
          <img 
            :src="banner.image_url" 
            alt="Promoción Destacada" 
            class="amazon-hero-img"
          />
        </div>

        <!-- Left / Right Carousel Controls -->
        <template v-if="banners.length > 1">
          <button 
            @click="prevBanner" 
            class="amazon-slider-arrow arrow-left"
            aria-label="Anterior"
          >
            <i class="bi bi-chevron-left fs-3"></i>
          </button>
          <button 
            @click="nextBanner" 
            class="amazon-slider-arrow arrow-right"
            aria-label="Siguiente"
          >
            <i class="bi bi-chevron-right fs-3"></i>
          </button>

          <!-- Subtle Dots -->
          <div class="amazon-slider-dots">
            <span 
              v-for="(banner, index) in banners" 
              :key="'dot-' + banner.id"
              class="amazon-dot"
              :class="{ active: index === activeBannerIndex }"
              @click="setBanner(index)"
            ></span>
          </div>
        </template>
      </div>

      <!-- Amazon Signature Gradient Overlay (Fades banner to background #EAEDED) -->
      <div class="amazon-hero-gradient"></div>
    </div>

    <!-- Fallback Hero Header if no banners loaded -->
    <div v-else class="amazon-hero-fallback py-5 px-3 text-center text-white mb-4">
      <div class="container py-4">
        <h1 class="display-4 fw-bold text-white mb-2" style="letter-spacing: -0.5px;">Bienvenido a JEILU Store</h1>
        <p class="fs-5 text-white-50 mx-auto mb-4" style="max-width: 650px;">
          Descubre nuestro catálogo exclusivo de calzado y moda con entrega rápida y pedidos directos por WhatsApp.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/catalog" class="btn btn-amazon-primary px-4 py-2 fs-6">
            Explorar Catálogo Completo
          </router-link>
          <a href="#tiendas" class="btn btn-outline-light px-4 py-2 fs-6">
            Nuestras Sucursales
          </a>
        </div>
      </div>
    </div>

    <!-- 2. Amazon 4-Card Multi-Feature Section (Overlapping Hero only if banners exist) -->
    <div class="container-fluid px-3 px-lg-4 position-relative" :class="{ 'amazon-cards-overlap': banners.length > 0 }" style="z-index: 5;">
      <div class="row g-3 g-xl-4 mb-4">
        
        <!-- Card 1: Categorías de Temporada -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 bg-white d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-3 text-dark">Explora Categorías</h5>
              <div class="row g-2 mb-3">
                <div 
                  v-for="cat in catalogStore.categories.slice(0, 4)" 
                  :key="cat.id" 
                  class="col-6"
                >
                  <router-link 
                    to="/catalog" 
                    @click="catalogStore.selectedCategoryId = cat.id; catalogStore.fetchProducts(1)"
                    class="d-block p-2 bg-light rounded text-decoration-none text-dark hover-cat-tile text-center"
                  >
                    <i class="bi bi-tag-fill text-warning fs-5 d-block mb-1"></i>
                    <span class="small fw-semibold d-block text-truncate">{{ cat.name }}</span>
                    <span class="fs-8 text-muted">{{ cat.products_count || 0 }} productos</span>
                  </router-link>
                </div>
              </div>
            </div>
            <router-link to="/catalog" class="small fw-semibold text-primary text-decoration-none mt-auto">
              Ver todas las categorías &raquo;
            </router-link>
          </div>
        </div>

        <!-- Card 2: Catálogo Completo y Talles -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 bg-white d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-2 text-dark">Catálogo Completo</h5>
              <span class="badge bg-primary text-white mb-3">Talles y Modelos</span>
              <p class="small text-muted mb-3">Encuentra una amplia variedad de modelos organizados por categorías con stock y talles actualizados.</p>
              <div class="p-3 bg-light rounded text-center mb-3">
                <i class="bi bi-grid-3x3-gap fs-1 text-primary"></i>
                <div class="fw-bold text-dark mt-1">Todos los Modelos</div>
              </div>
            </div>
            <router-link to="/catalog" class="small fw-semibold text-primary text-decoration-none mt-auto">
              Ver catálogo completo &raquo;
            </router-link>
          </div>
        </div>

        <!-- Card 3: Atención WhatsApp Directa -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 bg-white d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-2 text-dark">Compras por WhatsApp</h5>
              <p class="small text-muted mb-3">Atención personalizada, confirmación inmediata de talles y pedidos con múltiples métodos de pago.</p>
              <div class="p-3 bg-light rounded d-flex align-items-center gap-3 mb-3">
                <i class="bi bi-whatsapp fs-1 text-success"></i>
                <div class="text-start">
                  <div class="fw-bold small text-dark">Asesoría en línea</div>
                  <div class="fs-8 text-muted">Respuesta en minutos</div>
                </div>
              </div>
            </div>
            <router-link to="/catalog" class="small fw-semibold text-primary text-decoration-none mt-auto">
              Ver catálogo para ordenar &raquo;
            </router-link>
          </div>
        </div>

        <!-- Card 4: Sucursales Físicas -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 bg-white d-flex flex-column justify-content-between">
            <div>
              <h5 class="fw-bold mb-2 text-dark">Nuestras Tiendas</h5>
              <p class="small text-muted mb-3">Visítanos en nuestras tiendas físicas para probarte tus modelos favoritos y recoger pedidos sin costo.</p>
              <div class="p-3 bg-light rounded d-flex align-items-center gap-3 mb-3">
                <i class="bi bi-shop fs-1 text-primary"></i>
                <div class="text-start">
                  <div class="fw-bold small text-dark">{{ stores.length }} Sucursales Activas</div>
                  <div class="fs-8 text-muted">Atención y retiro en tienda</div>
                </div>
              </div>
            </div>
            <a href="#tiendas" class="small fw-semibold text-primary text-decoration-none mt-auto">
              Ver direcciones y mapa &raquo;
            </a>
          </div>
        </div>

      </div>
    </div>

    <!-- 3. Best Sellers Section (Amazon Strip Carousel / Shelf) -->
    <div class="container-fluid px-3 px-lg-4 mb-5">
      <div class="card bg-white p-4 border-0 shadow-sm">
        
        <!-- Shelf Header -->
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <div class="d-flex align-items-center gap-2">
            <h4 class="fw-bold m-0 text-dark">Los más vendidos en JEILU</h4>
            <span class="badge bg-warning text-dark fw-bold d-none d-sm-inline">Top Ventas</span>
          </div>
          <router-link to="/catalog" class="small fw-semibold text-primary text-decoration-none">
            Ver todo el catálogo &raquo;
          </router-link>
        </div>

        <!-- Shelf Loading -->
        <div v-if="loadingBestSellers" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="errorBestSellers" class="alert alert-danger">
          {{ errorBestSellers }}
        </div>

        <div v-else-if="bestSellers.length === 0" class="text-center py-4 text-muted">
          No hay productos destacados por el momento.
        </div>

        <!-- Shelf Grid -->
        <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
          <div class="col" v-for="product in bestSellers" :key="product.sku">
            <ProductCard :product="product" />
          </div>
        </div>

      </div>
    </div>

    <!-- 4. Interactive Store Locator Section -->
    <div id="tiendas" class="container-fluid px-3 px-lg-4 mb-5">
      <div class="card bg-white p-4 border-0 shadow-sm">
        
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <div>
            <h4 class="fw-bold m-0 text-dark">Visita Nuestras Sucursales Físicas</h4>
            <p class="text-muted small m-0">Encuentra la tienda JEILU más cercana para retirar tus productos o solicitar atención personalizada.</p>
          </div>
        </div>

        <div v-if="loadingStores" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando tiendas...</span>
          </div>
        </div>

        <div v-else-if="errorStores" class="alert alert-danger">
          {{ errorStores }}
        </div>

        <div v-else-if="stores.length === 0" class="text-center py-4 text-muted">
          No hay tiendas físicas registradas.
        </div>

        <div v-else class="row g-4">
          <!-- Stores Sidebar List -->
          <div class="col-lg-4">
            <div class="stores-scroll-list d-flex flex-column gap-2" style="max-height: 440px; overflow-y: auto;">
              <div 
                v-for="store in stores" 
                :key="store.id"
                @click="focusStore(store)"
                class="store-card p-3 rounded border bg-light cursor-pointer transition"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <h6 class="fw-bold text-dark m-0">{{ store.name }}</h6>
                  <span v-if="store.latitude && store.longitude" class="badge bg-success small">
                    <i class="bi bi-geo-alt-fill me-1"></i> Mapa
                  </span>
                </div>
                <div class="small text-muted mt-2">
                  <i class="bi bi-pin-map me-1 text-secondary"></i> {{ store.address }}
                </div>
                <div v-if="store.phone" class="small text-muted mt-1">
                  <i class="bi bi-telephone me-1 text-secondary"></i> {{ store.phone }}
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Leaflet Map -->
          <div class="col-lg-8">
            <div 
              ref="mapContainer" 
              class="rounded overflow-hidden border shadow-sm" 
              style="height: 440px; width: 100%; z-index: 1;"
            ></div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.amazon-home-page {
  background-color: var(--amazon-bg, #eaeded);
}

/* HERO SLIDER */
.amazon-hero-slider {
  width: 100%;
  position: relative;
  background-color: #000000;
}

.amazon-hero-wrapper {
  width: 100%;
  height: 460px;
}

@media (max-width: 991.98px) {
  .amazon-hero-wrapper {
    height: 320px;
  }
}

@media (max-width: 575.98px) {
  .amazon-hero-wrapper {
    height: 200px;
  }
}

.amazon-hero-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.6s ease-in-out, visibility 0.6s ease-in-out;
  z-index: 1;
}

.amazon-hero-slide.active {
  opacity: 1;
  visibility: visible;
  z-index: 2;
}

.amazon-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* GRADIENT FADE TO #EAEDED */
.amazon-hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(180deg, rgba(234, 237, 237, 0) 0%, #eaeded 100%);
  pointer-events: none;
  z-index: 3;
}

@media (max-width: 767.98px) {
  .amazon-hero-gradient {
    height: 100px;
  }
}

/* CONTROLS */
.amazon-slider-arrow {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  background: transparent;
  color: #ffffff;
  border: 2px solid transparent;
  width: 44px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.15s;
  border-radius: 4px;
}

.amazon-slider-arrow:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
}

.arrow-left {
  left: 10px;
}

.arrow-right {
  right: 10px;
}

.amazon-slider-dots {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.amazon-dot {
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.amazon-dot.active {
  background-color: #febd69;
  transform: scale(1.3);
}

/* OVERLAPPING CARDS */
@media (min-width: 992px) {
  .amazon-cards-overlap {
    margin-top: -140px;
  }
}

.hover-cat-tile {
  transition: background-color 0.15s, transform 0.15s;
}

.hover-cat-tile:hover {
  background-color: #eaeaea !important;
  transform: translateY(-2px);
}

.store-card {
  transition: all 0.15s ease;
  border-color: #e0e0e0 !important;
}

.store-card:hover {
  background-color: #ffffff !important;
  border-color: #febd69 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.amazon-hero-fallback {
  background: linear-gradient(135deg, #131921 0%, #232f3e 50%, #37475a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.fs-8 {
  font-size: 0.75rem;
}
</style>
