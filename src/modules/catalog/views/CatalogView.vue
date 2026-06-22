<script setup>
import { onMounted, computed } from 'vue'
import { catalogStore } from '../stores/catalogStore.js'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'

const searchProducts = () => {
  catalogStore.fetchProducts(1)
}

const selectCategory = (categoryId) => {
  catalogStore.selectedCategoryId = categoryId
  catalogStore.fetchProducts(1)
}

const totalProductsCount = computed(() => {
  return catalogStore.categories.reduce((acc, cat) => acc + (cat.products_count || 0), 0)
})

onMounted(() => {
  catalogStore.fetchCategories()
  catalogStore.fetchProducts()
})
</script>

<template>
  <div class="container py-4">
    <!-- Header / Search bar -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3 border-bottom border-black pb-4">
      <h1 class="display-4 m-0 text-uppercase fw-black">Catálogo</h1>
      
      <div class="input-group border border-black border-2" style="max-width: 400px; box-shadow: 4px 4px 0px #000;">
        <input 
          v-model="catalogStore.searchQuery" 
          @keyup.enter="searchProducts"
          type="text" 
          class="form-control border-0 fw-bold shadow-none" 
          placeholder="BUSCAR PRODUCTOS O SKU..."
        >
        <button @click="searchProducts" class="btn btn-primary border-0 fw-black px-4 m-0 shadow-none">BUSCAR</button>
      </div>
    </div>

    <!-- Mobile categories chips -->
    <div class="d-md-none d-flex overflow-auto text-nowrap gap-2 pb-3 mb-4 px-1" style="scrollbar-width: none; -ms-overflow-style: none;">
      <button 
        @click="selectCategory(null)" 
        :class="['btn fw-black border-black border-2 fs-7 px-3 py-2 m-0', catalogStore.selectedCategoryId === null ? 'btn-black text-white bg-black' : 'btn-outline-dark bg-white']"
      >
        TODAS ({{ totalProductsCount }})
      </button>
      <button 
        v-for="cat in catalogStore.categories" 
        :key="cat.id"
        @click="selectCategory(cat.id)"
        :class="['btn fw-black border-black border-2 fs-7 px-3 py-2 m-0', catalogStore.selectedCategoryId === cat.id ? 'btn-primary' : 'btn-outline-dark bg-white']"
      >
        {{ cat.name.toUpperCase() }} ({{ cat.products_count || 0 }})
      </button>
    </div>

    <div class="row g-4 align-items-start">
      <!-- Desktop Sidebar -->
      <div class="col-md-3 d-none d-md-block position-sticky" style="top: 24px;">
        <div class="card border-black border-3 p-4 bg-white shadow-solid">
          <h3 class="fw-black text-uppercase mb-4 border-bottom border-black pb-2 fs-4">CATEGORÍAS</h3>
          <div class="d-flex flex-column gap-2">
            <button 
              @click="selectCategory(null)" 
              :class="['btn w-100 text-start fw-black border-black border-2 px-3 py-3 d-flex justify-content-between align-items-center transition m-0', catalogStore.selectedCategoryId === null ? 'btn-black text-white bg-black shadow-none' : 'btn-outline-dark bg-white hover-btn']"
            >
              <span>TODAS</span>
              <span class="badge border border-black bg-light text-black fw-bold">{{ totalProductsCount }}</span>
            </button>
            <button 
              v-for="cat in catalogStore.categories" 
              :key="cat.id"
              @click="selectCategory(cat.id)"
              :class="['btn w-100 text-start fw-black border-black border-2 px-3 py-3 d-flex justify-content-between align-items-center transition m-0', catalogStore.selectedCategoryId === cat.id ? 'btn-primary text-black shadow-none' : 'btn-outline-dark bg-white hover-btn']"
            >
              <span>{{ cat.name.toUpperCase() }}</span>
              <span class="badge border border-black bg-light text-black fw-bold">{{ cat.products_count || 0 }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Catalog Main Content -->
      <div class="col-md-9 col-12">
        <div v-if="catalogStore.loading" class="text-center py-5">
          <div class="spinner-border text-black" style="width: 4rem; height: 4rem; border-width: 0.35em;" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <h3 class="mt-4 fw-black text-uppercase">CARGANDO CATÁLOGO...</h3>
        </div>

        <div v-else-if="catalogStore.error" class="alert bg-danger text-white border-black border-2 d-flex align-items-center gap-3">
          <h4 class="m-0 fw-black">ERROR</h4>
          <p class="m-0 fw-bold">{{ catalogStore.error }}</p>
        </div>

        <div v-else-if="catalogStore.products.length === 0" class="text-center py-5 border border-black border-2 p-5 bg-light shadow-solid">
          <h2 class="fw-black text-muted text-uppercase m-0">No hay productos disponibles en esta categoría.</h2>
        </div>

        <template v-else>
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
            <div class="col" v-for="product in catalogStore.products.filter(p => p.is_available)" :key="product.sku">
              <ProductCard :product="product" />
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="catalogStore.lastPage > 1" class="d-flex justify-content-center gap-3 mb-5">
            <button 
              @click="catalogStore.fetchProducts(catalogStore.page - 1)" 
              :disabled="catalogStore.page === 1"
              class="btn btn-secondary fw-black px-4 py-2"
            >
              &laquo; ANTERIOR
            </button>
            <button 
              class="btn border border-black border-2 fw-black bg-white px-4 shadow-none" 
              style="cursor: default;"
            >
              PÁGINA {{ catalogStore.page }} / {{ catalogStore.lastPage }}
            </button>
            <button 
              @click="catalogStore.fetchProducts(catalogStore.page + 1)" 
              :disabled="catalogStore.page === catalogStore.lastPage"
              class="btn btn-primary fw-black px-4 py-2"
            >
              SIGUIENTE &raquo;
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 6px 6px 0px 0px #000000 !important;
}
.hover-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0px #000000 !important;
  background-color: #ffde59 !important;
  color: #000000 !important;
}
.d-flex.overflow-auto::-webkit-scrollbar {
  display: none;
}
</style>
