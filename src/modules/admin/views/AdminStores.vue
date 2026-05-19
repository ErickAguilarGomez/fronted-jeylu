<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios.js'
import SearchBar from '@/components/common/SearchBar.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const stores = ref([])
const users = ref([])
const loading = ref(false)

const page = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')

const showModal = ref(false)
const showEmployeesModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  address: '',
  phone: ''
})

const currentStoreEmployees = ref([])
const employeeForm = ref({ user_id: '', is_primary: true })

const fetchStores = async (pageNumber = 1) => {
  loading.value = true
  page.value = pageNumber
  try {
    const res = await api.get('/stores', {
      params: { page: page.value, per_page: 10, search: searchQuery.value }
    })
    if (res.data && res.data.success) {
      stores.value = res.data.data
      lastPage.value = res.data.meta.last_page
    }
  } catch (e) {
    toast.error(e, 'Error al cargar tiendas')
  } finally {
    loading.value = false
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchStores(1)
}

const fetchAllUsers = async () => {
  try {
    const res = await api.get('/users', { params: { all: 1 } })
    if (res.data && res.data.success) {
      users.value = res.data.users
    }
  } catch (e) {
    console.error('Error al cargar usuarios:', e)
  }
}

onMounted(() => {
  fetchStores()
  fetchAllUsers()
})

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  form.value = { name: '', address: '', phone: '' }
  showModal.value = true
}

const openEditModal = (store) => {
  isEditing.value = true
  editId.value = store.id
  form.value = { name: store.name, address: store.address, phone: store.phone || '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.address.trim()) {
    toast.warning('El nombre y la dirección son obligatorios.', 'Formulario incompleto')
    return
  }

  loading.value = true

  try {
    if (isEditing.value) {
      await api.put(`/stores/${editId.value}`, form.value)
      toast.success('La sucursal fue actualizada correctamente.', '¡Sucursal actualizada!')
    } else {
      await api.post('/stores', form.value)
      toast.success('La nueva sucursal ha sido registrada.', '¡Sucursal creada!')
    }
    closeModal()
    fetchStores()
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar sucursal' : 'Error al crear sucursal')
  } finally {
    loading.value = false
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

const cancelDeleteStore = () => {
  showConfirmDeleteModal.value = false
  storeIdToDelete.value = null
}

const executeDeleteStore = async () => {
  showConfirmDeleteModal.value = false
  if (!storeIdToDelete.value) return

  loading.value = true

  try {
    await api.delete(`/stores/${storeIdToDelete.value}`)
    toast.success('La sucursal fue eliminada del sistema.', 'Sucursal eliminada')
    fetchStores()
  } catch (e) {
    toast.error(e, 'Error al eliminar sucursal')
    loading.value = false
  } finally {
    storeIdToDelete.value = null
  }
}

// Empleados de Tienda
const openEmployeesModal = async (store) => {
  editId.value = store.id
  employeeForm.value = { user_id: '', is_primary: true }
  showEmployeesModal.value = true
  await fetchEmployees()
}

const closeEmployeesModal = () => {
  showEmployeesModal.value = false
}

const fetchEmployees = async () => {
  loading.value = true
  try {
    const res = await api.get(`/stores/${editId.value}/employees`)
    if (res.data && res.data.success) {
      currentStoreEmployees.value = res.data.employees
    }
  } catch (e) {
    toast.error(e, 'Error al cargar empleados')
  } finally {
    loading.value = false
  }
}

const assignEmployee = async () => {
  if (!employeeForm.value.user_id) {
    toast.warning('Debes seleccionar un usuario de la lista antes de vincular.', 'Selección requerida')
    return
  }
  loading.value = true
  try {
    await api.post(`/stores/${editId.value}/employees`, employeeForm.value)
    toast.success('El usuario fue vinculado a esta sucursal.', 'Empleado asignado')
    employeeForm.value.user_id = ''
    await fetchEmployees()
  } catch (e) {
    toast.error(e, 'Error al asignar empleado')
    loading.value = false
  }
}

const unassignEmployee = async (userId) => {
  if (!confirm('¿Remover a este empleado de la sucursal?')) return
  loading.value = true
  try {
    await api.delete(`/stores/${editId.value}/employees/${userId}`)
    toast.success('El empleado fue removido de la sucursal.', 'Empleado removido')
    await fetchEmployees()
  } catch (e) {
    toast.error(e, 'Error al remover empleado')
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-5 border-bottom border-black pb-4">
      <h1 class="display-5 m-0 fw-black text-uppercase">Gestión de Sucursales</h1>
      <button @click="openAddModal" class="btn btn-primary py-3 px-4 fs-5 fw-black d-flex align-items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16">
          <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .364-.976l2.605-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
        </svg>
        NUEVA TIENDA
      </button>
    </div>

    <div v-if="successMessage" class="alert alert-success border border-black border-2 fs-5 fw-bold mb-4 shadow-sm">
      {{ successMessage }}
    </div>

    <div v-if="error" class="alert alert-danger border border-black border-2 fs-5 fw-bold mb-4 shadow-sm">
      {{ error }}
    </div>

    <div class="d-flex mb-4">
      <SearchBar v-model="searchQuery" @search="handleSearch" placeholder="Buscar por sucursal o dirección..." />
    </div>

    <div class="card border-black border-3 shadow-solid bg-white mb-4">
      <div class="card-body p-0 table-responsive">
        <table class="table table-hover align-middle m-0 fs-5">
          <thead class="table-dark text-uppercase border-bottom border-black border-3">
            <tr>
              <th scope="col" class="py-3 px-4">ID</th>
              <th scope="col" class="py-3 px-4">Sucursal</th>
              <th scope="col" class="py-3 px-4">Dirección</th>
              <th scope="col" class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && stores.length === 0">
              <td colspan="4" class="text-center py-5 fw-bold">CARGANDO TIENDAS...</td>
            </tr>
            <tr v-else-if="stores.length === 0">
              <td colspan="4" class="text-center py-5 fw-bold text-muted">NO HAY TIENDAS REGISTRADAS</td>
            </tr>
            <tr v-for="store in stores" :key="store.id" class="border-bottom border-black">
              <td class="py-4 px-4 fw-black font-monospace">#{{ store.id }}</td>
              <td class="py-4 px-4 fw-bold text-uppercase">{{ store.name }}</td>
              <td class="py-4 px-4">
                <div class="text-muted">{{ store.address }}</div>
                <div v-if="store.phone" class="fs-6 font-monospace">📞 {{ store.phone }}</div>
              </td>
              <td class="py-4 px-4 text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button @click="openEmployeesModal(store)" class="btn btn-info text-white fw-black py-2 px-3 border border-black shadow-sm fs-6">
                    EMPLEADOS
                  </button>
                  <button @click="openEditModal(store)" class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6">
                    EDITAR
                  </button>
                  <button @click="triggerDeleteStore(store.id)" class="btn btn-danger fw-black py-2 px-3 border border-black shadow-sm fs-6" :disabled="store.id === 1">
                    ELIMINAR
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación -->
    <div class="d-flex justify-content-between align-items-center mt-4 mb-5" v-if="lastPage > 1">
      <button @click="fetchStores(page - 1)" :disabled="page <= 1 || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        &laquo; Anterior
      </button>
      <span class="fw-black fs-4 text-uppercase">Página {{ page }} de {{ lastPage }}</span>
      <button @click="fetchStores(page + 1)" :disabled="page >= lastPage || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        Siguiente &raquo;
      </button>
    </div>

    <!-- Modal Brutalista de Edición/Creación -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative">
        <button @click="closeModal" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
        <h2 class="display-6 fw-black text-uppercase mb-4 border-bottom border-black pb-3">
          {{ isEditing ? 'Editar Tienda' : 'Nueva Tienda' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Nombre de la Sucursal</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="EJ. SUCURSAL MIRAFLORES" 
              required
            />
          </div>
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Dirección Física</label>
            <input 
              v-model="form.address" 
              type="text" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="Av. Larco 123" 
              required
            />
          </div>
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Teléfono (Opcional)</label>
            <input 
              v-model="form.phone" 
              type="text" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="+51 999 999 999" 
            />
          </div>
          <div class="d-flex justify-content-end gap-3 mt-3">
            <button type="button" @click="closeModal" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
            <button type="submit" :disabled="loading" class="btn btn-primary py-3 px-5 fw-black fs-5">
              {{ loading ? 'GUARDANDO...' : 'GUARDAR SUCURSAL' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Gestión de Empleados -->
    <div v-if="showEmployeesModal" class="modal-backdrop" @click.self="closeEmployeesModal">
      <div class="modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative" style="max-width: 800px;">
        <button @click="closeEmployeesModal" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
        <h2 class="display-6 fw-black text-uppercase mb-4 border-bottom border-black pb-3">
          Empleados Asignados
        </h2>
        
        <form @submit.prevent="assignEmployee" class="d-flex gap-3 mb-4 p-3 bg-light border border-black border-2">
          <select v-model="employeeForm.user_id" class="form-select border-black border-2 fw-bold" required>
            <option value="" disabled>Seleccione un usuario...</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
          </select>
          <button type="submit" :disabled="loading || !employeeForm.user_id" class="btn btn-primary fw-black text-nowrap px-4 border border-black">
            VINCULAR USUARIO
          </button>
        </form>

        <div class="table-responsive">
          <table class="table table-bordered border-black m-0">
            <thead class="table-dark text-uppercase">
              <tr>
                <th class="p-3">Empleado</th>
                <th class="p-3">Rol</th>
                <th class="p-3">POS Default</th>
                <th class="p-3 text-center">Remover</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentStoreEmployees.length === 0">
                <td colspan="4" class="text-center p-4 fw-bold text-muted">No hay empleados vinculados a esta sucursal.</td>
              </tr>
              <tr v-for="emp in currentStoreEmployees" :key="emp.id">
                <td class="p-3 fw-bold">{{ emp.name }}</td>
                <td class="p-3"><span class="badge bg-secondary text-black border border-black">{{ emp.role_name }}</span></td>
                <td class="p-3 text-center">
                  <span v-if="emp.is_primary" class="badge bg-success text-white">SÍ</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="p-3 text-center">
                  <button @click="unassignEmployee(emp.id)" class="btn btn-sm btn-danger fw-black border border-black" :disabled="emp.id === 1">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Modal Brutalista de Confirmación de Eliminación -->
    <div v-if="showConfirmDeleteModal" class="modal-backdrop" style="background: rgba(0,0,0,0.8); z-index: 1100;">
      <div class="card border-black border-4 shadow-solid p-5 bg-white text-center" style="max-width: 500px; width: 100%;">
        <div class="text-danger mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
            <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
          </svg>
        </div>
        <h3 class="fw-black text-uppercase mb-3">¿CONFIRMAR ELIMINACIÓN?</h3>
        <p class="fs-5 fw-bold text-muted mb-4">{{ confirmDeleteMessage }}</p>
        <div class="d-flex gap-3 justify-content-center">
          <button type="button" @click="cancelDeleteStore" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
          <button type="button" @click="executeDeleteStore" class="btn btn-danger py-3 px-4 fw-black fs-5">SÍ, ELIMINAR</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}
.modal-card {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
