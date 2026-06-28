<script setup>
import { ref, onMounted } from 'vue'
import { storeStore } from '../stores/storeStore.js'
import BaseSearch from '@/shared/components/BaseSearch.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BasePagination from '@/shared/components/BasePagination.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import StoreFormModal from '../components/StoreFormModal.vue'
import StoreEmployeesModal from '../components/StoreEmployeesModal.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const searchQuery = ref('')

const showModal = ref(false)
const showEmployeesModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const activeStoreData = ref({
  name: '',
  address: '',
  phone: '',
  type: 'tienda',
  latitude: null,
  longitude: null
})

const columns = [
  { key: 'id', label: 'ID', class: 'fw-black font-monospace' },
  { key: 'name', label: 'Sucursal', class: 'fw-bold text-uppercase' },
  { key: 'type', label: 'Tipo', class: 'fw-bold text-uppercase' },
  { key: 'address', label: 'Dirección' },
  { key: 'actions', label: 'Acciones', headerClass: 'text-center', class: 'text-center' }
]

const fetchStores = async (page = 1) => {
  try {
    await storeStore.fetchStores(page, searchQuery.value)
  } catch (e) {
    toast.error(e, 'Error al cargar tiendas')
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchStores(1)
}

onMounted(() => {
  fetchStores()
  storeStore.fetchAllUsers()
})

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  activeStoreData.value = { name: '', address: '', phone: '', type: 'tienda', latitude: null, longitude: null }
  showModal.value = true
}

const openEditModal = (store) => {
  isEditing.value = true
  editId.value = store.id
  activeStoreData.value = { 
    name: store.name, 
    address: store.address, 
    phone: store.phone || '',
    type: store.type || 'tienda',
    latitude: store.latitude ? parseFloat(store.latitude) : null,
    longitude: store.longitude ? parseFloat(store.longitude) : null
  }
  showModal.value = true
}

const handleSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      await storeStore.updateStore(editId.value, formData)
      toast.success('La sucursal fue actualizada correctamente.', '¡Sucursal actualizada!')
    } else {
      await storeStore.createStore(formData)
      toast.success('La nueva sucursal ha sido registrada.', '¡Sucursal creada!')
    }
    showModal.value = false
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar sucursal' : 'Error al crear sucursal')
  }
}

const showConfirmDeleteModal = ref(false)
const confirmDeleteMessage = ref('')
const storeIdToDelete = ref(null)

const triggerDeleteStore = (id) => {
  storeIdToDelete.value = id
  confirmDeleteMessage.value = '¿Estás seguro de eliminar esta sucursal del sistema? Todos los productos asociados serán afectados.'
  showConfirmDeleteModal.value = true
}

const executeDeleteStore = async () => {
  showConfirmDeleteModal.value = false
  if (!storeIdToDelete.value) return

  try {
    await storeStore.deleteStore(storeIdToDelete.value)
    toast.success('La sucursal fue eliminada del sistema.', 'Sucursal eliminada')
  } catch (e) {
    toast.error(e, 'Error al eliminar sucursal')
  } finally {
    storeIdToDelete.value = null
  }
}

const openEmployeesModal = (store) => {
  editId.value = store.id
  showEmployeesModal.value = true
}
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Gestión de Sucursales" buttonText="NUEVA TIENDA" @action="openAddModal">
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16">
          <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .364-.976l2.605-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
        </svg>
      </template>
    </PageHeader>

    <div class="d-flex mb-4">
      <BaseSearch v-model="searchQuery" @search="handleSearch" :loading="storeStore.loading" placeholder="Buscar por sucursal o dirección..." />
    </div>

    <BaseTable
      :columns="columns"
      :items="storeStore.stores"
      :loading="storeStore.loading"
      loadingText="CARGANDO TIENDAS..."
      emptyText="NO HAY TIENDAS REGISTRADAS"
    >
      <template #cell-id="{ item }">
        #{{ item.id }}
      </template>
      <template #cell-type="{ item }">
        <span class="badge px-3 py-2 fs-7 border border-black fw-bold text-uppercase" :class="item.type === 'almacen' ? 'bg-secondary text-white' : 'bg-success text-black'">
          {{ item.type === 'almacen' ? 'Almacén' : 'Tienda' }}
        </span>
      </template>
      <template #cell-address="{ item }">
        <div class="text-muted">{{ item.address }}</div>
        <div v-if="item.phone" class="fs-6 font-monospace">📞 {{ item.phone }}</div>
      </template>
      <template #cell-actions="{ item }">
        <div class="d-flex justify-content-center gap-2">
          <button @click="openEmployeesModal(item)" class="btn btn-info text-white fw-black py-2 px-3 border border-black shadow-sm fs-6">
            EMPLEADOS
          </button>
          <button @click="openEditModal(item)" class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6">
            EDITAR
          </button>
          <BaseButton variant="danger" @click="triggerDeleteStore(item.id)" :disabled="item.id === 1" class="py-2 px-3 fs-6">
            ELIMINAR
          </BaseButton>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      :page="storeStore.page"
      :lastPage="storeStore.lastPage"
      :loading="storeStore.loading"
      @change="fetchStores"
    />

    <!-- Modal Formulario Creación/Edición -->
    <StoreFormModal
      :show="showModal"
      :isEditing="isEditing"
      :storeData="activeStoreData"
      :loading="storeStore.loading"
      @close="showModal = false"
      @submit="handleSubmit"
    />

    <!-- Modal Empleados -->
    <StoreEmployeesModal
      :show="showEmployeesModal"
      :storeId="editId"
      @close="showEmployeesModal = false"
    />

    <ConfirmDeleteModal
      :show="showConfirmDeleteModal"
      :message="confirmDeleteMessage"
      @confirm="executeDeleteStore"
      @cancel="showConfirmDeleteModal = false; storeIdToDelete = null"
    />
  </div>
</template>
