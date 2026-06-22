<script setup>
import { ref, onMounted, computed } from 'vue'
import { saleStore } from '../stores/saleStore.js'
import saleService from '../services/saleService.js'
import userService from '../../users/services/userService.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import BaseSearch from '@/shared/components/BaseSearch.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BasePagination from '@/shared/components/BasePagination.vue'
import SaleStats from '../components/SaleStats.vue'
import SaleFilters from '../components/SaleFilters.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()
const searchQuery = ref('')

const filterSellerId = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')
const sellers = ref([])
const stats = ref({ total_amount: 0.00, total_sales: 0 })

const isSeller = computed(() => authStore.isSeller())

const columns = computed(() => {
  const list = [
    { key: 'id', label: 'ID', class: 'fw-black font-monospace' },
    { key: 'store_name', label: 'Sucursal', class: 'fw-bold text-uppercase' }
  ]
  if (!isSeller.value) {
    list.push({ key: 'seller_name', label: 'Cajero', class: 'text-muted' })
  }
  list.push(
    { key: 'customer', label: 'Cliente', class: 'text-muted' },
    { key: 'total_amount', label: 'Total', class: 'fw-black' },
    { key: 'created_at', label: 'Fecha', class: 'text-muted fs-6' }
  )
  return list
})

const getFilters = () => {
  const f = {}
  if (filterSellerId.value) f.seller_id = filterSellerId.value
  if (filterStartDate.value) f.start_date = filterStartDate.value
  if (filterEndDate.value) f.end_date = filterEndDate.value
  return f
}

const fetchSales = async (page = 1) => {
  try {
    await saleStore.fetchSales(page, searchQuery.value, getFilters())
  } catch (e) {
    toast.error(e, 'Error al cargar el historial de ventas')
  }
}

const fetchStats = async () => {
  try {
    const data = await saleService.getStats(getFilters())
    if (data && data.success) {
      stats.value = data.stats
    }
  } catch (e) {
    console.error('Error al cargar estadísticas de ventas:', e)
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchSales(1)
}

const handleFilterChange = () => {
  fetchSales(1)
  fetchStats()
}

const clearFilters = () => {
  filterSellerId.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  handleFilterChange()
}

onMounted(async () => {
  fetchSales()
  fetchStats()
  
  if (authStore.isAdmin()) {
    try {
      const response = await userService.getAll({ all: 1 })
      if (response && response.success) {
        sellers.value = response.users.filter(u => u.role_id === 1 || u.role_id === 2)
      }
    } catch (e) {
      console.error('Error cargando usuarios cajeros:', e)
    }
  }
})
</script>

<template>
  <div class="container py-5">
    <PageHeader :title="isSeller ? 'Mis Ventas' : 'Historial de Ventas'" />

    <!-- Panel de Estadísticas Brutalista -->
    <SaleStats :stats="stats" />

    <!-- Filtros de Búsqueda -->
    <SaleFilters 
      v-model:sellerId="filterSellerId"
      v-model:startDate="filterStartDate"
      v-model:endDate="filterEndDate"
      :sellers="sellers"
      @change="handleFilterChange"
      @clear="clearFilters"
    />

    <div class="d-flex mb-4">
      <BaseSearch v-model="searchQuery" :loading="saleStore.loading" @search="handleSearch" placeholder="Buscar por cliente..." />
    </div>

    <BaseTable
      :columns="columns"
      :items="saleStore.sales"
      :loading="saleStore.loading"
      loadingText="CARGANDO VENTAS..."
      emptyText="NO HAY VENTAS REGISTRADAS"
    >
      <template #cell-id="{ item }">
        #{{ item.id }}
      </template>
      <template #cell-customer="{ item }">
        {{ item.customer_name || item.customer_account_name || 'Anónimo' }}
      </template>
      <template #cell-total_amount="{ item }">
        <span class="text-success fw-bold">$ {{ Number(item.total_amount).toFixed(2) }}</span>
      </template>
      <template #cell-created_at="{ item }">
        {{ new Date(item.created_at).toLocaleString() }}
      </template>
    </BaseTable>

    <BasePagination
      :page="saleStore.page"
      :lastPage="saleStore.lastPage"
      :loading="saleStore.loading"
      @change="fetchSales"
    />
  </div>
</template>
