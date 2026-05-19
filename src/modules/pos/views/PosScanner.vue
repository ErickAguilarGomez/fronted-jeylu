<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { QrcodeStream } from 'vue3-qrcode-reader'
import api from '@/plugins/axios'
import { authStore } from '@/modules/auth/stores/authStore.js'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const cart = ref([])
const loadingItem = ref(false)
const scanning = ref(true)

// Customers
const users = ref([])
const customerId = ref('')
const customerName = ref('')

// Stores for Admin
const stores = ref([])
const selectedStoreId = ref('')

// Sale processing
const processingSale = ref(false)
const saleSuccess = ref(false)

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const fetchUsers = async () => {
  try {
    const res = await api.get('/users', { params: { all: 1 } })
    if (res.data && res.data.success) {
      users.value = res.data.users
    }
  } catch (e) {
    console.error('Error cargando usuarios:', e)
  }
}

const fetchStores = async () => {
  if (authStore.user?.role_id !== 1) return;
  try {
    const res = await api.get('/stores')
    if (res.data && res.data.success) {
      stores.value = res.data.stores || res.data.data || []
    }
  } catch (e) {
    console.error('Error cargando tiendas:', e)
  }
}

onMounted(() => {
  fetchUsers()
  fetchStores()
})

const onDetect = async (result) => {
  const sku = result[0]?.rawValue;
  if (!sku) return;
  
  // Pausar escaneo momentáneamente
  scanning.value = false;
  
  await addProductBySku(sku);
  
  // Reanudar escaneo después de un breve tiempo
  setTimeout(() => {
    scanning.value = true;
  }, 1500);
}

const manualSku = ref('')
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const showDropdown = ref(false)
const selectedBaseProduct = ref(null)
const showVariantModal = ref(false)
let searchTimeout = null

const handleSearchInput = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showDropdown.value = false
    return
  }
  
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      const res = await api.get('/products', {
        params: { search: searchQuery.value.trim(), per_page: 15 }
      })
      if (res.data && res.data.success) {
        searchResults.value = res.data.data
        showDropdown.value = searchResults.value.length > 0
      }
    } catch (e) {
      console.error('Error buscando productos:', e)
    } finally {
      searching.value = false
    }
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showDropdown.value = false
}

const selectProductFromSearch = async (product) => {
  showDropdown.value = false
  searchQuery.value = ''
  await addProductBySku(product.sku)
}

const selectVariant = async (variant) => {
  showVariantModal.value = false
  await addProductBySku(variant.sku)
}

const addManualSku = async () => {
  if (!searchQuery.value.trim()) return;
  await addProductBySku(searchQuery.value.trim());
  searchQuery.value = '';
  showDropdown.value = false;
}

const addProductBySku = async (sku) => {
  if (authStore.user?.role_id === 1 && !selectedStoreId.value) {
    toast.warning('Debe seleccionar una sucursal de origen antes de agregar productos al carrito.', 'Seleccione Sucursal')
    return;
  }
  if (authStore.user?.role_id === 2 && !authStore.user?.primary_store) {
    toast.error('No tiene ninguna sucursal asignada para realizar ventas.', 'Acceso Denegado')
    return;
  }

  // Verificar si ya está en el carrito
  const existingItem = cart.value.find(item => item.sku === sku);
  
  loadingItem.value = true;
  
  try {
    const params = {}
    if (authStore.user?.role_id === 1 && selectedStoreId.value) {
      params.store_id = selectedStoreId.value;
    }
    const response = await api.get(`/products/${sku}`, { params });
    const product = response.data.data;
    
    // Si la respuesta no es una variante, mostrar modal para seleccionar variante
    if (!product.variant_sku) {
       if (product.variants && product.variants.length > 0) {
         selectedBaseProduct.value = product;
         showVariantModal.value = true;
       } else {
         toast.warning(`El producto "${product.name}" no tiene variantes disponibles.`, 'Sin variantes')
       }
       return;
    }

    if (product.stock <= 0) {
      toast.warning(`"${product.name}" no tiene stock disponible en esta tienda.`, 'Sin stock')
      return;
    }

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.warning(`Stock máximo alcanzado para "${product.name}". Solo hay ${product.stock} unidad(es).`, 'Límite de stock')
        return;
      }
      existingItem.quantity++;
    } else {
      let displayName = product.name;
      if (product.size) displayName += ` - Talla: ${product.size}`;
      if (product.color) displayName += ` - Color: ${product.color}`;

      cart.value.push({
        sku: product.variant_sku,
        name: displayName,
        price: Number(product.price),
        stock: product.stock,
        quantity: 1,
        image: product.image_url
      });
      toast.success(`"${product.name}" añadido al carrito.`, 'Producto añadido', 2000)
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      toast.error(`No se encontró ningún producto con SKU: ${sku}`, 'Producto no encontrado')
    } else {
      toast.error(error, 'Error al buscar producto')
    }
  } finally {
    loadingItem.value = false;
  }
}

const increaseQuantity = (item) => {
  if (item.quantity < item.stock) {
    item.quantity++;
  }
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  }
}

const removeItem = (sku) => {
  cart.value = cart.value.filter(item => item.sku !== sku);
}

const processSale = async () => {
  if (cart.value.length === 0) {
    toast.warning('Añade al menos un producto al carrito antes de procesar.', 'Carrito vacío')
    return;
  }

  if (authStore.user?.role_id === 1 && !selectedStoreId.value) {
    toast.warning('Debe seleccionar una sucursal de origen antes de procesar la venta.', 'Seleccione Sucursal')
    return;
  }

  if (authStore.user?.role_id === 2 && !authStore.user?.primary_store) {
    toast.error('No tiene ninguna sucursal asignada para realizar ventas.', 'Acceso Denegado')
    return;
  }
  
  processingSale.value = true;
  
  try {
    const payload = {
      items: cart.value.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }))
    };

    if (customerId.value) payload.customer_id = customerId.value;
    if (customerName.value) payload.customer_name = customerName.value;
    if (authStore.user?.role_id === 1 && selectedStoreId.value) {
      payload.store_id = selectedStoreId.value;
    }
    
    await api.post('/sales', payload);
    
    toast.success('La venta fue registrada exitosamente. Comprobante generado.', '¡Venta completada!', 5000)
    cart.value = [];
    customerId.value = '';
    customerName.value = '';
    selectedStoreId.value = '';
    saleSuccess.value = true;
    setTimeout(() => { saleSuccess.value = false; }, 3000);
    
  } catch (error) {
    toast.error(error, 'Error al procesar la venta')
  } finally {
    processingSale.value = false;
  }
}

watch(selectedStoreId, (newStore, oldStore) => {
  if (oldStore && cart.value.length > 0) {
    cart.value = [];
    toast.info('Se ha cambiado la sucursal. El carrito ha sido limpiado para evitar inconsistencias de stock.', 'Carrito Reiniciado')
  }
})
</script>

<template>
  <div class="container-fluid py-4 px-lg-5">
    <!-- Banner de Sucursal Asignada para Vendedores -->
    <div v-if="authStore.user?.role_id === 2 && authStore.user?.primary_store" class="alert bg-warning border-black border-3 shadow-solid mb-4 p-4 d-flex align-items-center gap-3" style="box-shadow: 6px 6px 0px #000 !important;">
      <span class="fs-1">🏪</span>
      <div>
        <h4 class="fw-black text-uppercase m-0">SUCURSAL ASIGNADA: {{ authStore.user.primary_store.name.toUpperCase() }}</h4>
        <p class="m-0 fw-bold text-black-50">{{ authStore.user.primary_store.address.toUpperCase() }}</p>
      </div>
    </div>

    <!-- Si el Vendedor no tiene sucursal asignada -->
    <div v-if="authStore.user?.role_id === 2 && !authStore.user?.primary_store" class="alert bg-danger text-white border-black border-3 shadow-solid mb-4 p-4 d-flex align-items-center gap-3" style="box-shadow: 6px 6px 0px #000 !important;">
      <span class="fs-1">⚠️</span>
      <div>
        <h4 class="fw-black text-uppercase m-0">SIN SUCURSAL ASIGNADA</h4>
        <p class="m-0 fw-bold text-white-50">Por favor, solicite a un administrador que le asigne una sucursal para poder procesar ventas.</p>
      </div>
    </div>

    <div class="row g-4 align-items-stretch">
      
      <!-- SCANNER SECTION -->
      <div class="col-lg-6 d-flex flex-column">
        <div class="card h-100 flex-grow-1 border-2">
          <div class="card-header bg-black text-white p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center">
            <h2 class="m-0 text-uppercase fw-black fs-3">ESCANER POS</h2>
            <span v-if="!scanning" class="badge bg-warning text-black fs-6 border border-black shadow-sm">PAUSADO</span>
            <span v-else class="badge bg-success text-black fs-6 border border-black shadow-sm">ACTIVO</span>
          </div>
          
          <div class="card-body p-4 d-flex flex-column">
            
            <div class="scanner-wrapper border border-black border-4 mb-4 position-relative bg-secondary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center" style="min-height: 350px; overflow: hidden;">
              <QrcodeStream v-if="scanning" @detect="onDetect" :track="true" />
              <div v-else class="text-center p-4">
                <div class="spinner-border text-black mb-3" style="width: 3rem; height: 3rem; border-width: 0.3em;" role="status"></div>
                <h3 class="fw-black text-uppercase m-0">PROCESANDO CÓDIGO...</h3>
              </div>
            </div>
            
            <div v-if="errorMsg" class="alert bg-danger text-white border-black border-2 fw-bold text-uppercase mb-4 shadow-none">
              {{ errorMsg }}
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
                <div v-else-if="searchResults.length === 0" class="p-4 text-center fw-bold fs-5 text-muted bg-light">NO SE ENCONTRARON COINCIDENCIAS</div>
                <div v-for="item in searchResults" :key="item.sku" @click="selectProductFromSearch(item)" class="dropdown-item p-3 border-bottom border-black d-flex align-items-center gap-3 cursor-pointer transition-bg">
                  <img :src="item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'" class="border border-black border-2 object-fit-cover shadow-sm" style="width: 60px; height: 60px;">
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="fw-black text-uppercase fs-5 text-truncate">{{ item.name }}</div>
                    <div class="text-muted fs-6 font-monospace">SKU: {{ item.sku }}</div>
                  </div>
                  <div class="text-end ms-3">
                    <div class="fw-black fs-4">S/ {{ Number(item.price).toFixed(2) }}</div>
                    <span :class="['badge border border-black fs-7 fw-bold', item.total_stock > 0 ? 'bg-warning text-black' : 'bg-danger text-white']">
                      STOCK: {{ item.total_stock }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- CART SECTION -->
      <div class="col-lg-6 d-flex flex-column">
        <div class="card h-100 d-flex flex-column border-2">
          <div class="card-header bg-secondary p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center">
            <h2 class="m-0 text-uppercase fw-black fs-3">CARRITO</h2>
            <span class="badge bg-black text-white fs-5 border border-black shadow-sm px-3 py-2">{{ cart.length }} ITEMS</span>
          </div>
          
          <div class="card-body p-0 flex-grow-1 bg-white" style="overflow-y: auto; max-height: 45vh; min-height: 250px;">
            
            <div v-if="saleSuccess" class="alert bg-success border-bottom border-black border-2 p-5 text-center m-0 d-flex flex-column align-items-center justify-content-center h-100">
              <h1 class="fw-black m-0 text-black text-uppercase" style="font-size: 3rem;">¡VENTA ÉXITOSA!</h1>
              <p class="fw-bold mt-3 text-black fs-5">El inventario ha sido actualizado.</p>
            </div>
            
            <div v-else-if="cart.length === 0" class="p-5 text-center text-muted d-flex flex-column justify-content-center h-100 bg-light">
              <h1 class="fw-black text-uppercase text-secondary mb-3" style="font-size: 4rem;">VACÍO</h1>
              <h4 class="fw-bold text-uppercase text-black">Escanea un QR o busca un producto</h4>
            </div>
            
            <div v-else class="list-group list-group-flush">
              <div v-for="item in cart" :key="item.sku" class="list-group-item p-4 border-bottom border-black border-2 bg-white">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex align-items-center gap-4">
                    <img :src="item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'" class="border border-black border-2 object-fit-cover shadow-sm" style="width: 80px; height: 80px;">
                    <div>
                      <h4 class="fw-black text-uppercase m-0 mb-1">{{ item.name }}</h4>
                      <span class="badge bg-secondary text-black fw-bold fs-7 font-monospace border border-black">SKU: {{ item.sku }}</span>
                    </div>
                  </div>
                  <div class="text-end">
                    <h3 class="fw-black m-0">S/ {{ (item.price * item.quantity).toFixed(2) }}</h3>
                  </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center bg-light p-3 mt-3 border border-black border-2 shadow-sm">
                  <div class="d-flex align-items-center gap-3">
                    <span class="fw-black text-uppercase fs-6 m-0">CANTIDAD:</span>
                    <div class="d-flex align-items-center bg-white border border-black border-2 shadow-sm" style="height: 45px;">
                      <button @click="decreaseQuantity(item)" class="btn rounded-0 border-0 fw-black fs-4 px-3 h-100 d-flex align-items-center justify-content-center bg-light" style="width: 45px;" :disabled="item.quantity <= 1">-</button>
                      <div class="fw-black fs-5 px-3 text-center d-flex align-items-center justify-content-center border-start border-end border-black border-2 h-100 bg-white text-black" style="min-width: 60px;">{{ item.quantity }}</div>
                      <button @click="increaseQuantity(item)" class="btn rounded-0 border-0 fw-black fs-4 px-3 h-100 d-flex align-items-center justify-content-center bg-light" style="width: 45px;" :disabled="item.quantity >= item.stock">+</button>
                    </div>
                  </div>
                  <button @click="removeItem(item.sku)" class="btn btn-danger fw-black py-2 px-4 m-0 border border-black border-2 shadow-sm fs-6 d-flex align-items-center gap-2">
                    X ELIMINAR
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-footer bg-secondary p-4 border-top border-black border-2 mt-auto">
            <div class="bg-white border border-black border-2 p-3 mb-4 shadow-sm">
               <label class="fw-black text-uppercase mb-2 fs-5">Datos del Cliente (Opcional)</label>
               <input v-model="customerName" type="text" class="form-control border-black border-2 fw-bold p-3 fs-5 mb-3" placeholder="Nombre completo o DNI / RUC">
               
               <label class="fw-bold text-uppercase mb-1 fs-6 text-muted">O buscar usuario registrado:</label>
               <SearchableSelect
                 v-model="customerId"
                 :options="users"
                 placeholder="Escriba nombre o email para buscar..."
                 :required="false"
               />
            </div>

            <div v-if="authStore.user?.role_id === 1" class="bg-white border border-black border-2 p-3 mb-4 shadow-sm">
               <label class="fw-black text-uppercase mb-2 fs-5">Sucursal de Origen (Solo Administrador)</label>
               <SearchableSelect
                 v-model="selectedStoreId"
                 :options="stores"
                 placeholder="Buscar y seleccionar sucursal..."
                 :required="false"
               />
            </div>

            <div class="d-flex justify-content-between align-items-end mb-4 bg-white border border-black border-2 p-3 shadow-sm">
              <h2 class="fw-black text-uppercase m-0">TOTAL</h2>
              <h1 class="fw-black m-0 text-black text-uppercase" style="font-size: 3rem;">S/ {{ cartTotal.toFixed(2) }}</h1>
            </div>
            <button 
              @click="processSale" 
              class="btn btn-primary w-100 py-4 fw-black text-uppercase m-0"
              style="font-size: 1.5rem;"
              :disabled="cart.length === 0 || processingSale"
            >
              {{ processingSale ? 'PROCESANDO TRANSACCIÓN...' : 'CONFIRMAR VENTA POS' }}
            </button>
          </div>
          
        </div>
      </div>
      
    </div>

    <!-- Modal Brutalista de Selección de Variantes -->
    <div v-if="showVariantModal && selectedBaseProduct" class="modal-backdrop" @click.self="showVariantModal = false">
      <div class="modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative" style="max-width: 750px;">
        <button @click="showVariantModal = false" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
        <div class="d-flex align-items-center gap-4 mb-4 border-bottom border-black pb-4">
          <img :src="selectedBaseProduct.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'" class="border border-black border-2 object-fit-cover shadow-sm" style="width: 90px; height: 90px;">
          <div>
            <h2 class="display-6 fw-black text-uppercase m-0">{{ selectedBaseProduct.name }}</h2>
            <span class="badge bg-secondary text-black fs-6 font-monospace border border-black mt-1">SKU BASE: {{ selectedBaseProduct.sku }}</span>
          </div>
        </div>
        
        <h4 class="fw-black text-uppercase mb-4">SELECCIONAR VARIANTE DISPONIBLE</h4>
        <div class="row g-3 mb-4 max-vh-50 overflow-y-auto p-1">
          <div v-for="variant in selectedBaseProduct.variants" :key="variant.sku" class="col-md-6">
            <button 
              @click="selectVariant(variant)" 
              :class="['btn w-100 p-4 text-start border border-black border-3 d-flex justify-content-between align-items-center shadow-sm', variant.stock > 0 ? 'bg-white hover-highlight' : 'bg-secondary text-muted']"
              :disabled="variant.stock <= 0"
              style="transition: transform 0.1s, box-shadow 0.1s;"
            >
              <div>
                <div class="fw-black fs-5 text-uppercase">
                  <span v-if="variant.size">TALLA: {{ variant.size }} </span>
                  <span v-if="variant.color" :class="variant.size ? 'ms-2' : ''">COLOR: {{ variant.color }}</span>
                  <span v-if="!variant.size && !variant.color">VARIANTE #{{ variant.id }}</span>
                </div>
                <div class="fs-7 font-monospace text-muted mt-1">{{ variant.sku }}</div>
              </div>
              <span :class="['badge border border-black fs-6 px-3 py-2', variant.stock > 0 ? 'bg-black text-white shadow-sm' : 'bg-danger text-white']">
                {{ variant.stock > 0 ? `STOCK: ${variant.stock}` : 'AGOTADO' }}
              </span>
            </button>
          </div>
        </div>
        
        <div class="d-flex justify-content-end mt-2">
          <button @click="showVariantModal = false" class="btn btn-secondary py-3 px-5 fw-black fs-5 border border-black shadow-sm">CANCELAR</button>
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
.hover-highlight:hover {
  transform: translate(-3px, -3px);
  box-shadow: 4px 4px 0px #000 !important;
  background-color: #ffde59 !important;
}
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}
.modal-card {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
