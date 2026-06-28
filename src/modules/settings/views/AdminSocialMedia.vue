<script setup>
import { ref, onMounted, computed } from 'vue'
import { socialMediaStore } from '../stores/socialMediaStore.js'
import { whatsappStore } from '../stores/whatsappStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import SocialMediaFormModal from '../components/SocialMediaFormModal.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const activeTab = ref('social') // 'social' or 'whatsapp'
const loading = ref(false)

// ----------------------------------------------------
// TAB 1: SOCIAL MEDIA CRUD
// ----------------------------------------------------
const showSocialModal = ref(false)
const socialModalMode = ref('create')

// Remove whatsapp from supported networks since it has its own dedicated tab
const supportedNetworks = [
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' }
]

const activeSocialData = ref({
  id: null,
  type: '',
  url: '',
  phone: '',
  default_message: '',
  icon: '',
  active: true,
  sort_order: 1
})

const filteredSocialMedia = computed(() => {
  // Filter out any leftover whatsapp record from the social links list
  return socialMediaStore.adminSocialMedia.filter(s => s.type !== 'whatsapp')
})

const availableSocialNetworks = computed(() => {
  if (socialModalMode.value === 'edit') {
    return supportedNetworks.filter(net => 
      net.value === activeSocialData.value.type ||
      !filteredSocialMedia.value.some(adminNet => 
        adminNet.type && adminNet.type.trim().toLowerCase() === net.value.trim().toLowerCase()
      )
    )
  }
  return supportedNetworks.filter(net => 
    !filteredSocialMedia.value.some(adminNet => 
      adminNet.type && adminNet.type.trim().toLowerCase() === net.value.trim().toLowerCase()
    )
  )
})

const socialColumns = [
  { key: 'sort_order', label: 'ORDEN', class: 'fw-bold font-monospace fs-6 text-nowrap', style: 'width: 80px;' },
  { key: 'type', label: 'RED SOCIAL', class: 'fw-black text-uppercase fs-6 text-nowrap' },
  { key: 'url_phone', label: 'ENLACE', class: 'font-monospace fs-6' },
  { key: 'active', label: 'ESTADO', headerClass: 'text-center', class: 'text-center text-nowrap' },
  { key: 'actions', label: 'ACCIONES', headerClass: 'text-center', class: 'text-center text-nowrap' }
]

const openCreateSocialModal = () => {
  socialModalMode.value = 'create'
  const firstAvailable = availableSocialNetworks.value[0]
  
  activeSocialData.value = {
    id: null,
    type: firstAvailable ? firstAvailable.value : '',
    url: '',
    phone: '',
    default_message: '',
    icon: firstAvailable ? firstAvailable.icon : '',
    active: true,
    sort_order: (filteredSocialMedia.value.length + 1)
  }
  showSocialModal.value = true
}

const openEditSocialModal = (item) => {
  socialModalMode.value = 'edit'
  activeSocialData.value = {
    id: item.id,
    type: item.type,
    url: item.url || '',
    phone: item.phone || '',
    default_message: item.default_message || '',
    icon: item.icon || '',
    active: item.active,
    sort_order: item.sort_order || 1
  }
  showSocialModal.value = true
}

const toggleSocialActive = async (item) => {
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

const showConfirmDeleteSocialModal = ref(false)
const socialIdToDelete = ref(null)

const confirmDeleteSocial = (id) => {
  socialIdToDelete.value = id
  showConfirmDeleteSocialModal.value = true
}

const executeDeleteSocial = async () => {
  showConfirmDeleteSocialModal.value = false
  if (!socialIdToDelete.value) return

  const res = await socialMediaStore.deleteSocialMedia(socialIdToDelete.value)
  if (res.success) {
    toast.success('Red social eliminada exitosamente.', '¡Eliminado!')
  } else {
    toast.error(res.message || 'Error al eliminar la red social.')
  }
  socialIdToDelete.value = null
}

const handleSocialSubmit = async (submitData) => {
  loading.value = true
  const assignedData = {
    type: submitData.type,
    url: submitData.url.trim(),
    phone: null,
    default_message: null,
    icon: submitData.icon,
    active: submitData.active,
    sort_order: parseInt(submitData.sort_order) || 1
  }

  let res
  if (socialModalMode.value === 'create') {
    res = await socialMediaStore.createSocialMedia(assignedData)
  } else {
    res = await socialMediaStore.updateSocialMedia(submitData.id, assignedData)
  }

  if (res.success) {
    toast.success(`Red social ${socialModalMode.value === 'create' ? 'creada' : 'actualizada'} exitosamente.`, '¡Guardado!')
    showSocialModal.value = false
  } else {
    toast.error(res.message || 'Error al guardar la red social.')
  }
  loading.value = false
}

// ----------------------------------------------------
// TAB 2: WHATSAPP NUMBERS CRUD
// ----------------------------------------------------
const showWhatsappModal = ref(false)
const whatsappModalMode = ref('create')

const whatsappForm = ref({
  id: null,
  alias: '',
  phone: '',
  is_active: true,
  display_order: 1
})

const whatsappColumns = [
  { key: 'display_order', label: 'ORDEN', class: 'fw-bold font-monospace fs-6 text-nowrap', style: 'width: 80px;' },
  { key: 'alias', label: 'ALIAS / NOMBRE', class: 'fw-black text-uppercase fs-6 text-nowrap' },
  { key: 'phone', label: 'TELÉFONO', class: 'font-monospace fs-6' },
  { key: 'is_active', label: 'ESTADO', headerClass: 'text-center', class: 'text-center text-nowrap' },
  { key: 'actions', label: 'ACCIONES', headerClass: 'text-center', class: 'text-center text-nowrap' }
]

const openCreateWhatsappModal = () => {
  whatsappModalMode.value = 'create'
  whatsappForm.value = {
    id: null,
    alias: '',
    phone: '',
    is_active: true,
    display_order: (whatsappStore.adminWhatsappNumbers.length + 1)
  }
  showWhatsappModal.value = true
}

const openEditWhatsappModal = (item) => {
  whatsappModalMode.value = 'edit'
  whatsappForm.value = {
    id: item.id,
    alias: item.alias || '',
    phone: item.phone || '',
    is_active: item.is_active,
    display_order: item.display_order || 1
  }
  showWhatsappModal.value = true
}

const toggleWhatsappActive = async (item) => {
  const res = await whatsappStore.toggleActive(item.id)
  if (res.success) {
    toast.success('Estado del contacto actualizado correctamente.', '¡Éxito!')
  } else {
    toast.error(res.message || 'Error al actualizar el estado.')
  }
}

const showConfirmDeleteWhatsappModal = ref(false)
const whatsappIdToDelete = ref(null)

const confirmDeleteWhatsapp = (id) => {
  whatsappIdToDelete.value = id
  showConfirmDeleteWhatsappModal.value = true
}

const executeDeleteWhatsapp = async () => {
  showConfirmDeleteWhatsappModal.value = false
  if (!whatsappIdToDelete.value) return

  const res = await whatsappStore.deleteNumber(whatsappIdToDelete.value)
  if (res.success) {
    toast.success('Número de WhatsApp eliminado exitosamente.', '¡Eliminado!')
  } else {
    toast.error(res.message || 'Error al eliminar el contacto.')
  }
  whatsappIdToDelete.value = null
}

const handleWhatsappSubmit = async () => {
  // Validate phone number format
  if (!whatsappForm.value.phone || !whatsappForm.value.phone.trim()) {
    toast.warning('El número de teléfono es obligatorio.', 'Formulario incompleto')
    return
  }

  // Validate format (digits and optional plus prefix)
  const phoneClean = whatsappForm.value.phone.trim()
  if (!/^\+?[0-9\s]+$/.test(phoneClean)) {
    toast.warning('El número de WhatsApp debe contener únicamente dígitos y puede iniciar con +.', 'Formulario inválido')
    return
  }

  loading.value = true
  const submitData = {
    alias: whatsappForm.value.alias.trim() || null,
    phone: phoneClean.replace(/\s+/g, ''), // remove spaces
    is_active: whatsappForm.value.is_active,
    display_order: parseInt(whatsappForm.value.display_order) || 1
  }

  let res
  if (whatsappModalMode.value === 'create') {
    res = await whatsappStore.createNumber(submitData)
  } else {
    res = await whatsappStore.updateNumber(whatsappForm.value.id, submitData)
  }

  if (res.success) {
    toast.success(`Contacto ${whatsappModalMode.value === 'create' ? 'creado' : 'actualizado'} exitosamente.`, '¡Guardado!')
    showWhatsappModal.value = false
  } else {
    toast.error(res.message || 'Error al guardar el contacto de WhatsApp.')
  }
  loading.value = false
}

// ----------------------------------------------------
// GLOBAL MOUNT
// ----------------------------------------------------
onMounted(async () => {
  loading.value = true
  await Promise.all([
    socialMediaStore.fetchAdminSocialMedia(),
    whatsappStore.fetchAdminNumbers()
  ])
  loading.value = false
})
</script>

<template>
  <div class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom border-black pb-4 gap-3">
      <div>
        <h1 class="display-5 fw-black text-uppercase m-0">CONTACTO Y REDES</h1>
        <p class="fw-bold text-muted m-0 mt-2">Configura los enlaces de redes sociales y los números de WhatsApp para tus clientes.</p>
      </div>
      
      <!-- Primary Action Buttons based on Tab -->
      <BaseButton 
        v-if="activeTab === 'social'"
        variant="primary" 
        @click="openCreateSocialModal" 
        :disabled="availableSocialNetworks.length === 0" 
        class="btn-lg px-4 py-3"
      >
        + AGREGAR RED SOCIAL
      </BaseButton>

      <BaseButton 
        v-else
        variant="primary" 
        @click="openCreateWhatsappModal" 
        class="btn-lg px-4 py-3"
      >
        + AGREGAR NÚMERO WHATSAPP
      </BaseButton>
    </div>

    <!-- Brutalist Tab Selector -->
    <div class="d-flex flex-wrap gap-2 mb-4 border-bottom border-black border-2 pb-3">
      <button 
        @click="activeTab = 'social'" 
        :class="['btn btn-lg fw-black border-3 border-black py-3 px-4 m-0 transition', activeTab === 'social' ? 'btn-dark text-white' : 'btn-white bg-white text-black shadow-solid-sm hover-bg-yellow']"
      >
        REDES SOCIALES & ENLACES
      </button>
      <button 
        @click="activeTab = 'whatsapp'" 
        :class="['btn btn-lg fw-black border-3 border-black py-3 px-4 m-0 transition', activeTab === 'whatsapp' ? 'btn-dark text-white' : 'btn-white bg-white text-black shadow-solid-sm hover-bg-yellow']"
      >
        NÚMEROS DE WHATSAPP
      </button>
    </div>

    <!-- TAB 1: SOCIAL MEDIA TABLE -->
    <div v-if="activeTab === 'social'">
      <BaseTable
        :columns="socialColumns"
        :items="filteredSocialMedia"
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
          <a :href="item.url" target="_blank" class="text-black fw-bold text-decoration-underline">{{ item.url }}</a>
        </template>
        <template #cell-active="{ item }">
          <button 
            @click="toggleSocialActive(item)" 
            :class="['btn btn-sm fw-bold border border-black px-3 py-2 m-0 transition-hover-sm', item.active ? 'bg-success text-black' : 'bg-danger text-white']"
          >
            {{ item.active ? 'ACTIVO' : 'INACTIVO' }}
          </button>
        </template>
        <template #cell-actions="{ item }">
          <button @click="openEditSocialModal(item)" class="btn btn-secondary fw-black me-2 px-3 m-0 shadow-none py-2">EDITAR</button>
          <BaseButton variant="danger" @click="confirmDeleteSocial(item.id)" class="px-3 m-0 shadow-none py-2">ELIMINAR</BaseButton>
        </template>
      </BaseTable>
    </div>

    <!-- TAB 2: WHATSAPP NUMBERS TABLE -->
    <div v-else-if="activeTab === 'whatsapp'">
      <BaseTable
        :columns="whatsappColumns"
        :items="whatsappStore.adminWhatsappNumbers"
        :loading="loading || whatsappStore.loading"
        loadingText="CARGANDO CONTACTOS DE WHATSAPP..."
        emptyText="NO HAY CONTACTOS DE WHATSAPP REGISTRADOS"
      >
        <template #cell-display_order="{ item }">
          # {{ item.display_order }}
        </template>
        <template #cell-alias="{ item }">
          <span class="fw-black text-uppercase text-primary">{{ item.alias || 'Contacto General' }}</span>
        </template>
        <template #cell-phone="{ item }">
          <span class="font-monospace fw-bold">{{ item.phone }}</span>
        </template>
        <template #cell-is_active="{ item }">
          <button 
            @click="toggleWhatsappActive(item)" 
            :class="['btn btn-sm fw-bold border border-black px-3 py-2 m-0 transition-hover-sm', item.is_active ? 'bg-success text-black' : 'bg-danger text-white']"
          >
            {{ item.is_active ? 'ACTIVO' : 'INACTIVO' }}
          </button>
        </template>
        <template #cell-actions="{ item }">
          <button @click="openEditWhatsappModal(item)" class="btn btn-secondary fw-black me-2 px-3 m-0 shadow-none py-2">EDITAR</button>
          <BaseButton variant="danger" @click="confirmDeleteWhatsapp(item.id)" class="px-3 m-0 shadow-none py-2">ELIMINAR</BaseButton>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Form: SocialMediaFormModal -->
    <SocialMediaFormModal
      :show="showSocialModal"
      :modalMode="socialModalMode"
      :networkData="activeSocialData"
      :availableNetworks="availableSocialNetworks"
      :loading="loading"
      @close="showSocialModal = false"
      @submit="handleSocialSubmit"
    />

    <!-- Modal Form: WhatsApp CRUD -->
    <div v-if="showWhatsappModal" class="modal-backdrop" style="background: rgba(0,0,0,0.85); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div class="card border-3 border-black shadow-solid w-100" style="max-width: 500px;">
        <div class="card-header bg-black text-white p-4 border-bottom border-black border-3 d-flex justify-content-between align-items-center">
          <h3 class="m-0 fw-black text-uppercase fs-4">{{ whatsappModalMode === 'create' ? 'NUEVO NÚMERO DE WHATSAPP' : 'EDITAR NÚMERO DE WHATSAPP' }}</h3>
          <button type="button" @click="showWhatsappModal = false" class="btn btn-danger py-1 px-2 border-2 border-black text-white m-0 fs-5">X</button>
        </div>
        
        <div class="card-body p-4 bg-white">
          <form @submit.prevent="handleWhatsappSubmit">
            <div class="mb-3">
              <label class="form-label fw-black text-uppercase fs-6">Alias / Nombre (Ejem: Soporte, Ventas, Sucursal Lima)</label>
              <input v-model="whatsappForm.alias" type="text" class="form-control border-black border-2 fw-bold shadow-none" placeholder="Ejem: Ventas y Pedidos">
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-black text-uppercase fs-6">Número de Teléfono (Con código de país, sin espacios)</label>
              <input v-model="whatsappForm.phone" type="text" class="form-control border-black border-2 fw-bold shadow-none" placeholder="Ejem: +51999888777" required>
              <small class="text-muted font-monospace d-block mt-1">Ejem: +51999888777 (Soportado también sin el signo +)</small>
            </div>

            <div class="row g-3 mb-4 align-items-center">
              <div class="col-6">
                <label class="form-label fw-black text-uppercase fs-6">Orden de visualización</label>
                <input v-model.number="whatsappForm.display_order" type="number" min="0" class="form-control border-black border-2 fw-bold shadow-none" required>
              </div>
              <div class="col-6 text-center">
                <label class="form-label fw-black text-uppercase fs-6 d-block">Estado Activo</label>
                <button 
                  type="button" 
                  @click="whatsappForm.is_active = !whatsappForm.is_active"
                  :class="['btn fw-black border-2 border-black px-4 py-2 m-0 w-100 transition', whatsappForm.is_active ? 'bg-success text-black' : 'bg-danger text-white']"
                >
                  {{ whatsappForm.is_active ? 'ACTIVO' : 'INACTIVO' }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-3 mt-2 fw-black text-uppercase fs-4 m-0 shadow" :disabled="loading || whatsappStore.loading">
              {{ whatsappStore.loading ? 'GUARDANDO...' : (whatsappModalMode === 'create' ? 'REGISTRAR NÚMERO' : 'GUARDAR CAMBIOS') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm delete: Social -->
    <ConfirmDeleteModal
      :show="showConfirmDeleteSocialModal"
      message="¿Estás seguro de eliminar esta red social?"
      @confirm="executeDeleteSocial"
      @cancel="showConfirmDeleteSocialModal = false; socialIdToDelete = null"
    />

    <!-- Confirm delete: WhatsApp -->
    <ConfirmDeleteModal
      :show="showConfirmDeleteWhatsappModal"
      message="¿Estás seguro de eliminar este contacto de WhatsApp?"
      @confirm="executeDeleteWhatsapp"
      @cancel="showConfirmDeleteWhatsappModal = false; whatsappIdToDelete = null"
    />
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 6px 6px 0px 0px #000000 !important;
}
.shadow-solid-sm {
  box-shadow: 4px 4px 0px 0px #000000 !important;
}
.hover-bg-yellow:hover {
  background-color: #ffde59 !important;
  color: #000000 !important;
}
.transition-hover-sm {
  transition: all 0.15s ease-in-out;
}
.transition-hover-sm:hover {
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0px #000000 !important;
}
</style>
