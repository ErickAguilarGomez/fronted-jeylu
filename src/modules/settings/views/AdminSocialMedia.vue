<script setup>
import { ref, onMounted, computed } from 'vue'
import { socialMediaStore } from '../stores/socialMediaStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import SocialMediaFormModal from '../components/SocialMediaFormModal.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'

const supportedNetworks = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' }
]

const activeNetworkData = ref({
  id: null,
  type: '',
  url: '',
  phone: '',
  default_message: '',
  icon: '',
  active: true,
  sort_order: 1
})

onMounted(async () => {
  loading.value = true
  await socialMediaStore.fetchAdminSocialMedia()
  loading.value = false
})

const availableNetworks = computed(() => {
  if (modalMode.value === 'edit') {
    return supportedNetworks.filter(net => 
      net.value === activeNetworkData.value.type ||
      !socialMediaStore.adminSocialMedia.some(adminNet => 
        adminNet.type && adminNet.type.trim().toLowerCase() === net.value.trim().toLowerCase()
      )
    )
  }
  // Exclude already configured social networks in creation mode
  return supportedNetworks.filter(net => 
    !socialMediaStore.adminSocialMedia.some(adminNet => 
      adminNet.type && adminNet.type.trim().toLowerCase() === net.value.trim().toLowerCase()
    )
  )
})

const columns = [
  { key: 'sort_order', label: 'ORDEN', class: 'fw-bold font-monospace fs-6 text-nowrap', style: 'width: 80px;' },
  { key: 'type', label: 'RED SOCIAL', class: 'fw-black text-uppercase fs-6 text-nowrap' },
  { key: 'url_phone', label: 'ENLACE / TELÉFONO', class: 'font-monospace fs-6' },
  { key: 'active', label: 'ESTADO', headerClass: 'text-center', class: 'text-center text-nowrap' },
  { key: 'actions', label: 'ACCIONES', headerClass: 'text-center', class: 'text-center text-nowrap' }
]

const openCreateModal = () => {
  modalMode.value = 'create'
  
  const firstAvailable = availableNetworks.value[0]
  
  activeNetworkData.value = {
    id: null,
    type: firstAvailable ? firstAvailable.value : '',
    url: '',
    phone: '',
    default_message: '',
    icon: firstAvailable ? firstAvailable.icon : '',
    active: true,
    sort_order: (socialMediaStore.adminSocialMedia.length + 1)
  }
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  activeNetworkData.value = {
    id: item.id,
    type: item.type,
    url: item.url || '',
    phone: item.phone || '',
    default_message: item.default_message || '',
    icon: item.icon || '',
    active: item.active,
    sort_order: item.sort_order || 1
  }
  showModal.value = true
}

const toggleActive = async (item) => {
  const updatedData = {
    type: item.type,
    url: item.url,
    phone: item.phone,
    default_message: item.default_message,
    icon: item.icon,
    active: !item.active,
    sort_order: item.sort_order
  }
  const res = await socialMediaStore.updateSocialMedia(item.id, updatedData)
  if (res.success) {
    toast.success('Estado actualizado correctamente.', '¡Éxito!')
  } else {
    toast.error(res.message || 'Error al actualizar el estado.')
  }
}

const showConfirmDeleteModal = ref(false)
const idToDelete = ref(null)

const confirmDelete = (id) => {
  idToDelete.value = id
  showConfirmDeleteModal.value = true
}

const executeDelete = async () => {
  showConfirmDeleteModal.value = false
  if (!idToDelete.value) return

  const res = await socialMediaStore.deleteSocialMedia(idToDelete.value)
  if (res.success) {
    toast.success('Red social eliminada exitosamente.', '¡Eliminado!')
  } else {
    toast.error(res.message || 'Error al eliminar la red social.')
  }
  idToDelete.value = null
}

const handleSubmit = async (submitData) => {
  loading.value = true
  const assignedData = {
    type: submitData.type,
    url: submitData.type === 'whatsapp' ? null : submitData.url.trim(),
    phone: submitData.type === 'whatsapp' ? submitData.phone.trim() : null,
    default_message: submitData.type === 'whatsapp' ? submitData.default_message.trim() : null,
    icon: submitData.icon,
    active: submitData.active,
    sort_order: parseInt(submitData.sort_order) || 1
  }

  let res
  if (modalMode.value === 'create') {
    res = await socialMediaStore.createSocialMedia(assignedData)
  } else {
    res = await socialMediaStore.updateSocialMedia(submitData.id, assignedData)
  }

  if (res.success) {
    toast.success(`Red social ${modalMode.value === 'create' ? 'creada' : 'actualizada'} exitosamente.`, '¡Guardado!')
    showModal.value = false
  } else {
    toast.error(res.message || 'Error al guardar la red social.')
  }
  loading.value = false
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom border-black pb-4 gap-3">
      <div>
        <h1 class="display-5 fw-black text-uppercase m-0">REDES SOCIALES</h1>
        <p class="fw-bold text-muted m-0 mt-2">Configura los enlaces de contacto y redes sociales de la tienda.</p>
      </div>
      <BaseButton 
        variant="primary" 
        @click="openCreateModal" 
        :disabled="availableNetworks.length === 0" 
        class="btn-lg px-4 py-3"
      >
        + AGREGAR RED
      </BaseButton>
    </div>

    <!-- Table List using BaseTable -->
    <BaseTable
      :columns="columns"
      :items="socialMediaStore.adminSocialMedia"
      :loading="loading"
      loadingText="CARGANDO REDES SOCIALES..."
      emptyText="NO HAY REDES SOCIALES CONFIGURADAS"
    >
      <template #cell-sort_order="{ item }">
        # {{ item.sort_order }}
      </template>
      <template #cell-type="{ item }">
        <span class="fs-4 me-2">
          <i :class="['bi', `bi-${item.icon || item.type}`]"></i>
        </span>
        {{ item.type }}
      </template>
      <template #cell-url_phone="{ item }">
        <span v-if="item.type === 'whatsapp'" class="fw-bold">
          {{ item.phone }}
          <span v-if="item.default_message" class="text-muted small d-block text-truncate mt-1" style="max-width: 300px;">
            Msg: "{{ item.default_message }}"
          </span>
        </span>
        <span v-else>
          <a :href="item.url" target="_blank" class="text-black fw-bold text-decoration-underline">{{ item.url }}</a>
        </span>
      </template>
      <template #cell-active="{ item }">
        <button 
          @click="toggleActive(item)" 
          :class="['btn btn-sm fw-bold border border-black px-3 py-2 m-0', item.active ? 'bg-success text-black' : 'bg-danger text-white']"
        >
          {{ item.active ? 'ACTIVO' : 'INACTIVO' }}
        </button>
      </template>
      <template #cell-actions="{ item }">
        <button @click="openEditModal(item)" class="btn btn-secondary fw-black me-2 px-3 m-0 shadow-none">EDITAR</button>
        <BaseButton variant="danger" @click="confirmDelete(item.id)" class="px-3 m-0 shadow-none py-2">ELIMINAR</BaseButton>
      </template>
    </BaseTable>

    <!-- Modal Form using SocialMediaFormModal -->
    <SocialMediaFormModal
      :show="showModal"
      :modalMode="modalMode"
      :networkData="activeNetworkData"
      :availableNetworks="availableNetworks"
      :loading="loading"
      @close="showModal = false"
      @submit="handleSubmit"
    />

    <!-- Confirm delete using ConfirmDeleteModal -->
    <ConfirmDeleteModal
      :show="showConfirmDeleteModal"
      message="¿Estás seguro de eliminar esta red social?"
      @confirm="executeDelete"
      @cancel="showConfirmDeleteModal = false; idToDelete = null"
    />
  </div>
</template>
