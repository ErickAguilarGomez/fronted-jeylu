<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import catalogService from '../services/catalogService.js'
import { socialMediaStore } from '@/modules/settings/stores/socialMediaStore.js'
import { cartStore } from '../stores/cartStore.js'
import { useToast } from '@/composables/useToast.js'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const productNotFound = ref(false)

const activeImage = ref('')
const selectedSize = ref(null)
const quantity = ref(1)

const sizeLabel = computed(() => {
  if (product.value && product.value.unit_of_measure) {
    return product.value.unit_of_measure
  }
  return 'Talle'
})

const showSizeSelector = computed(() => {
  return sizes.value.length > 0
})

const selectSize = (size) => {
  if (selectedSize.value === size) {
    selectedSize.value = null
  } else {
    selectedSize.value = size
  }
}

const relatedProducts = ref([])
const loadingRelated = ref(false)

// All images helper including primary fallback
const allImages = computed(() => {
  if (!product.value) return []
  if (product.value.images && product.value.images.length > 0) {
    return product.value.images.map(img => img.image_url)
  }
  return product.value.image_url ? [product.value.image_url] : []
})

// Unique sizes
const sizes = computed(() => {
  if (!product.value || !product.value.variants) return []
  return [...new Set(product.value.variants.map(v => v.size).filter(Boolean))]
})

// Matching variant based on selected size
const selectedVariant = computed(() => {
  if (!product.value || !product.value.variants) return null
  const hasSizes = sizes.value.length > 0
  if (!hasSizes) {
    return product.value.variants[0] || null
  }
  if (!selectedSize.value) return null
  return product.value.variants.find(v => v.size === selectedSize.value) || null
})

// Dynamic stock calculation
const currentStock = computed(() => {
  if (selectedVariant.value) {
    return Number(selectedVariant.value.stock)
  }
  if (product.value && product.value.variants) {
    return product.value.variants.reduce((acc, v) => acc + Number(v.stock), 0)
  }
  return Number(product.value?.stock || 0)
})

// Split price for Amazon format
const priceParts = computed(() => {
  if (!product.value) return { whole: '0', fraction: '00' }
  const num = Number(product.value.price || 0)
  const [whole, fraction] = num.toFixed(2).split('.')
  return { whole, fraction }
})

const addToCart = (redirectToCheckout = false) => {
  if (currentStock.value === 0) return
  if (showSizeSelector.value && !selectedSize.value) {
    toast.warning(`Por favor selecciona un ${sizeLabel.value.toLowerCase()} antes de continuar.`)
    return
  }

  cartStore.addItem({
    product: product.value,
    variant: selectedVariant.value,
    size: selectedSize.value,
    quantity: quantity.value
  })

  if (redirectToCheckout) {
    router.push('/checkout')
  } else {
    const sizeInfo = selectedSize.value ? ` (${sizeLabel.value} ${selectedSize.value})` : ''
    toast.success(`"${product.value.name}"${sizeInfo} x ${quantity.value} se agregó al carrito.`, '¡Agregado al carrito!')
  }
}

// Fetch related products
const fetchRelatedProducts = async (categoryId) => {
  loadingRelated.value = true
  try {
    const data = await catalogService.getProducts({ per_page: 20 })
    if (data && data.data) {
      relatedProducts.value = data.data
        .filter(p => p.category_id === categoryId && p.sku !== product.value.sku)
        .slice(0, 4)
        
      if (relatedProducts.value.length < 4) {
        const remaining = data.data
          .filter(p => p.sku !== product.value.sku && !relatedProducts.value.some(r => r.sku === p.sku))
          .slice(0, 4 - relatedProducts.value.length)
        relatedProducts.value = [...relatedProducts.value, ...remaining]
      }
    }
  } catch (err) {
    console.error('Error fetching related products:', err)
  } finally {
    loadingRelated.value = false
  }
}

// Load product details
const loadProduct = async (slug) => {
  loading.value = true
  error.value = null
  productNotFound.value = false
  selectedSize.value = null
  quantity.value = 1
  
  try {
    const res = await catalogService.getProductBySku(slug)
    if (res && res.success && res.data) {
      product.value = res.data
      activeImage.value = allImages.value[0] || ''
      document.title = `${product.value.name} - JEILU Store`
      
      if (sizes.value.length === 1) {
        selectedSize.value = sizes.value[0]
      }
      
      await fetchRelatedProducts(product.value.category_id)
    } else {
      productNotFound.value = true
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      productNotFound.value = true
    } else {
      error.value = 'No se pudo cargar la información del producto. Inténtalo de nuevo.'
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.slug,
  async (newSlug) => {
    if (newSlug) {
      await loadProduct(newSlug)
    }
  }
)

const embedUrl = computed(() => {
  if (!product.value || !product.value.video_url) return null
  const url = product.value.video_url
  
  let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  let match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`
  }
  
  regExp = /vimeo\.com\/([0-9]+)/
  match = url.match(regExp)
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`
  }
  
  return null
})

const isDirectVideo = computed(() => {
  if (!product.value || !product.value.video_url) return false
  return !!product.value.video_url.match(/\.(mp4|webm|ogg)($|\?)/i)
})

onMounted(async () => {
  socialMediaStore.fetchActiveSocialMedia()
  if (route.params.slug) {
    await loadProduct(route.params.slug)
  }
})
</script>

<template>
  <div class="amazon-product-detail py-3">
    <div class="container-fluid px-3 px-lg-4">
      
      <!-- Amazon Breadcrumbs Bar -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><router-link to="/" class="text-muted text-decoration-none">Inicio</router-link></li>
          <li class="breadcrumb-item"><router-link to="/catalog" class="text-muted text-decoration-none">Catálogo</router-link></li>
          <li v-if="product?.category_name" class="breadcrumb-item text-muted">{{ product.category_name }}</li>
          <li v-if="product?.name" class="breadcrumb-item active text-truncate" style="max-width: 300px;" aria-current="page">{{ product.name }}</li>
        </ol>
      </nav>

      <!-- Loading Screen -->
      <div v-if="loading" class="card p-5 text-center bg-white border-0 shadow-sm my-4">
        <div class="spinner-border text-warning mx-auto" style="width: 3.5rem; height: 3.5rem;" role="status">
          <span class="visually-hidden">Cargando producto...</span>
        </div>
        <h5 class="mt-3 text-muted">Cargando detalles del producto en JEILU...</h5>
      </div>

      <!-- Error Screen -->
      <div v-else-if="error" class="alert alert-danger shadow-sm my-4 p-4 text-center">
        <h4 class="fw-bold mb-2">Error al cargar producto</h4>
        <p class="mb-3">{{ error }}</p>
        <button @click="loadProduct(route.params.slug)" class="btn btn-amazon-primary px-4">Reintentar</button>
      </div>

      <!-- 404 Not Found Screen -->
      <div v-else-if="productNotFound" class="card bg-white p-5 text-center my-4 border-0 shadow-sm">
        <div class="display-3 text-warning fw-bold mb-2">404</div>
        <h3 class="fw-bold text-dark mb-2">Producto no encontrado</h3>
        <p class="text-muted mb-4">El SKU "{{ route.params.slug }}" no se encuentra disponible en nuestro catálogo actual.</p>
        <div>
          <router-link to="/catalog" class="btn btn-amazon-primary px-4 py-2">
            Explorar otros productos del catálogo
          </router-link>
        </div>
      </div>

      <!-- Main Amazon 3-Column Layout -->
      <div v-else-if="product" class="amazon-product-card card bg-white p-3 p-lg-4 border-0 shadow-sm">
        <div class="row g-4 align-items-start">
          
          <!-- COLUMN 1: Visual Gallery (Left) -->
          <div class="col-lg-4 col-md-5">
            <div class="d-flex flex-column gap-3 sticky-top" style="top: 85px;">
              <!-- Main Image Box -->
              <div class="amazon-gallery-main rounded border p-2 bg-white d-flex align-items-center justify-content-center position-relative">
                <img 
                  v-if="activeImage"
                  :src="activeImage" 
                  :alt="product.name" 
                  class="amazon-main-img img-fluid"
                />
                <div v-else class="text-muted small p-5">Sin imagen disponible</div>

                <!-- Out of Stock Badge -->
                <span v-if="currentStock === 0" class="badge bg-secondary text-white position-absolute top-0 start-0 m-2 fw-bold">
                  Agotado
                </span>
              </div>

              <!-- Thumbnails Row -->
              <div v-if="allImages.length > 1" class="d-flex gap-2 overflow-x-auto pb-1">
                <div 
                  v-for="(img, idx) in allImages" 
                  :key="idx"
                  @click="activeImage = img"
                  @mouseenter="activeImage = img"
                  class="amazon-thumbnail rounded p-1 border cursor-pointer"
                  :class="{ 'active-thumb': activeImage === img }"
                >
                  <img :src="img" :alt="'Vista ' + (idx + 1)" class="w-100 h-100 object-fit-contain" />
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMN 2: Product Specifications & Center Details -->
          <div class="col-lg-5 col-md-7">
            <div class="pe-lg-3">
              
              <!-- Brand / Store link -->
              <div class="mb-1">
                <router-link to="/tiendas" class="small fw-semibold amazon-brand-link">
                  Visita la tienda oficial de JEILU ({{ product.store_name || 'Sucursal Principal' }})
                </router-link>
              </div>

              <!-- Title -->
              <h1 class="amazon-detail-title mb-2 text-dark">
                {{ product.name }}
              </h1>

              <!-- Category & SKU Subtitle -->
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <span class="badge bg-light text-dark border">{{ product.category_name || 'Calzado' }}</span>
                <span class="text-muted small font-monospace">SKU: {{ selectedVariant?.sku || product.sku }}</span>
              </div>

              <!-- Price Box -->
              <div class="mb-3">
                <div class="d-flex align-items-baseline gap-2 mb-1">
                  <div class="amazon-price-row d-inline-flex align-items-baseline">
                    <span class="amazon-price-currency fs-6">$</span>
                    <span class="amazon-price-whole fs-2 fw-bold text-dark">{{ priceParts.whole }}</span>
                    <span class="amazon-price-fraction fs-6">{{ priceParts.fraction }}</span>
                  </div>
                </div>
                <div class="fs-8 text-secondary mt-1">
                  Precios en moneda nacional. Retiro disponible en tiendas o pedidos vía WhatsApp.
                </div>
              </div>

              <hr class="my-3 border-light" />

              <!-- Variant Selector (Talles / Medidas) -->
              <div v-if="showSizeSelector" class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="fw-bold small text-dark">
                    Seleccionar {{ sizeLabel }}:
                    <span v-if="selectedSize" class="text-primary ms-1 fw-bold">{{ selectedSize }}</span>
                  </label>
                  <span class="fs-8 text-muted">Selecciona una opción</span>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <button 
                    v-for="size in sizes" 
                    :key="size"
                    type="button"
                    @click="selectSize(size)"
                    :class="['btn btn-sm amazon-size-tile', selectedSize === size ? 'active-size' : 'inactive-size']"
                  >
                    {{ size }}
                    <i v-if="selectedSize === size" class="bi bi-check-lg ms-1"></i>
                  </button>
                </div>
              </div>

              <!-- Quantity Selector -->
              <div v-if="currentStock > 0" class="mb-4 d-flex align-items-center gap-3">
                <label class="fw-bold small text-dark m-0">Cantidad:</label>
                <div class="d-inline-flex align-items-center border rounded bg-white">
                  <button 
                    type="button"
                    @click="quantity = quantity > 1 ? quantity - 1 : 1"
                    class="btn btn-sm btn-light border-0 py-1 px-3 fw-bold"
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    v-model.number="quantity" 
                    class="form-control border-0 text-center fw-bold p-0" 
                    style="width: 44px; height: 32px;" 
                    readonly 
                  />
                  <button 
                    type="button"
                    @click="quantity = quantity < currentStock ? quantity + 1 : currentStock"
                    class="btn btn-sm btn-light border-0 py-1 px-3 fw-bold"
                  >
                    +
                  </button>
                </div>
                <span class="small text-muted">({{ currentStock }} disponibles)</span>
              </div>

              <hr class="my-3 border-light" />

              <!-- Bullet Points "Acerca de este artículo" -->
              <div class="mb-4">
                <h6 class="fw-bold text-dark mb-2">Acerca de este artículo</h6>
                <ul class="small text-dark ps-3 mb-0 d-flex flex-column gap-1">
                  <li><strong>Código de Artículo (SKU):</strong> {{ selectedVariant?.sku || product.sku }}</li>
                  <li><strong>Categoría:</strong> {{ product.category_name || 'General' }}</li>
                  <li><strong>Garantía:</strong> Compra garantizada en tiendas físicas JEILU.</li>
                  <li><strong>Atención:</strong> Asesoramiento y confirmación de talles vía WhatsApp.</li>
                  <li v-if="product.store_address"><strong>Disponibilidad física:</strong> {{ product.store_address }}</li>
                </ul>
              </div>

              <!-- Product Description -->
              <div v-if="product.description" class="mb-4">
                <h6 class="fw-bold text-dark mb-2">Descripción del producto</h6>
                <p class="small text-muted m-0" style="white-space: pre-wrap; line-height: 1.6;">
                  {{ product.description }}
                </p>
              </div>

              <!-- Video Section if available -->
              <div v-if="product.video_url" class="mb-4">
                <h6 class="fw-bold text-dark mb-2">Video de Demostración</h6>
                <div v-if="embedUrl" class="ratio ratio-16x9 rounded overflow-hidden shadow-sm border">
                  <iframe :src="embedUrl" frameborder="0" allowfullscreen class="w-100 h-100"></iframe>
                </div>
                <div v-else-if="isDirectVideo" class="ratio ratio-16x9 rounded overflow-hidden shadow-sm border bg-black">
                  <video controls class="w-100 h-100 object-fit-contain">
                    <source :src="product.video_url">
                  </video>
                </div>
                <div v-else class="p-3 bg-light rounded border text-center">
                  <a :href="product.video_url" target="_blank" class="btn btn-sm btn-outline-dark">
                    <i class="bi bi-play-circle me-1"></i> Ver video en plataforma externa
                  </a>
                </div>
              </div>

            </div>
          </div>

          <!-- COLUMN 3: Amazon Buy Box (Right) -->
          <div class="col-lg-3 col-12">
            <div class="amazon-buy-box card p-3 bg-white sticky-top" style="top: 85px;">
              
              <!-- Buy Box Price -->
              <div class="d-flex align-items-baseline gap-1 mb-2">
                <span class="fs-6 text-muted">$</span>
                <span class="fs-3 fw-bold text-dark">{{ Number(product.price).toFixed(2) }}</span>
              </div>

              <!-- Shipping & Pickup Notice -->
              <div class="small mb-3">
                <span class="text-primary fw-semibold">Retiro y Envío Disponible</span>
                <div class="text-muted fs-8 mt-1">
                  Coordinación directa de entrega o retiro por WhatsApp.
                </div>
              </div>

              <!-- Stock Availability Status -->
              <div class="mb-3">
                <div v-if="currentStock > 0" class="text-success fw-bold">
                  <i class="bi bi-check-circle-fill me-1"></i> En Stock
                </div>
                <div v-else class="text-danger fw-bold">
                  <i class="bi bi-x-circle-fill me-1"></i> Agotado temporalmente
                </div>
                <div v-if="currentStock > 0 && currentStock <= 5" class="text-danger small mt-1">
                  ¡Solo quedan {{ currentStock }} unidades disponibles!
                </div>
              </div>

              <!-- Store & Dispatcher Info -->
              <div class="small text-muted mb-3 border-top border-bottom py-2">
                <div class="d-flex justify-content-between mb-1">
                  <span>Envía</span>
                  <span class="fw-semibold text-dark">JEILU Oficial</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span>Vende</span>
                  <span class="fw-semibold text-dark text-truncate ms-2" style="max-width: 140px;">
                    {{ product.store_name || 'Tienda Principal' }}
                  </span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Devoluciones</span>
                  <span class="text-primary">Elegible en tienda</span>
                </div>
              </div>

              <!-- Amazon Yellow Primary CTA: Agregar al Carrito -->
              <div class="mb-2">
                <button 
                  type="button"
                  @click="addToCart(false)"
                  :disabled="currentStock === 0"
                  :class="['btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 rounded-pill', currentStock > 0 ? 'btn-amazon-primary' : 'btn-secondary disabled opacity-75']"
                >
                  <i class="bi bi-cart-plus fs-5"></i>
                  <span v-if="currentStock === 0">Producto Agotado</span>
                  <span v-else-if="showSizeSelector && !selectedSize">Seleccionar {{ sizeLabel }}</span>
                  <span v-else>Agregar al Carrito</span>
                </button>
              </div>

              <!-- Amazon Orange Secondary CTA: Comprar Ahora -->
              <div class="mb-3">
                <button 
                  type="button"
                  @click="addToCart(true)"
                  :disabled="currentStock === 0"
                  :class="['btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 rounded-pill', currentStock > 0 ? 'btn-amazon-secondary' : 'btn-secondary disabled opacity-75']"
                >
                  <i class="bi bi-bag-check fs-5"></i>
                  <span>Comprar Ahora</span>
                </button>
              </div>

              <!-- Secure Transaction Guarantee -->
              <div class="d-flex align-items-center gap-2 text-muted fs-8 mt-2 justify-content-center">
                <i class="bi bi-shield-lock-fill text-secondary"></i>
                <span>Transacción segura y garantizada</span>
              </div>

            </div>
          </div>

        </div>

        <!-- Related Products Shelf Section -->
        <div class="mt-5 pt-4 border-top">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold text-dark m-0">Productos relacionados con este artículo</h4>
            <router-link to="/catalog" class="small text-primary text-decoration-none fw-semibold">
              Ver más en el catálogo &raquo;
            </router-link>
          </div>

          <div v-if="loadingRelated" class="text-center py-4">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Cargando sugerencias...</span>
            </div>
          </div>

          <div v-else-if="relatedProducts.length === 0" class="text-muted small py-2">
            No hay otros productos sugeridos en este momento.
          </div>

          <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
            <div class="col" v-for="relProd in relatedProducts" :key="relProd.sku">
              <ProductCard :product="relProd" />
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.amazon-product-detail {
  background-color: var(--amazon-bg, #eaeded);
}

.amazon-gallery-main {
  height: 380px;
  background-color: #ffffff;
  border-color: #e7e7e7 !important;
}

.amazon-main-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.amazon-thumbnail {
  width: 60px;
  height: 60px;
  border-color: #d5d9d9 !important;
  background-color: #ffffff;
  transition: border-color 0.15s;
}

.amazon-thumbnail:hover, .active-thumb {
  border-color: #e77600 !important;
  box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.4);
}

.amazon-brand-link {
  color: #007185;
}

.amazon-brand-link:hover {
  color: #c7511f;
  text-decoration: underline;
}

.amazon-detail-title {
  font-size: 1.45rem !important;
  font-weight: 600 !important;
  line-height: 1.3;
}

.amazon-reviews-link {
  color: #007185;
}

.amazon-reviews-link:hover {
  color: #c7511f;
  text-decoration: underline;
}

.amazon-size-tile {
  min-width: 48px;
  height: 40px;
  border: 1px solid #d5d9d9 !important;
  border-radius: 6px !important;
  font-weight: 600;
  font-size: 0.9rem !important;
  background-color: #ffffff;
  color: #0f1111;
  transition: all 0.15s;
}

.amazon-size-tile:hover {
  border-color: #888c8c !important;
  background-color: #f7fafa;
}

.active-size {
  border-color: #e77600 !important;
  background-color: #fdf5ea !important;
  box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.3) !important;
  color: #0f1111 !important;
}

.amazon-buy-box {
  border: 1px solid #d5d9d9 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
}

.fs-8 {
  font-size: 0.75rem;
}

@media (max-width: 767.98px) {
  .amazon-product-detail {
    padding-top: 0.75rem !important;
  }

  .amazon-product-detail > .container-fluid {
    padding-inline: 0.75rem !important;
  }

  .amazon-product-detail .breadcrumb {
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
  }

  .amazon-product-detail .breadcrumb-item {
    min-width: 0;
  }

  .amazon-product-detail .breadcrumb-item.active {
    max-width: min(48vw, 220px) !important;
  }

  .amazon-product-card {
    padding: 0.75rem !important;
  }

  .amazon-product-detail .row {
    --bs-gutter-x: 0.75rem;
    --bs-gutter-y: 1rem;
  }

  .amazon-gallery-main {
    height: auto;
    min-height: 280px;
    max-height: 440px;
    aspect-ratio: 1 / 1;
  }

  .amazon-main-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .amazon-thumbnail {
    flex: 0 0 76px;
    width: 76px;
    height: 76px;
  }

  .amazon-detail-title {
    font-size: 1.25rem !important;
  }
}
</style>
