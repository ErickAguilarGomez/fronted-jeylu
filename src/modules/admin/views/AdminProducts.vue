<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import SearchBar from '@/components/common/SearchBar.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const products = ref([])
const stores = ref([])
const categories = ref([])
const loading = ref(true)
const selectedFilterStore = ref('') // '' means all stores

// Pagination & Search
const page = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')

// Modal states
const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const saving = ref(false)

// Form data
const form = ref({
  base_sku: '',
  category_id: '',
  store_id: '',
  name: '',
  description: '',
  price: 0,
  existing_images: [],
  new_image_boxes: [{ file: null, preview: null }],
  variants: []
})

const fetchMetadata = async () => {
  try {
    const [storesRes, catRes] = await Promise.all([
      api.get('/stores', { params: { all: 1 } }),
      api.get('/categories', { params: { all: 1 } })
    ])
    stores.value = storesRes.data?.stores || []
    categories.value = catRes.data?.categories || []
  } catch (err) {
    console.error('Error fetching metadata', err)
  }
}

const fetchProducts = async (pageNumber = 1) => {
  loading.value = true
  page.value = pageNumber
  try {
    const params = { page: page.value, per_page: 10, search: searchQuery.value }
    if (selectedFilterStore.value) {
      params.store_id = selectedFilterStore.value
    }
    const response = await api.get('/products/all', { params })
    products.value = response.data.data
    lastPage.value = response.data.meta.last_page
  } catch (err) {
    console.error('Error fetching products', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchProducts(1)
}

onMounted(async () => {
  await fetchMetadata()
  await fetchProducts()
})

const filterByStore = (storeId) => {
  selectedFilterStore.value = storeId
  fetchProducts(1)
}

// Add new variant row
const addVariant = () => {
  form.value.variants.push({ id: null, size: '', color: '', stock: 0 })
}

// Remove variant row
const removeVariant = (index) => {
  form.value.variants.splice(index, 1)
}

// Dynamic image boxes
const addImageBox = () => {
  form.value.new_image_boxes.push({ file: null, preview: null })
}

const removeImageBox = (index) => {
  form.value.new_image_boxes.splice(index, 1)
}

const handleImageFileChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    form.value.new_image_boxes[index].file = file
    form.value.new_image_boxes[index].preview = URL.createObjectURL(file)
  }
}

const deleteExistingImage = async (imgUrl, index) => {
  if (confirm('¿ESTÁS SEGURO DE ELIMINAR ESTA IMAGEN? ESTO LA BORRARÁ DEFINITIVAMENTE DEL ALMACENAMIENTO CLOUDINARY Y BASE DE DATOS.')) {
    try {
      await api.delete('/products/images', { data: { image_url: imgUrl } })
      form.value.existing_images.splice(index, 1)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la imagen')
    }
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = { 
    base_sku: '', 
    category_id: categories.value[0]?.id || '',
    store_id: selectedFilterStore.value || stores.value[0]?.id || 1,
    name: '', 
    description: '',
    price: 0, 
    existing_images: [],
    new_image_boxes: [{ file: null, preview: null }],
    variants: [{ id: null, size: '', color: '', stock: 0 }] 
  }
  showModal.value = true
}

const openEditModal = async (productSku) => {
  try {
    const storeParam = selectedFilterStore.value ? `?store_id=${selectedFilterStore.value}` : ''
    const response = await api.get(`/products/${productSku}${storeParam}`)
    const product = response.data.data

    modalMode.value = 'edit'
    form.value = { 
      base_sku: product.sku, 
      category_id: product.category_id || categories.value[0]?.id || '',
      store_id: selectedFilterStore.value || stores.value[0]?.id || 1,
      name: product.name, 
      description: product.description || '',
      price: product.price, 
      existing_images: product.images || [],
      new_image_boxes: [{ file: null, preview: null }],
      variants: product.variants.map(v => ({
        id: v.id,
        size: v.size || '',
        color: v.color || '',
        stock: v.stock
      }))
    }
    
    if (form.value.variants.length === 0) {
      addVariant()
    }

    showModal.value = true
  } catch(err) {
    alert('Error al cargar datos del producto para editar')
  }
}

const submitForm = async () => {
  saving.value = true
  
  const formData = new FormData()
  
  if (modalMode.value === 'create') {
    if (!form.value.base_sku) {
      const cleanName = form.value.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      form.value.base_sku = `${cleanName || 'PRD'}-${randomNum}`
    }
    formData.append('base_sku', form.value.base_sku)
  }
  
  formData.append('category_id', form.value.category_id)
  formData.append('store_id', form.value.store_id)
  formData.append('name', form.value.name)
  formData.append('description', form.value.description)
  formData.append('price', form.value.price)

  form.value.variants.forEach((v, index) => {
    if (v.id) formData.append(`variants[${index}][id]`, v.id)
    if (v.size) formData.append(`variants[${index}][size]`, v.size)
    if (v.color) formData.append(`variants[${index}][color]`, v.color)
    formData.append(`variants[${index}][stock]`, v.stock)
  })

  let imgCount = 0
  form.value.new_image_boxes.forEach(box => {
    if (box.file) {
      formData.append(`images[${imgCount}]`, box.file)
      imgCount++
    }
  })

  try {
    if (modalMode.value === 'create') {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      await api.post(`/products/${form.value.base_sku}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    showModal.value = false
    fetchProducts()
  } catch (err) {
    alert(err.response?.data?.message || 'Error al guardar el producto')
  } finally {
    saving.value = false
  }
}

const showConfirmDeleteModal = ref(false)
const confirmDeleteMessage = ref('')
const productSkuToDelete = ref(null)

const triggerDeleteProduct = (sku) => {
  productSkuToDelete.value = sku
  confirmDeleteMessage.value = `¿ESTÁS SEGURO DE ELIMINAR EL PRODUCTO SKU BASE: ${sku}? ESTO BORRARÁ TODAS SUS IMÁGENES DE CLOUDINARY.`
  showConfirmDeleteModal.value = true
}

const cancelDeleteProduct = () => {
  showConfirmDeleteModal.value = false
  productSkuToDelete.value = null
}

const executeDeleteProduct = async () => {
  showConfirmDeleteModal.value = false
  if (!productSkuToDelete.value) return

  loading.value = true

  try {
    await api.delete(`/products/${productSkuToDelete.value}`)
    toast.success('El producto fue eliminado del sistema y de Cloudinary.', 'Producto eliminado')
    fetchProducts()
  } catch (err) {
    toast.error(err, 'Error al eliminar el producto')
  } finally {
    loading.value = false
    productSkuToDelete.value = null
  }
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom border-black pb-4 gap-3">
      <div>
        <h1 class="display-5 fw-black text-uppercase m-0">INVENTARIO DE PRODUCTOS</h1>
        <p class="fw-bold text-muted m-0 mt-2">Gestión de Catálogo y Stock por Sucursal</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary btn-lg fw-black text-uppercase px-4 py-3">+ NUEVO PRODUCTO</button>
    </div>

    <div class="d-flex flex-wrap gap-3 mb-4">
      <!-- Filtro por Tiendas -->
      <div class="d-flex flex-wrap gap-2 p-3 bg-light border border-black border-2 align-items-center flex-grow-1">
        <span class="fw-black text-uppercase me-2"><i class="bi bi-shop"></i> SUCURSAL DE INVENTARIO:</span>
        <button 
          @click="filterByStore('')" 
          :class="['btn fw-black border-black border-2', selectedFilterStore === '' ? 'btn-black text-white bg-black' : 'btn-outline-dark bg-white']"
        >
          TODAS LAS TIENDAS
        </button>
        <button 
          v-for="store in stores" 
          :key="store.id"
          @click="filterByStore(store.id)" 
          :class="['btn fw-black border-black border-2', selectedFilterStore === store.id ? 'btn-primary' : 'btn-outline-dark bg-white']"
        >
          {{ store.name }}
        </button>
      </div>
      
      <!-- Buscador -->
      <div class="d-flex align-items-center" style="min-width: 300px;">
        <SearchBar v-model="searchQuery" @search="handleSearch" placeholder="Buscar producto por nombre o SKU..." />
      </div>
    </div>

    <div v-if="loading && products.length === 0" class="text-center py-5">
      <div class="spinner-border text-black" style="width: 4rem; height: 4rem; border-width: 0.35em;" role="status"></div>
      <h3 class="mt-4 fw-black text-uppercase">CARGANDO INVENTARIO...</h3>
    </div>

    <div v-else class="bg-white border border-black border-2 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover table-borderless mb-0">
          <thead class="bg-secondary border-bottom border-black border-2">
            <tr>
              <th class="py-3 px-4 fw-black fs-6 text-nowrap">IMG</th>
              <th class="py-3 px-4 fw-black fs-6 text-nowrap">SKU</th>
              <th class="py-3 px-4 fw-black fs-6 w-25">NOMBRE</th>
              <th class="py-3 px-4 fw-black fs-6 text-end text-nowrap">PRECIO</th>
              <th class="py-3 px-4 fw-black fs-6 text-center text-nowrap">ESTADO</th>
              <th class="py-3 px-4 fw-black fs-6 text-center text-nowrap">STOCK</th>
              <th class="py-3 px-4 fw-black fs-6 text-center text-nowrap">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="7" class="text-center py-5 text-muted fw-black fs-4 text-uppercase">NO HAY PRODUCTOS EN ESTA TIENDA</td>
            </tr>
            <tr v-for="product in products" :key="product.sku" class="border-bottom border-black align-middle">
              <td class="px-4 py-3">
                <img :src="product.image_url || 'https://via.placeholder.com/60'" width="60" height="60" class="border border-black border-2 object-fit-cover shadow-sm">
              </td>
              <td class="px-4 py-3 fw-bold font-monospace fs-6">{{ product.sku }}</td>
              <td class="px-4 py-3 fw-black text-uppercase fs-6">{{ product.name }}</td>
              <td class="px-4 py-3 text-end fw-black fs-5 text-nowrap">S/ {{ Number(product.price).toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="badge px-3 py-2 fs-7 border border-black fw-bold" :class="product.is_available ? 'bg-success text-black' : 'bg-danger text-white'">
                  {{ product.is_available ? 'ACTIVO' : 'AGOTADO' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="badge px-3 py-2 fs-6 border border-black fw-black" :class="product.total_stock > 5 ? 'bg-warning text-black' : 'bg-danger text-white'">
                  {{ product.total_stock }}
                </span>
              </td>
              <td class="px-4 py-3 text-end text-nowrap">
                <button @click="openEditModal(product.sku)" class="btn btn-secondary fw-black me-2 px-3 m-0 shadow-none">EDITAR</button>
                <button @click="triggerDeleteProduct(product.sku)" class="btn btn-danger fw-black px-3 m-0 shadow-none">ELIMINAR</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación -->
    <div class="d-flex justify-content-between align-items-center mt-4 mb-5" v-if="lastPage > 1">
      <button @click="fetchProducts(page - 1)" :disabled="page <= 1 || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        &laquo; Anterior
      </button>
      <span class="fw-black fs-4 text-uppercase">Página {{ page }} de {{ lastPage }}</span>
      <button @click="fetchProducts(page + 1)" :disabled="page >= lastPage || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        Siguiente &raquo;
      </button>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-backdrop" style="background: rgba(0,0,0,0.85); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div class="card border-2 shadow w-100" style="max-width: 900px; max-height: 92vh; overflow-y: auto;">
        <div class="card-header bg-black text-white p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center position-sticky top-0" style="z-index: 100;">
          <h2 class="m-0 fw-black text-uppercase fs-3">{{ modalMode === 'create' ? 'NUEVO PRODUCTO EN INVENTARIO' : 'EDITAR PRODUCTO Y VARIANTES' }}</h2>
          <button @click="showModal = false" class="btn btn-danger py-2 px-3 fw-black border border-white text-white m-0 fs-5">X</button>
        </div>
        
        <div class="card-body p-4 p-md-5 bg-white">
          <form @submit.prevent="submitForm">
            <!-- DATOS BASE -->
            <h4 class="fw-black mb-3 border-bottom border-black pb-2 text-uppercase text-primary">1. Datos Principales y Clasificación</h4>
            
            <div class="row g-3 mb-4 align-items-end">
              <div class="col-md-8">
                <label class="form-label fw-black text-uppercase fs-6">NOMBRE DEL PRODUCTO (Obligatorio)</label>
                <input v-model="form.name" type="text" class="form-control form-control-lg border-black border-2 shadow-none fw-bold" placeholder="Ejem: Adidas Samba Clásico" required>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-black text-uppercase fs-6">PRECIO UNITARIO (S/)</label>
                <div class="input-group border border-black border-2">
                  <span class="input-group-text bg-secondary border-0 fw-black px-3">S/</span>
                  <input v-model="form.price" type="number" step="0.01" min="0" class="form-control border-0 shadow-none fw-bold fs-5 py-2" placeholder="0.00" required>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-black text-uppercase fs-6">CATEGORÍA (Obligatorio)</label>
                <select v-model="form.category_id" class="form-select form-select-lg border-black border-2 fw-bold bg-white shadow-none" required>
                  <option value="" disabled>Seleccione una categoría...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-black text-uppercase fs-6">SUCURSAL / TIENDA (Obligatorio)</label>
                <select v-model="form.store_id" class="form-select form-select-lg border-black border-2 fw-bold bg-white shadow-none" required>
                  <option value="" disabled>Seleccione la sucursal de registro...</option>
                  <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
                </select>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-black text-uppercase fs-6">DESCRIPCIÓN (Opcional)</label>
              <textarea v-model="form.description" class="form-control border-black border-2 shadow-none fw-bold" rows="2" placeholder="Descripción breve..."></textarea>
            </div>

            <!-- IMAGENES DINÁMICAS -->
            <h4 class="fw-black mb-3 border-bottom border-black pb-2 text-uppercase text-primary d-flex justify-content-between align-items-center mt-5">
              2. Galería de Imágenes
              <button type="button" @click="addImageBox" class="btn btn-sm btn-dark fw-black">+ AÑADIR OTRA IMAGEN</button>
            </h4>

            <!-- Existing Images when editing -->
            <div v-if="form.existing_images.length > 0" class="mb-4 p-3 bg-light border border-black border-2">
              <label class="form-label fw-black text-uppercase fs-7 mb-3 d-block">Imágenes</label>
              <div class="d-flex flex-wrap gap-3">
                <div v-for="(img, idx) in form.existing_images" :key="img.id" class="position-relative border border-black border-2 bg-white p-2 text-center" style="width: 140px;">
                  <img :src="img.image_url" class="object-fit-cover w-100 mb-2 border border-black" style="height: 100px;">
                  <span v-if="img.is_primary" class="badge bg-warning text-black mb-2 d-block border border-black fw-bold fs-8">PORTADA</span>
                  <button type="button" @click="deleteExistingImage(img.image_url, idx)" class="btn btn-sm btn-danger fw-black w-100 fs-8">ELIMINAR</button>
                </div>
              </div>
            </div>

            <!-- New Image sequential input boxes -->
            <div class="mb-5 p-3 bg-light border border-black border-2">
              <label class="form-label fw-black text-uppercase fs-7 mb-3 d-block">Nuevas Imágenes</label>
              
              <div v-for="(box, idx) in form.new_image_boxes" :key="idx" class="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-3 pb-3 border-bottom border-black">
                <div class="flex-grow-1">
                  <label class="form-label fw-bold fs-7 mb-1">Imagen #{{ idx + 1 }} {{ idx === 0 && form.existing_images.length === 0 ? '(Será la Portada)' : '' }}</label>
                  <input type="file" @change="(e) => handleImageFileChange(e, idx)" class="form-control border-black shadow-none fw-bold bg-white" accept="image/*">
                </div>
                
                <div v-if="box.preview" class="border border-black bg-white p-1" style="width: 70px; height: 70px;">
                  <img :src="box.preview" class="w-100 h-100 object-fit-cover">
                </div>

                <button type="button" @click="removeImageBox(idx)" class="btn btn-danger fw-black border-black border-2 m-0 px-3 py-2 align-self-sm-end" :disabled="form.new_image_boxes.length === 1 && !box.file">
                  X
                </button>
              </div>
            </div>

            <!-- VARIANTES -->
            <h4 class="fw-black mb-3 border-bottom border-black pb-2 text-uppercase text-primary d-flex justify-content-between align-items-center mt-5">
              3. Gestión de Tallas y Stock
              <button type="button" @click="addVariant" class="btn btn-sm btn-dark fw-black">+ AÑADIR TALLA / VARIANTE</button>
            </h4>

            <div v-for="(v, idx) in form.variants" :key="idx" class="row g-2 mb-3 align-items-end bg-light p-3 border border-black border-2 mx-0 position-relative">
              <div class="col-md-3">
                <label class="form-label fw-black fs-6 m-0 mb-1">TALLA (Opcional)</label>
                <input v-model="v.size" type="text" class="form-control border-black fw-bold" placeholder="Ejem: 40 o M">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-black fs-6 m-0 mb-1">COLOR (Opcional)</label>
                <input v-model="v.color" type="text" class="form-control border-black fw-bold" placeholder="Ejem: NEGRO">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-black fs-6 m-0 mb-1">STOCK SUCURSAL SELECCIONADA</label>
                <input v-model="v.stock" type="number" min="0" class="form-control border-black fw-bold" required>
              </div>
              <div class="col-md-2 text-end">
                <button type="button" @click="removeVariant(idx)" class="btn btn-danger fw-black w-100 border-black border-2 m-0" :disabled="form.variants.length === 1">X</button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-4 mt-4 fw-black text-uppercase fs-4 m-0 shadow" :disabled="saving">
              {{ saving ? 'GUARDANDO DATOS E IMÁGENES...' : (modalMode === 'create' ? 'REGISTRAR PRODUCTO EN SUCURSAL' : 'GUARDAR CAMBIOS') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Brutalista de Confirmación de Eliminación -->
    <div v-if="showConfirmDeleteModal" class="modal-backdrop" style="background: rgba(0,0,0,0.8); z-index: 1100;">
      <div class="card border-black border-4 shadow-solid p-5 bg-white text-center" style="max-width: 500px; width: 100%;">
        <div class="text-danger mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
            <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
          </svg>
        </div>
        <h3 class="fw-black text-uppercase mb-3">¿CONFIRMAR ELIMINACIÓN?</h3>
        <p class="fs-5 fw-bold text-muted mb-4">{{ confirmDeleteMessage }}</p>
        <div class="d-flex gap-3 justify-content-center">
          <button type="button" @click="cancelDeleteProduct" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
          <button type="button" @click="executeDeleteProduct" class="btn btn-danger py-3 px-4 fw-black fs-5">SÍ, ELIMINAR</button>
        </div>
      </div>
    </div>
  </div>
</template>
