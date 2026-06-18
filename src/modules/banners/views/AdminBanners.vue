<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import BannerFormModal from '../components/BannerFormModal.vue'
import BannerMobileCard from '../components/BannerMobileCard.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const banners = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const activeBannerData = ref({
  is_active: true,
  sort_order: 0
})
const initialImagePreview = ref(null)

const columns = [
  { key: 'image_url', label: 'Banner' },
  { key: 'sort_order', label: 'Orden', class: 'font-monospace fw-bold text-center' },
  { key: 'is_active', label: 'Estado', class: 'text-center' },
  { key: 'created_at', label: 'Creado el' },
  { key: 'actions', label: 'Acciones', headerClass: 'text-center', class: 'text-center' }
]

const fetchBanners = async () => {
  loading.value = true
  try {
    const res = await api.get('/banners')
    if (res.data && res.data.success) {
      banners.value = res.data.banners
    }
  } catch (e) {
    toast.error(e, 'Error al cargar banners')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBanners()
})

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  activeBannerData.value = { is_active: true, sort_order: banners.value.length }
  initialImagePreview.value = null
  showModal.value = true
}

const openEditModal = (banner) => {
  isEditing.value = true
  editId.value = banner.id
  activeBannerData.value = { 
    is_active: banner.is_active === 1 || banner.is_active === true, 
    sort_order: banner.sort_order 
  }
  initialImagePreview.value = banner.image_url
  showModal.value = true
}

const handleSubmit = async (submitData) => {
  if (!isEditing.value && !submitData.file) {
    toast.warning('Debes cargar una imagen para el banner.', 'Imagen requerida')
    return
  }

  // Validate negative number
  if (submitData.sort_order === null || submitData.sort_order === undefined || submitData.sort_order < 0) {
    toast.warning('El orden de visualización no puede ser un número negativo.', 'Valor inválido')
    return
  }

  // Validate duplicate order number
  const duplicate = banners.value.find(b => b.sort_order === submitData.sort_order && b.id !== editId.value)
  if (duplicate) {
    toast.warning('Ya existe un banner con este orden de visualización.', 'Orden duplicado')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('is_active', submitData.is_active ? '1' : '0')
    formData.append('sort_order', submitData.sort_order)
    
    if (submitData.file) {
      formData.append('image', submitData.file)
    }

    if (isEditing.value) {
      await api.post(`/banners/${editId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('El banner fue actualizado correctamente.', '¡Banner actualizado!')
    } else {
      await api.post('/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('El nuevo banner ha sido registrado.', '¡Banner creado!')
    }
    showModal.value = false
    await fetchBanners()
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar banner' : 'Error al crear banner')
  } finally {
    loading.value = false
  }
}

const showConfirmDeleteModal = ref(false)
const bannerIdToDelete = ref(null)

const triggerDelete = (id) => {
  bannerIdToDelete.value = id
  showConfirmDeleteModal.value = true
}

const executeDelete = async () => {
  showConfirmDeleteModal.value = false
  if (!bannerIdToDelete.value) return

  loading.value = true
  try {
    await api.delete(`/banners/${bannerIdToDelete.value}`)
    toast.success('El banner fue eliminado del sistema.', 'Banner eliminado')
    await fetchBanners()
  } catch (e) {
    toast.error(e, 'Error al eliminar banner')
  } finally {
    loading.value = false
    bannerIdToDelete.value = null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Administración de Banners" buttonText="NUEVO BANNER" @action="openAddModal">
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
          <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
          <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2zM14 5a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V5z"/>
        </svg>
      </template>
    </PageHeader>

    <!-- Desktop/Tablet view -->
    <div class="d-none d-md-block">
      <BaseTable
        :columns="columns"
        :items="banners"
        :loading="loading"
        loadingText="CARGANDO BANNERS..."
        emptyText="NO HAY BANNERS REGISTRADOS"
      >
        <template #cell-image_url="{ item }">
          <img :src="item.image_url" class="border border-black border-2 my-1" style="max-height: 80px; max-width: 200px; object-fit: cover;" />
        </template>
        <template #cell-sort_order="{ item }">
          <span class="fs-5 fw-bold font-monospace">{{ item.sort_order }}</span>
        </template>
        <template #cell-is_active="{ item }">
          <span 
            class="badge fw-bold p-2 px-3 border border-black border-2" 
            :class="item.is_active ? 'bg-success text-black' : 'bg-danger text-white'"
            style="font-size: 0.8rem !important; box-shadow: 2px 2px 0px #000 !important; display: inline-block;"
          >
            {{ item.is_active ? 'ACTIVO' : 'INACTIVO' }}
          </span>
        </template>
        <template #cell-created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template #cell-actions="{ item }">
          <div class="d-flex justify-content-center gap-2">
            <button 
              @click="openEditModal(item)" 
              class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6"
              style="padding: 8px 16px !important; font-size: 0.85rem !important;"
            >
              EDITAR
            </button>
            <BaseButton 
              variant="danger"
              @click="triggerDelete(item.id)" 
              class="py-2 px-3 fs-6"
              style="padding: 8px 16px !important; font-size: 0.85rem !important;"
            >
              ELIMINAR
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Mobile view -->
    <div class="d-md-none">
      <div v-if="loading && banners.length === 0" class="text-center py-5 border border-black border-3 shadow-solid bg-white mb-4">
        <div class="spinner-border text-black" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 fw-black text-uppercase m-0">Cargando Banners...</p>
      </div>
      <div v-else-if="banners.length === 0" class="text-center py-5 border border-black border-3 shadow-solid bg-white mb-4">
        <h4 class="fw-black text-muted text-uppercase m-0">No hay banners registrados</h4>
      </div>
      <div v-else class="d-flex flex-column gap-4 mb-4">
        <BannerMobileCard 
          v-for="item in banners" 
          :key="item.id" 
          :item="item"
          :loading="loading"
          @edit="openEditModal(item)"
          @delete="triggerDelete(item.id)"
        />
      </div>
    </div>

    <!-- Modal Creación/Edición -->
    <BannerFormModal
      :show="showModal"
      :isEditing="isEditing"
      :bannerData="activeBannerData"
      :initialImagePreview="initialImagePreview"
      :loading="loading"
      @close="showModal = false"
      @submit="handleSubmit"
    />

    <!-- Confirm delete -->
    <ConfirmDeleteModal
      :show="showConfirmDeleteModal"
      message="¿Estás seguro de eliminar este banner publicitario?"
      @confirm="executeDelete"
      @cancel="showConfirmDeleteModal = false; bannerIdToDelete = null"
    />
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
</style>
