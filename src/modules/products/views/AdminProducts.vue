<script setup>
import { ref, onMounted, computed } from 'vue'
import { productStore } from '../stores/productStore.js'
import BaseSearch from '@/shared/components/BaseSearch.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BasePagination from '@/shared/components/BasePagination.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import ProductForm from '../components/ProductForm.vue'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const searchQuery = ref('')
const productFormRef = ref(null)

const columns = computed(() => {
  const cols = [
    { key: 'image', label: 'IMG', headerClass: 'text-nowrap' },
    { key: 'sku', label: 'SKU', class: 'fw-bold font-monospace fs-6 text-nowrap' },
    { key: 'name', label: 'NOMBRE', class: 'fw-black text-uppercase fs-6 w-25' },
    { key: 'price', label: 'PRECIO', class: 'text-end fw-black fs-5 text-nowrap', headerClass: 'text-end text-nowrap' },
    { key: 'status', label: 'ESTADO', class: 'text-center', headerClass: 'text-center text-nowrap' },
    { key: 'stock', label: 'STOCK', class: 'text-center', headerClass: 'text-center text-nowrap' }
  ]
  if (authStore.isAdmin()) {
    cols.push({ key: 'actions', label: 'ACCIONES', class: 'text-end text-nowrap', headerClass: 'text-center text-nowrap' })
  }
  return cols
})

const fetchProducts = async (page = 1) => {
  await productStore.fetchProducts(page, searchQuery.value)
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchProducts(1)
}

onMounted(async () => {
  await productStore.fetchMetadata()
  
  if (authStore.isSeller() && authStore.user?.primary_store) {
    productStore.filterByStore(authStore.user.primary_store.id)
  }
  
  await fetchProducts()
})

const filterByStore = (storeId) => {
  productStore.filterByStore(storeId)
}

const openCreateModal = () => {
  if (productFormRef.value) {
    productFormRef.value.openCreateModal()
  }
}

const openEditModal = (productSku) => {
  if (productFormRef.value) {
    productFormRef.value.openEditModal(productSku)
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

const executeDeleteProduct = async () => {
  showConfirmDeleteModal.value = false
  if (!productSkuToDelete.value) return

  try {
    await productStore.deleteProduct(productSkuToDelete.value)
    toast.success('El producto fue eliminado del sistema y de Cloudinary.', 'Producto eliminado')
  } catch (err) {
    toast.error(err, 'Error al eliminar el producto')
  } finally {
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
      <button v-if="authStore.isAdmin()" @click="openCreateModal" class="btn btn-primary btn-lg fw-black text-uppercase px-4 py-3">+ NUEVO PRODUCTO</button>
    </div>

    <div class="d-flex flex-wrap gap-3 mb-4">
      <!-- Filtro por Tiendas (Solo visible para Admin) -->
      <div v-if="authStore.isAdmin()" class="d-flex flex-wrap gap-2 p-3 bg-light border border-black border-2 align-items-center flex-grow-1">
        <span class="fw-black text-uppercase me-2"><i class="bi bi-shop"></i> SUCURSAL DE INVENTARIO:</span>
        <button 
          @click="filterByStore('')" 
          :class="['btn fw-black border-black border-2', productStore.selectedFilterStore === '' ? 'btn-black text-white bg-black' : 'btn-outline-dark bg-white']"
        >
          TODAS LAS TIENDAS
        </button>
        <button 
          v-for="store in productStore.stores" 
          :key="store.id"
          @click="filterByStore(store.id)" 
          :class="['btn fw-black border-black border-2', productStore.selectedFilterStore === store.id ? 'btn-primary' : 'btn-outline-dark bg-white']"
        >
          {{ store.name }}
        </button>
      </div>
      
      <!-- Buscador -->
      <div class="d-flex align-items-center" :class="authStore.isAdmin() ? '' : 'w-100'" style="min-width: 300px;">
        <BaseSearch v-model="searchQuery" :loading="productStore.loading" @search="handleSearch" placeholder="Buscar producto por nombre o SKU..." />
      </div>
    </div>

    <div v-if="productStore.loading && productStore.products.length === 0" class="text-center py-5">
      <div class="spinner-border text-black" style="width: 4rem; height: 4rem; border-width: 0.35em;" role="status"></div>
      <h3 class="mt-4 fw-black text-uppercase">CARGANDO INVENTARIO...</h3>
    </div>

    <BaseTable
      v-else
      :columns="columns"
      :items="productStore.products"
      :loading="productStore.loading"
      itemKey="sku"
      emptyText="NO HAY PRODUCTOS EN ESTA TIENDA"
    >
      <template #cell-image="{ item }">
        <img :src="item.image_url || 'https://via.placeholder.com/60'" width="60" height="60" class="border border-black border-2 object-fit-cover shadow-sm">
      </template>
      <template #cell-sku="{ item }">
        {{ item.sku }}
      </template>
      <template #cell-name="{ item }">
        {{ item.name }}
      </template>
      <template #cell-price="{ item }">
        S/ {{ Number(item.price).toFixed(2) }}
      </template>
      <template #cell-status="{ item }">
        <span class="badge px-3 py-2 fs-7 border border-black fw-bold" :class="item.is_available ? 'bg-success text-black' : 'bg-danger text-white'">
          {{ item.is_available ? 'ACTIVO' : 'AGOTADO' }}
        </span>
      </template>
      <template #cell-stock="{ item }">
        <span class="badge px-3 py-2 fs-6 border border-black fw-black" :class="item.total_stock > 5 ? 'bg-warning text-black' : 'bg-danger text-white'">
          {{ item.total_stock }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <button @click="openEditModal(item.sku)" class="btn btn-secondary fw-black me-2 px-3 m-0 shadow-none">EDITAR</button>
        <button @click="triggerDeleteProduct(item.sku)" class="btn btn-danger fw-black px-3 m-0 shadow-none">ELIMINAR</button>
      </template>
    </BaseTable>

    <BasePagination
      :page="productStore.page"
      :lastPage="productStore.lastPage"
      :loading="productStore.loading"
      @change="fetchProducts"
    />

    <ProductForm ref="productFormRef" @closed="fetchProducts(productStore.page)" />

    <ConfirmDeleteModal
      :show="showConfirmDeleteModal"
      :message="confirmDeleteMessage"
      @confirm="executeDeleteProduct"
      @cancel="showConfirmDeleteModal = false; productSkuToDelete = null"
    />
  </div>
</template>
