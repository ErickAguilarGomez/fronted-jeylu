<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios.js'
import SearchBar from '@/components/common/SearchBar.vue'

const sales = ref([])
const loading = ref(false)
const error = ref(null)

// Pagination & Search
const page = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')

const fetchSales = async (pageNumber = 1) => {
  loading.value = true
  error.value = null
  page.value = pageNumber
  try {
    const res = await api.get('/sales', {
      params: { page: page.value, per_page: 10, search: searchQuery.value }
    })
    if (res.data && res.data.success) {
      sales.value = res.data.data
      lastPage.value = res.data.meta.last_page
    }
  } catch (e) {
    error.value = 'Error al cargar el historial de ventas.'
  } finally {
    loading.value = false
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchSales(1)
}

onMounted(() => {
  fetchSales()
})
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-5 border-bottom border-black pb-4">
      <h1 class="display-5 m-0 fw-black text-uppercase">Historial de Ventas</h1>
    </div>

    <div v-if="error" class="alert alert-danger border border-black border-2 fs-5 fw-bold mb-4 shadow-sm">
      {{ error }}
    </div>

    <div class="d-flex mb-4">
      <SearchBar v-model="searchQuery" @search="handleSearch" placeholder="Buscar por cliente, cajero o factura..." />
    </div>

    <div class="card border-black border-3 shadow-solid bg-white mb-4">
      <div class="card-body p-0 table-responsive">
        <table class="table table-hover align-middle m-0 fs-5">
          <thead class="table-dark text-uppercase border-bottom border-black border-3">
            <tr>
              <th scope="col" class="py-3 px-4">ID</th>
              <th scope="col" class="py-3 px-4">Sucursal</th>
              <th scope="col" class="py-3 px-4">Cajero</th>
              <th scope="col" class="py-3 px-4">Cliente</th>
              <th scope="col" class="py-3 px-4">Total</th>
              <th scope="col" class="py-3 px-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && sales.length === 0">
              <td colspan="6" class="text-center py-5 fw-bold">CARGANDO VENTAS...</td>
            </tr>
            <tr v-else-if="sales.length === 0">
              <td colspan="6" class="text-center py-5 fw-bold text-muted">NO HAY VENTAS REGISTRADAS</td>
            </tr>
            <tr v-for="sale in sales" :key="sale.id" class="border-bottom border-black">
              <td class="py-4 px-4 fw-black font-monospace">#{{ sale.id }}</td>
              <td class="py-4 px-4 fw-bold text-uppercase">{{ sale.store_name }}</td>
              <td class="py-4 px-4 text-muted">{{ sale.seller_name }}</td>
              <td class="py-4 px-4 text-muted">{{ sale.customer_name || sale.customer_account_name || 'Anónimo' }}</td>
              <td class="py-4 px-4 fw-black text-success">S/ {{ Number(sale.total_amount).toFixed(2) }}</td>
              <td class="py-4 px-4 text-muted fs-6">{{ new Date(sale.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación -->
    <div class="d-flex justify-content-between align-items-center mt-4 mb-5" v-if="lastPage > 1">
      <button @click="fetchSales(page - 1)" :disabled="page <= 1 || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        &laquo; Anterior
      </button>
      <span class="fw-black fs-4 text-uppercase">Página {{ page }} de {{ lastPage }}</span>
      <button @click="fetchSales(page + 1)" :disabled="page >= lastPage || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        Siguiente &raquo;
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
