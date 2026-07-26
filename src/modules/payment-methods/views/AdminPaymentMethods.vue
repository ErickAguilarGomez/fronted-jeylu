<script setup>
import { ref, onMounted } from 'vue'
import { paymentMethodStore } from '../stores/paymentMethodStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const showModal = ref(false)
const modalMode = ref('create')
const selectedId = ref(null)

const form = ref({
  name: '',
  description: '',
  is_active: true
})

const columns = [
  { key: 'name', label: 'NOMBRE FORMA DE PAGO', class: 'fw-black text-uppercase fs-5' },
  { key: 'description', label: 'DESCRIPCIÓN', class: 'fw-bold text-muted fs-6' },
  { key: 'status', label: 'ESTADO', class: 'text-center', headerClass: 'text-center' },
  { key: 'actions', label: 'ACCIONES', class: 'text-end', headerClass: 'text-end' }
]

onMounted(async () => {
  await paymentMethodStore.fetchMethods()
})

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedId.value = null
  form.value = {
    name: '',
    description: '',
    is_active: true
  }
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  selectedId.value = item.id
  form.value = {
    name: item.name,
    description: item.description || '',
    is_active: Boolean(item.is_active)
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveMethod = async () => {
  try {
    if (modalMode.value === 'create') {
      await paymentMethodStore.createMethod(form.value)
      toast.success('Forma de pago registrada exitosamente.', 'Registrado')
    } else {
      await paymentMethodStore.updateMethod(selectedId.value, form.value)
      toast.success('Forma de pago actualizada exitosamente.', 'Actualizado')
    }
    showModal.value = false
  } catch (err) {
    toast.error(err, 'Error al guardar')
  }
}

const toggleStatus = async (item) => {
  try {
    await paymentMethodStore.toggleMethod(item.id)
    toast.success(`Forma de pago ${item.is_active ? 'desactivada' : 'activada'}.`, 'Estado actualizado')
  } catch (err) {
    toast.error(err, 'Error al cambiar estado')
  }
}
</script>

<template>
  <div class="container py-5">
    <PageHeader 
      title="Gestión de Formas de Pago" 
      buttonText="NUEVA FORMA DE PAGO" 
      @action="openCreateModal"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-credit-card-2-front-fill" viewBox="0 0 16 16">
          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
        </svg>
      </template>
    </PageHeader>

    <BaseTable
      :columns="columns"
      :items="paymentMethodStore.methods"
      :loading="paymentMethodStore.loading"
      loadingText="CARGANDO FORMAS DE PAGO..."
      emptyText="NO HAY FORMAS DE PAGO REGISTRADAS"
    >
      <template #cell-name="{ item }">
        <span class="fw-black text-uppercase fs-5">{{ item.name }}</span>
      </template>

      <template #cell-description="{ item }">
        <span class="text-muted fw-bold">{{ item.description || 'Sin descripción' }}</span>
      </template>

      <template #cell-status="{ item }">
        <span 
          class="badge px-3 py-2 fs-7 border border-black fw-bold cursor-pointer"
          :class="item.is_active ? 'bg-success text-white' : 'bg-secondary text-white'"
          @click="toggleStatus(item)"
        >
          {{ item.is_active ? 'ACTIVO' : 'INACTIVO' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <button @click="openEditModal(item)" class="btn btn-secondary fw-black me-2 px-3 m-0 shadow-none">EDITAR</button>
        <button 
          @click="toggleStatus(item)" 
          :class="['btn fw-black px-3 m-0 shadow-none', item.is_active ? 'btn-danger' : 'btn-success text-white']"
        >
          {{ item.is_active ? 'DESACTIVAR' : 'ACTIVAR' }}
        </button>
      </template>
    </BaseTable>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-backdrop" style="background: rgba(0,0,0,0.8); position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:1050; display:flex; align-items:center; justify-content:center;">
      <div class="card border-2 shadow w-100 mx-3" style="max-width: 600px;">
        <div class="card-header bg-black text-white p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center">
          <h2 class="m-0 fw-black text-uppercase fs-3">{{ modalMode === 'create' ? 'NUEVA FORMA DE PAGO' : 'EDITAR FORMA DE PAGO' }}</h2>
          <button @click="closeModal" class="btn btn-danger py-2 px-3 fw-black border border-white text-white m-0 fs-5">X</button>
        </div>
        <div class="card-body p-4 p-md-5 bg-white">
          <form @submit.prevent="saveMethod">
            <div class="mb-4">
              <label class="form-label fw-black text-uppercase fs-6">Nombre de la Forma de Pago (Obligatorio)</label>
              <input v-model="form.name" type="text" class="form-control form-control-lg border-black border-2 fw-bold" placeholder="Ejem: Efectivo, Yape / Plin, Transferencia" required>
            </div>

            <div class="mb-4">
              <label class="form-label fw-black text-uppercase fs-6">Descripción (Opcional)</label>
              <textarea v-model="form.description" class="form-control border-black border-2 fw-bold" rows="3" placeholder="Descripción o instrucciones breves..."></textarea>
            </div>

            <div class="mb-4 form-check form-switch">
              <input v-model="form.is_active" class="form-check-input border-black border-2" type="checkbox" id="isActiveSwitch">
              <label class="form-check-label fw-black text-uppercase ms-2" for="isActiveSwitch">Forma de Pago Activa</label>
            </div>

            <div class="d-flex justify-content-end gap-2 border-top border-black pt-4">
              <button type="button" @click="closeModal" class="btn btn-secondary border-black border-2 fw-black px-4 py-3">CANCELAR</button>
              <button type="submit" class="btn btn-primary border-black border-2 fw-black px-5 py-3">GUARDAR FORMA DE PAGO</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
