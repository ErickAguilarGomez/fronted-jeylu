<script setup>
import { onMounted, computed, ref } from 'vue'
import { catalogStore } from '../stores/catalogStore.js'
import ProductCard from '@/modules/catalog/components/ProductCard.vue'

const inStockOnly = ref(false)

const searchProducts = () => {
  catalogStore.fetchProducts(1)
}

const selectCategory = (categoryId) => {
  catalogStore.selectedCategoryId = categoryId
  catalogStore.fetchProducts(1)
}

const totalProductsCount = computed(() => {
  return catalogStore.categories.reduce((acc, cat) => acc + Number(cat.products_count || 0), 0)
})

const filteredProducts = computed(() => {
  if (!inStockOnly.value) return catalogStore.products
  return catalogStore.products.filter(p => p.is_available)
})

onMounted(() => {
  catalogStore.fetchCategories()
  catalogStore.fetchProducts()
})
</script>

<template>
  <div class="amazon-catalog-page py-3">
    <div class="container-fluid px-3 px-lg-4">
      
      <!-- Top Amazon Results Subheader Bar -->
      <div class="card mb-3 p-3 bg-white border-0 shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div class="results-count-text">
          <span class="text-muted small">
            {{ filteredProducts.length }} de {{ totalProductsCount }} productos
          </span>
          <span v-if="catalogStore.searchQuery" class="fw-bold ms-1 text-danger">
            para "{{ catalogStore.searchQuery }}"
          </span>
          <span v-else-if="catalogStore.selectedCategoryId" class="fw-bold ms-1 text-dark">
            en {{ catalogStore.categories.find(c => c.id === catalogStore.selectedCategoryId)?.name }}
          </span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <!-- In stock toggle -->
          <div class="form-check form-switch m-0">
            <input 
              v-model="inStockOnly" 
              class="form-check-input cursor-pointer" 
              type="checkbox" 
              role="switch" 
              id="inStockSwitch"
            />
            <label class="form-check-label small fw-semibold text-muted cursor-pointer" for="inStockSwitch">
              Solo productos en stock
            </label>
          </div>
        </div>
      </div>

      <!-- Main Layout: Sidebar Categories Filter + Products Grid -->
      <div class="row g-4 align-items-start">
        
        <!-- Left Sidebar (Categorías / Departamentos) -->
        <aside class="col-lg-3 col-xl-2 d-none d-lg-block">
          <div class="card p-3 bg-white border-0 shadow-sm position-sticky" style="top: 80px;">
            
            <!-- Category Filter Group -->
            <div>
              <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-grid-fill text-warning"></i>
                <span>Categorías</span>
              </h6>
              <ul class="list-unstyled d-flex flex-column gap-1 mb-0 amazon-facet-list">
                <li>
                  <a 
                    href="#" 
                    @click.prevent="selectCategory(null)"
                    :class="['facet-link d-flex justify-content-between align-items-center py-2 px-2 rounded text-decoration-none', catalogStore.selectedCategoryId === null ? 'fw-bold text-dark active-facet' : 'text-muted']"
                  >
                    <span>Todas las categorías</span>
                    <span class="badge bg-light text-muted border">{{ totalProductsCount }}</span>
                  </a>
                </li>
                <li v-for="cat in catalogStore.categories" :key="cat.id">
                  <a 
                    href="#" 
                    @click.prevent="selectCategory(cat.id)"
                    :class="['facet-link d-flex justify-content-between align-items-center py-2 px-2 rounded text-decoration-none', catalogStore.selectedCategoryId === cat.id ? 'fw-bold text-dark active-facet' : 'text-muted']"
                  >
                    <span class="text-truncate me-2">{{ cat.name }}</span>
                    <span class="badge bg-light text-muted border">{{ cat.products_count || 0 }}</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </aside>

        <!-- Right: Products Grid -->
        <main class="col-lg-9 col-xl-10 col-12">
          
          <!-- Mobile Horizontal Category Chips -->
          <div class="d-lg-none d-flex overflow-x-auto text-nowrap gap-2 pb-2 mb-3">
            <button 
              @click="selectCategory(null)" 
              :class="['btn btn-sm rounded-pill px-3', catalogStore.selectedCategoryId === null ? 'btn-dark' : 'btn-outline-secondary bg-white']"
            >
              Todas ({{ totalProductsCount }})
            </button>
            <button 
              v-for="cat in catalogStore.categories" 
              :key="cat.id" 
              @click="selectCategory(cat.id)"
              :class="['btn btn-sm rounded-pill px-3', catalogStore.selectedCategoryId === cat.id ? 'btn-amazon-primary' : 'btn-outline-secondary bg-white']"
            >
              {{ cat.name }} ({{ cat.products_count || 0 }})
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="catalogStore.loading" class="card bg-white p-5 text-center shadow-sm border-0">
            <div class="spinner-border text-warning mx-auto" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <h5 class="mt-3 text-muted">Buscando productos en JEILU...</h5>
          </div>

          <!-- Error State -->
          <div v-else-if="catalogStore.error" class="alert alert-danger shadow-sm d-flex align-items-center gap-3">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-danger"></i>
            <div>
              <strong>Error al consultar el catálogo:</strong>
              <div>{{ catalogStore.error }}</div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="card bg-white p-5 text-center shadow-sm border-0">
            <i class="bi bi-search fs-1 text-muted opacity-50 mb-3"></i>
            <h4 class="fw-bold text-dark">No se encontraron productos coincidentes</h4>
            <p class="text-muted small">Intenta buscar con otros términos o cambia el filtro de categoría.</p>
            <div>
              <button @click="selectCategory(null); catalogStore.searchQuery = ''; searchProducts()" class="btn btn-amazon-primary px-4 py-2">
                Ver todas las categorías
              </button>
            </div>
          </div>

          <!-- Products Grid (Amazon Style) -->
          <template v-else>
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3 mb-4">
              <div class="col" v-for="product in filteredProducts" :key="product.sku">
                <ProductCard :product="product" />
              </div>
            </div>

            <!-- Amazon Clean Pagination -->
            <nav v-if="catalogStore.lastPage > 1" class="d-flex justify-content-center my-5" aria-label="Paginación del Catálogo">
              <ul class="pagination shadow-sm bg-white rounded-3 p-1">
                <li class="page-item" :class="{ disabled: catalogStore.page === 1 }">
                  <button 
                    class="page-link border-0 text-dark fw-semibold" 
                    @click="catalogStore.fetchProducts(catalogStore.page - 1)"
                    :disabled="catalogStore.page === 1"
                  >
                    &laquo; Anterior
                  </button>
                </li>
                
                <li class="page-item active">
                  <span class="page-link bg-warning text-dark border-0 fw-bold">
                    Página {{ catalogStore.page }} de {{ catalogStore.lastPage }}
                  </span>
                </li>

                <li class="page-item" :class="{ disabled: catalogStore.page === catalogStore.lastPage }">
                  <button 
                    class="page-link border-0 text-dark fw-semibold" 
                    @click="catalogStore.fetchProducts(catalogStore.page + 1)"
                    :disabled="catalogStore.page === catalogStore.lastPage"
                  >
                    Siguiente &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </template>

        </main>
      </div>

    </div>
  </div>
</template>

<style scoped>
.amazon-catalog-page {
  min-height: 80vh;
}

.results-count-text {
  font-size: 0.95rem;
}

.amazon-facet-list .facet-link {
  font-size: 0.88rem;
  transition: all 0.15s;
}

.amazon-facet-list .facet-link:hover {
  background-color: #f0f2f2;
  color: #c7511f !important;
}

.active-facet {
  color: #0f1111 !important;
  font-weight: 700 !important;
  background-color: #f7fafa;
  border-left: 3px solid #e77600 !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
