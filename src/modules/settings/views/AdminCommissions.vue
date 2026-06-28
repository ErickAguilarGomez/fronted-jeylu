<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import { useToast } from '@/composables/useToast.js'
import api from '@/plugins/axios'

const toast = useToast()
const sellers = ref([])
const loading = ref(false)

const showModal = ref(false)
const selectedSeller = ref(null)
const commissionForm = ref({
  commission_percentage: 0.00
})
const saving = ref(false)

const columns = [
  { key: 'name', label: 'Nombre', class: 'fw-black text-uppercase' },
  { key: 'email', label: 'Correo Electrónico', class: 'text-muted' },
  { key: 'store_name', label: 'Sucursal Primaria', class: 'fw-bold text-uppercase' },
  { key: 'commission_percentage', label: '% Comisión', class: 'text-center fw-bold fs-5', headerClass: 'text-center' },
  { key: 'actions', label: 'Acciones', class: 'text-end', headerClass: 'text-center text-nowrap' }
]

const fetchSellers = async () => {
  loading.value = true
  try {
    const res = await api.get('/users/sellers/commissions')
    if (res.data && res.data.success) {
      sellers.value = res.data.data
    }
  } catch (err) {
    toast.error(err, 'Error al cargar comisiones de vendedores')
  } finally {
    loading.value = false
  }
}

const openEditModal = (seller) => {
  selectedSeller.value = seller
  commissionForm.value.commission_percentage = Number(seller.commission_percentage || 0)
  showModal.value = true
}

const close = () => {
  showModal.value = false
  selectedSeller.value = null
}

const saveCommission = async () => {
  const percentage = Number(commissionForm.value.commission_percentage)
  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    toast.warning('El porcentaje de comisión debe estar entre 0% y 100%.', 'Porcentaje Inválido')
    return
  }

  saving.value = true
  try {
    const res = await api.put(`/users/sellers/${selectedSeller.value.id}/commissions`, {
      commission_percentage: percentage
    })
    if (res.data && res.data.success) {
      toast.success('Comisión de vendedor actualizada con éxito.', 'Comisión Actualizada')
      await fetchSellers()
      close()
    }
  } catch (err) {
    toast.error(err, 'Error al actualizar comisión')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSellers()
})
</script>

<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <PageHeader title="Comisiones de Vendedores" />
      <router-link to="/admin" class="btn btn-outline-dark border-black border-2 fw-black px-4 py-2 shadow-none m-0">
        ← VOLVER AL PANEL
      </router-link>
    </div>

    <!-- Info Box -->
    <div class="alert bg-light border-black border-2 shadow-sm mb-5 p-4" style="box-shadow: 4px 4px 0px #000 !important;">
      <h5 class="fw-black text-uppercase mb-2">ℹ️ Información sobre Comisiones</h5>
      <p class="m-0 fw-semibold text-muted">
        En esta sección el administrador puede asignar un porcentaje fijo de comisión a cada usuario que posea el rol de 
        <strong class="text-black">Vendedor</strong>. Esta comisión se calculará automáticamente sobre el total de cada 
        venta concretada por dicho vendedor desde el POS y quedará registrada en el historial histórico de ventas.
      </p>
    </div>

    <BaseTable
      :columns="columns"
      :items="sellers"
      :loading="loading"
      loadingText="CARGANDO VENDEDORES..."
      emptyText="NO HAY VENDEDORES REGISTRADOS"
    >
      <template #cell-store_name="{ item }">
        <span class="badge bg-secondary border border-black text-uppercase px-3 py-2 fw-bold text-black small">
          {{ item.store_name || 'SIN ASIGNAR' }}
        </span>
      </template>
      <template #cell-commission_percentage="{ item }">
        <span class="fw-black">{{ Number(item.commission_percentage || 0).toFixed(2) }} %</span>
      </template>
      <template #cell-actions="{ item }">
        <button @click="openEditModal(item)" class="btn btn-primary fw-black px-3 py-2 m-0 shadow-none">
          AJUSTAR COMISIÓN
        </button>
      </template>
    </BaseTable>

    <!-- Modal Configuración Comisión -->
    <div v-if="showModal" class="modal-backdrop" style="background: rgba(0,0,0,0.85); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div class="card border-2 border-black shadow w-100" style="max-width: 500px; box-shadow: 8px 8px 0px #000 !important; border-radius: 0px;">
        <div class="card-header bg-black text-white p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center">
          <h4 class="m-0 fw-black text-uppercase">CONFIGURAR COMISIÓN</h4>
          <button type="button" @click="close" class="btn btn-danger py-1 px-3 fw-black border border-white text-white m-0 fs-5">X</button>
        </div>
        
        <div class="card-body p-4 bg-white">
          <div class="mb-4">
            <label class="form-label fw-black text-uppercase text-muted fs-7">VENDEDOR SELECCIONADO</label>
            <div class="fs-5 fw-black text-uppercase mb-1 text-primary">{{ selectedSeller?.name }}</div>
            <div class="small text-muted font-monospace">{{ selectedSeller?.email }}</div>
          </div>

          <form @submit.prevent="saveCommission">
            <div class="mb-4">
              <label class="form-label fw-black text-uppercase fs-6">Porcentaje de Comisión (%)</label>
              <div class="input-group border border-black border-2">
                <input 
                  v-model.number="commissionForm.commission_percentage" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  class="form-control border-0 shadow-none fw-black fs-4 py-3" 
                  placeholder="0.00" 
                  required
                >
                <span class="input-group-text bg-secondary border-0 fw-black px-4 fs-4">%</span>
              </div>
              <div class="form-text text-muted mt-2 fw-semibold">Ingrese un valor decimal o entero comprendido entre 0.00% y 100.00%.</div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-3 fw-black text-uppercase fs-5 m-0" :disabled="saving">
              {{ saving ? 'GUARDANDO AJUSTES...' : 'GUARDAR AJUSTES' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
