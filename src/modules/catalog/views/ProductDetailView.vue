<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import catalogService from '../services/catalogService.js'
import { socialMediaStore } from '@/modules/settings/stores/socialMediaStore.js'
import { whatsappStore } from '@/modules/settings/stores/whatsappStore.js'
import WhatsappSelector from '@/shared/components/WhatsappSelector.vue'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const whatsappSelectorRef = ref(null)

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
  return 0
})

const openWhatsApp = () => {
  if (currentStock.value === 0 || (showSizeSelector.value && !selectedSize.value)) return

  const activeNumbers = whatsappStore.whatsappNumbers
  if (activeNumbers.length === 0) {
    toast.error('No hay números de WhatsApp configurados para la tienda.', 'Error')
    return
  }

  const name = product.value.name
  const activeSku = selectedVariant.value?.sku || product.value.sku
  const price = product.value.price
  const sizeValue = selectedSize.value || null
  const variantColor = selectedVariant.value?.color || null
  const qty = quantity.value || 1
  const totalPrice = (Number(price || 0) * qty).toFixed(2)
  const unitPriceFormatted = Number(price || 0).toFixed(2)

  const productUrl = window.location.origin + '/catalog/detail/' + (product.value.sku || product.value.base_sku || route.params.slug)

  let text = `¡Hola! Me interesa comprar el siguiente producto en JEILU Store:\n\n`
  text += `🛍️ *Producto:* ${name}\n`
  text += `🆔 *SKU:* ${activeSku}\n`
  if (variantColor) {
    text += `🎨 *Variante:* ${variantColor}\n`
  }
  if (sizeValue && sizeValue !== 'Único') {
    text += `📏 *${sizeLabel.value}:* ${sizeValue}\n`
  }
  text += `🔢 *Cantidad:* ${qty}\n`
  text += `💰 *Precio Unitario:* S/ ${unitPriceFormatted}\n`
  if (qty > 1) {
    text += `💵 *Total:* S/ ${totalPrice}\n`
  }
  if (productUrl) {
    text += `\n🔗 *Link del producto:* ${productUrl}\n`
  }
  text += `\n¿Tienen disponibilidad para envío inmediato?`

  if (activeNumbers.length === 1) {
    const num = activeNumbers[0]
    const cleanPhone = num.phone.replace(/[^0-9+]/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
  } else if (activeNumbers.length >= 2) {
    if (whatsappSelectorRef.value) {
      whatsappSelectorRef.value.open(null, text)
    }
  }
}

// Fetch related products
const fetchRelatedProducts = async (categoryId) => {
  loadingRelated.value = true
  try {
    const data = await catalogService.getProducts({ per_page: 20 })
    if (data && data.data) {
      // Filter products from same category, exclude current, slice to 4
      relatedProducts.value = data.data
        .filter(p => p.category_id === categoryId && p.sku !== product.value.sku)
        .slice(0, 4)
        
      // If we don't have enough, fill with other available products
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

const extractColorName = (name) => {
  const parts = name.split(' ')
  return parts[parts.length - 1] || 'Color'
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
      
      // Auto-select if single variant with no specifications
      if (sizes.value.length === 0 && product.value.variants?.length > 0) {
        selectedSize.value = product.value.variants[0].size
      }
      
      // Load related products
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

// Watch for route slug changes to support in-page navigation (clicking related products)
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
  
  // YouTube
  let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  let match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`
  }
  
  // Vimeo
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
  whatsappStore.fetchActiveNumbers()
  if (route.params.slug) {
    await loadProduct(route.params.slug)
  }
})
</script>

<template>
  <div class="container py-4">
    <!-- Back button -->
    <div class="mb-4">
      <router-link to="/catalog" class="btn btn-secondary py-2 px-3 fs-6 d-inline-flex align-items-center gap-2 border-2 border-black">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        VOLVER AL CATÁLOGO
      </router-link>
    </div>

    <!-- Loading Screen -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-black" style="width: 4rem; height: 4rem; border-width: 0.35em;" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <h3 class="mt-4 fw-black text-uppercase">Cargando producto...</h3>
    </div>

    <!-- Error Screen -->
    <div v-else-if="error" class="alert bg-danger text-white border-black border-2 p-5 text-center my-4 shadow-solid">
      <h2 class="fw-black text-uppercase mb-3">ERROR DE CARGA</h2>
      <p class="fs-5 fw-bold mb-4">{{ error }}</p>
      <button @click="loadProduct(route.params.slug)" class="btn btn-dark border-2 border-black">REINTENTAR</button>
    </div>

    <!-- Friendly 404 Not Found Screen -->
    <div v-else-if="productNotFound" class="product-not-found border border-black border-3 p-5 text-center my-4 bg-light shadow-solid">
      <div class="py-4">
        <div class="display-1 fw-black text-danger mb-3" style="font-family: 'Archivo Black', sans-serif;">404</div>
        <h2 class="fw-black text-uppercase mb-3 fs-1">PRODUCTO NO ENCONTRADO</h2>
        <p class="fs-5 text-muted mb-5 font-monospace">EL SKU "{{ route.params.slug }}" NO EXISTE O SE ENCUENTRA INACTIVO EN NUESTRO SISTEMA.</p>
        <router-link to="/catalog" class="btn btn-primary btn-lg px-5 py-3 fs-4 border-2 border-black shadow-solid">
          VER NUESTRO CATÁLOGO
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="product" class="product-detail-container">
      <div class="row g-5">
        <!-- Gallery Column -->
        <div class="col-lg-6 col-md-12">
          <div class="gallery-wrapper d-flex flex-column gap-3">
            <!-- Main Featured Image -->
            <div class="main-image-container border border-black border-3 shadow-solid bg-white position-relative">
              <img 
                v-if="activeImage"
                :src="activeImage" 
                :alt="product.name" 
                class="main-featured-image w-100"
              />
              <div v-else class="main-featured-image w-100 d-flex justify-content-center align-items-center bg-light text-muted fw-black fs-4 text-uppercase">
                Sin Imagen
              </div>
              <span class="badge bg-black text-white position-absolute top-0 start-0 m-3 fs-5 border border-black shadow-sm fw-black">
                $ {{ Number(product.price).toFixed(2) }}
              </span>
            </div>

            <!-- Gallery Thumbnails (Only if more than 1 image) -->
            <div v-if="allImages.length > 1" class="thumbnails-container d-flex flex-wrap gap-2">
              <div 
                v-for="(img, idx) in allImages" 
                :key="idx"
                @click="activeImage = img"
                @mouseenter="activeImage = img"
                class="thumbnail-card border border-2 border-black bg-secondary cursor-pointer transition"
                :class="{ 'active-thumbnail': activeImage === img }"
                style="width: 80px; height: 80px; overflow: hidden;"
              >
                <img 
                  :src="img" 
                  :alt="'Miniatura ' + (idx + 1)" 
                  class="w-100 h-100 object-fit-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Info/Purchase Column -->
        <div class="col-lg-6 col-md-12">
          <div class="product-info-wrapper d-flex flex-column h-100">
            <!-- Breadcrumbs / Tag -->
            <div class="mb-2">
              <span class="badge bg-black text-white border-2 border-black fs-7 fw-bold font-monospace">
                CATEGORÍA: {{ product.category_name || 'Sin categoría' }}
              </span>
            </div>

            <!-- Product Name -->
            <h1 class="display-5 fw-black text-uppercase mb-2 font-monospace tracking-tight">
              {{ product.name }}
            </h1>

            <!-- Price -->
            <div class="mb-4">
              <div class="price-display border border-black border-2 p-3 bg-black d-inline-block shadow-solid">
                <span class="fs-2 fw-black text-white">$ {{ Number(product.price).toFixed(2) }}</span>
              </div>
            </div>

            <!-- SKU & Availability Display -->
            <div class="d-flex flex-wrap align-items-center gap-3 mb-3 font-monospace">
              <div>
                <span class="text-muted fw-bold">SKU DETALLE:</span> 
                <span class="text-black fw-black bg-light border border-black p-1 px-2 ms-2">
                  {{ selectedVariant?.sku || product.sku }}
                </span>
              </div>
              <div class="d-flex align-items-center gap-2 border border-black p-1 px-2 bg-light">
                <span 
                  :class="['d-inline-block rounded-circle border border-black', currentStock > 0 ? 'bg-success' : 'bg-danger']"
                  style="width: 10px; height: 10px;"
                ></span>
                <span class="fw-black fs-7" :class="currentStock > 0 ? 'text-success' : 'text-danger'">
                  {{ currentStock > 0 ? `DISPONIBLE (${currentStock} UNDS)` : 'AGOTADO' }}
                </span>
              </div>
            </div>

            <hr class="border-black border-1 mb-4" />

            <!-- Variant Selectors -->
            <!-- Size selector -->
            <div v-if="showSizeSelector" class="mb-4">
              <label class="fw-black text-uppercase font-monospace mb-2 d-block fs-6">{{ sizeLabel }}s disponibles:</label>
              <div class="d-flex flex-wrap gap-2">
                <button 
                  v-for="size in sizes" 
                  :key="size"
                  @click="selectedSize = size"
                  :class="['btn btn-sm border-2 border-black font-monospace m-0 transition', selectedSize === size ? 'btn-dark text-white selected-btn' : 'btn-white bg-white text-black shadow-sm']"
                  style="min-width: 54px; height: 54px; font-size: 1.15rem !important; font-weight: 900; display: flex; align-items: center; justify-content: center;"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div v-if="currentStock > 0" class="mb-4">
              <label class="fw-black text-uppercase font-monospace mb-2 d-block fs-6">Cantidad:</label>
              <div class="d-inline-flex align-items-center border border-black border-3 shadow-solid-sm bg-white">
                <button 
                  type="button"
                  @click="quantity = quantity > 1 ? quantity - 1 : 1"
                  class="btn btn-white border-0 rounded-0 fw-black fs-4 m-0 d-flex align-items-center justify-content-center" 
                  style="width: 44px; height: 44px; transition: background-color 0.15s;"
                >
                  -
                </button>
                <input 
                  type="text" 
                  v-model.number="quantity" 
                  class="form-control border-0 rounded-0 text-center fw-black font-monospace fs-5 bg-white p-0 m-0" 
                  style="width: 60px; height: 44px;" 
                  readonly 
                />
                <button 
                  type="button"
                  @click="quantity = quantity < currentStock ? quantity + 1 : currentStock"
                  class="btn btn-white border-0 rounded-0 fw-black fs-4 m-0 d-flex align-items-center justify-content-center" 
                  style="width: 44px; height: 44px; transition: background-color 0.15s;"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Store Details Card -->
            <div class="mb-4">
              <div class="border border-black border-2 p-3 bg-light font-monospace">
                <h5 class="fw-black text-uppercase fs-6 mb-3 border-bottom border-black pb-2">Distribuidor Oficial</h5>
                <div class="d-flex flex-column gap-2 small">
                  <div>
                    <span class="text-muted fw-bold">TIENDA:</span>
                    <span class="text-black fw-black ms-2">{{ product.store_name || 'Tienda Principal' }}</span>
                  </div>
                  <div>
                    <span class="text-muted fw-bold">DIRECCIÓN:</span>
                    <span class="text-black fw-bold ms-2">{{ product.store_address || 'Av. Principal' }}</span>
                  </div>
                  <div v-if="product.store_phone">
                    <span class="text-muted fw-bold">CONTACTO:</span>
                    <span class="text-black fw-bold ms-2">{{ product.store_phone }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- WhatsApp Primary CTA -->
            <div class="mb-4 mt-auto">
              <button 
                @click="openWhatsApp"
                :class="['btn btn-lg w-100 py-3 fs-4 border-3 border-black d-flex justify-content-center align-items-center gap-3 transition shadow-solid', currentStock > 0 && (!showSizeSelector || selectedSize) ? 'whatsapp-btn text-white' : 'btn-secondary text-muted']"
                :disabled="currentStock === 0 || (showSizeSelector && !selectedSize)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.23.148-.427.05-.197-.099-.835-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
                <span v-if="currentStock === 0">PRODUCTO AGOTADO</span>
                <span v-else-if="showSizeSelector && !selectedSize">SELECCIONAR {{ sizeLabel.toUpperCase() }}</span>
                <span v-else>COMPRAR POR WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div v-if="product.description" class="row mt-5">
        <div class="col-12">
          <div class="border border-black border-3 p-4 shadow-solid bg-white">
            <h3 class="fw-black text-uppercase mb-3 font-monospace">Descripción del Producto</h3>
            <p class="fs-6 m-0 font-monospace text-wrap" style="white-space: pre-wrap; line-height: 1.6;">
              {{ product.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Video Section -->
      <div v-if="product.video_url" class="row mt-5">
        <div class="col-12">
          <div class="border border-black border-3 p-4 shadow-solid bg-white">
            <h3 class="fw-black text-uppercase mb-3 font-monospace">Video del Producto 🎥</h3>
            
            <div v-if="embedUrl" class="ratio ratio-16x9 border border-black border-2 bg-black">
              <iframe :src="embedUrl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-100 h-100"></iframe>
            </div>
            
            <div v-else-if="isDirectVideo" class="ratio ratio-16x9 border border-black border-2 bg-black">
              <video controls class="w-100 h-100 object-fit-contain">
                <source :src="product.video_url">
                Tu navegador no soporta reproducción de video.
              </video>
            </div>
            
            <div v-else class="text-center py-4 bg-light border border-black">
              <p class="fw-bold mb-3">Hay un video de demostración disponible para este producto:</p>
              <a :href="product.video_url" target="_blank" class="btn btn-dark py-3 px-5 border-2 border-black font-monospace fw-black fs-5 shadow-solid">
                VER VIDEO EN PLATAFORMA EXTERNA
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="row mt-5 pt-4">
        <div class="col-12">
          <div class="border-bottom border-black pb-3 mb-4">
            <h2 class="display-6 m-0 fw-black text-uppercase font-monospace">Te puede interesar</h2>
          </div>
          
          <div v-if="loadingRelated" class="text-center py-4">
            <div class="spinner-border text-black" role="status">
              <span class="visually-hidden">Cargando sugerencias...</span>
            </div>
          </div>
          
          <div v-else-if="relatedProducts.length === 0" class="text-muted italic py-3 font-monospace">
            No hay otros productos recomendados en este momento.
          </div>
          
          <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            <div class="col" v-for="relProd in relatedProducts" :key="relProd.sku">
              <ProductCard :product="relProd" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Selector de WhatsApp reusable -->
    <WhatsappSelector ref="whatsappSelectorRef" />
  </div>
</template>

<style scoped>
.main-image-container {
  overflow: hidden;
  transition: transform 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  height: auto;
}
.main-featured-image {
  width: 100%;
  height: auto;
  max-height: 550px;
  object-fit: contain;
}
@media (max-width: 767.98px) {
  .main-featured-image {
    max-height: 350px;
  }
}
.thumbnail-card {
  transition: all 0.15s ease-in-out;
  opacity: 0.7;
}
.thumbnail-card:hover, .active-thumbnail {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 2px 2px 0px #000000;
  border-color: #000000 !important;
}
.active-thumbnail {
  border-width: 3px !important;
}
.price-display {
  transform: rotate(-1deg);
  border-width: 3px !important;
}
.tracking-tight {
  letter-spacing: -1px;
}
.product-not-found {
  border-width: 3px !important;
}
.btn-white:hover {
  background-color: #FAFFA0 !important;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000 !important;
}
.selected-btn {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  transform: translate(2px, 2px) !important;
  box-shadow: none !important;
}
.whatsapp-btn {
  background-color: #25D366 !important;
  color: #FFFFFF !important;
  border-color: #000000 !important;
}
.whatsapp-btn:hover {
  background-color: #20BA5A !important;
  transform: translate(-3px, -3px) !important;
  box-shadow: 6px 6px 0px #000000 !important;
}
</style>
