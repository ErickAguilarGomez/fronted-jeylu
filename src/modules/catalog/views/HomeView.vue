<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'

const products = ref([])
const loading = ref(true)
const error = ref(null)
const page = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')

const fetchProducts = async (pageNumber = 1) => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/products', {
      params: {
        page: pageNumber,
        per_page: 8,
        search: searchQuery.value
      }
    })
    products.value = response.data.data
    page.value = response.data.meta.current_page
    lastPage.value = response.data.meta.last_page
  } catch (err) {
    error.value = 'No se pudieron cargar los productos. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

const searchProducts = () => {
  fetchProducts(1)
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3 border-bottom border-black pb-4">
      <h1 class="display-4 m-0 text-uppercase fw-black">Novedades</h1>
      
      <div class="input-group border border-black border-2" style="max-width: 400px; box-shadow: 4px 4px 0px #000;">
        <input 
          v-model="searchQuery" 
          @keyup.enter="searchProducts"
          type="text" 
          class="form-control border-0 fw-bold shadow-none" 
          placeholder="BUSCAR PRODUCTOS O SKU..."
        >
        <button @click="searchProducts" class="btn btn-primary border-0 fw-black px-4 m-0 shadow-none">BUSCAR</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-black" style="width: 4rem; height: 4rem; border-width: 0.35em;" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <h3 class="mt-4 fw-black text-uppercase">CARGANDO INVENTARIO...</h3>
    </div>

    <div v-else-if="error" class="alert bg-danger text-white border-black border-2 d-flex align-items-center gap-3">
      <h4 class="m-0 fw-black">ERROR</h4>
      <p class="m-0 fw-bold">{{ error }}</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-5 border border-black border-2 p-5 bg-secondary shadow">
      <h2 class="fw-black text-muted text-uppercase m-0">NO SE ENCONTRARON PRODUCTOS</h2>
    </div>

    <template v-else>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
        <div class="col" v-for="product in products.filter(p => p.is_available)" :key="product.sku">
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- Paginación Brutalista -->
      <div v-if="lastPage > 1" class="d-flex justify-content-center gap-3 mb-5">
        <button 
          @click="fetchProducts(page - 1)" 
          :disabled="page === 1"
          class="btn btn-secondary fw-black px-4 py-2"
        >
          &laquo; ANTERIOR
        </button>
        <button 
          class="btn border border-black border-2 fw-black bg-white px-4 shadow-none" 
          style="cursor: default;"
        >
          PÁGINA {{ page }} / {{ lastPage }}
        </button>
        <button 
          @click="fetchProducts(page + 1)" 
          :disabled="page === lastPage"
          class="btn btn-primary fw-black px-4 py-2"
        >
          SIGUIENTE &raquo;
        </button>
      </div>
    </template>
  </div>
</template>
