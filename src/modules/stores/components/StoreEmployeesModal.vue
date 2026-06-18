<script setup>
import { ref, watch } from 'vue'
import { storeStore } from '../stores/storeStore.js'
import BaseModal from '@/shared/components/BaseModal.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import SearchableSelect from '@/shared/components/SearchableSelect.vue'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  storeId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close'])
const toast = useToast()

const employeeForm = ref({ user_id: '', is_primary: true })

const employeeColumns = [
  { key: 'name', label: 'Empleado', class: 'fw-bold' },
  { key: 'role_name', label: 'Rol' },
  { key: 'is_primary', label: 'POS Default', headerClass: 'text-center', class: 'text-center' },
  { key: 'actions', label: 'Acciones', headerClass: 'text-center', class: 'text-center' }
]

watch(() => props.show, (newShow) => {
  if (newShow && props.storeId) {
    employeeForm.value = { user_id: '', is_primary: true }
    storeStore.fetchEmployees(props.storeId)
  }
})

const assignEmployee = async () => {
  if (!employeeForm.value.user_id) {
    toast.warning('Debes seleccionar un usuario de la lista antes de vincular.', 'Selección requerida')
    return
  }
  try {
    await storeStore.assignEmployee(props.storeId, employeeForm.value)
    toast.success('El usuario fue vinculado a esta sucursal.', 'Empleado asignado')
    employeeForm.value.user_id = ''
  } catch (e) {
    toast.error(e, 'Error al asignar empleado')
  }
}

const unassignEmployee = async (userId) => {
  if (!confirm('¿Remover a este empleado de la sucursal?')) return
  try {
    await storeStore.unassignEmployee(props.storeId, userId)
    toast.success('El empleado fue removido de la sucursal.', 'Empleado removido')
  } catch (e) {
    toast.error(e, 'Error al remover empleado')
  }
}
</script>

<template>
  <BaseModal :show="show" title="Empleados Asignados" maxWidth="800px" @close="emit('close')">
    <div class="d-flex flex-column gap-3">
      <!-- Formulario de Asignación -->
      <form @submit.prevent="assignEmployee" class="d-flex align-items-end gap-3 mb-3 bg-light border border-black border-2 p-3 shadow-solid-sm">
        <div class="flex-grow-1">
          <label class="form-label fw-black text-uppercase fs-7 m-0 mb-1">Vincular Nuevo Empleado</label>
          <SearchableSelect
            v-model="employeeForm.user_id"
            :options="storeStore.sellerUsers"
            placeholder="Seleccionar cajero..."
            :required="false"
          />
        </div>
        <div class="form-check mb-2">
          <input v-model="employeeForm.is_primary" type="checkbox" class="form-check-input border-black" id="primaryCheck">
          <label class="form-check-label fw-bold text-uppercase fs-7 ms-1" for="primaryCheck">POS Default</label>
        </div>
        <BaseButton type="submit" variant="primary" class="py-2 px-3 border border-black shadow-sm">VINCULAR</BaseButton>
      </form>

      <!-- Listado de Empleados -->
      <BaseTable
        :columns="employeeColumns"
        :items="storeStore.currentStoreEmployees"
        :loading="storeStore.loading"
        emptyText="No hay empleados vinculados a esta sucursal."
      >
        <template #cell-role_name="{ item }">
          <span class="badge bg-secondary text-black border border-black">{{ item.role_name }}</span>
        </template>
        <template #cell-is_primary="{ item }">
          <span v-if="item.is_primary" class="badge bg-success text-white">SÍ</span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell-actions="{ item }">
          <BaseButton variant="danger" @click="unassignEmployee(item.id)" class="py-1 px-2 fs-7">
            REMOVER
          </BaseButton>
        </template>
      </BaseTable>
    </div>
  </BaseModal>
</template>

<style scoped>
.shadow-solid-sm {
  box-shadow: 4px 4px 0px #000 !important;
}
</style>
