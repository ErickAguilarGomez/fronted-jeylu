<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import SearchBar from '@/components/common/SearchBar.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const users = ref([])
const roles = ref([])
const loading = ref(false)

// Pagination & Search
const page = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  email: '',
  password: '',
  role_id: 3 // Default a Usuario
})

const fetchUsers = async (pageNumber = 1) => {
  loading.value = true
  page.value = pageNumber
  try {
    const res = await api.get('/users', {
      params: { page: page.value, per_page: 10, search: searchQuery.value }
    })
    if (res.data && res.data.success) {
      users.value = res.data.data
      lastPage.value = res.data.meta.last_page
    }
  } catch (e) {
    toast.error(e, 'Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchUsers(1)
}

const fetchRoles = async () => {
  try {
    const res = await api.get('/users/roles')
    if (res.data && res.data.success) {
      roles.value = res.data.roles
    }
  } catch (e) {
    console.error('Error al cargar roles:', e)
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  form.value = { name: '', email: '', password: '', role_id: 3 }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditing.value = true
  editId.value = user.id
  form.value = { name: user.name, email: user.email, password: '', role_id: user.role_id }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.role_id) {
    toast.warning('Completa todos los campos obligatorios.', 'Formulario incompleto')
    return
  }
  if (!isEditing.value && !form.value.password) {
    toast.warning('La contraseña es obligatoria para crear un nuevo usuario.', 'Campo requerido')
    return
  }

  loading.value = true

  try {
    if (isEditing.value) {
      await api.put(`/users/${editId.value}`, form.value)
      toast.success('El usuario ha sido actualizado correctamente.', '¡Usuario actualizado!')
      if (editId.value === authStore.user?.id) {
        await authStore.fetchUser()
      }
    } else {
      await api.post('/users', form.value)
      toast.success('El nuevo usuario ha sido creado y puede iniciar sesión.', '¡Usuario creado!')
    }
    closeModal()
    fetchUsers()
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar usuario' : 'Error al crear usuario')
  } finally {
    loading.value = false
  }
}

const showConfirmDeleteModal = ref(false)
const confirmDeleteMessage = ref('')
const userIdToDelete = ref(null)

const triggerDeleteUser = (id) => {
  userIdToDelete.value = id
  confirmDeleteMessage.value = '¿Estás completamente seguro de eliminar a este usuario del sistema? Esta acción no se puede deshacer.'
  showConfirmDeleteModal.value = true
}

const cancelDeleteUser = () => {
  showConfirmDeleteModal.value = false
  userIdToDelete.value = null
}

const executeDeleteUser = async () => {
  showConfirmDeleteModal.value = false
  if (!userIdToDelete.value) return

  loading.value = true

  try {
    await api.delete(`/users/${userIdToDelete.value}`)
    toast.success('El usuario fue eliminado del sistema.', 'Usuario eliminado')
    fetchUsers()
  } catch (e) {
    toast.error(e, 'Error al eliminar usuario')
    loading.value = false
  } finally {
    userIdToDelete.value = null
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-5 border-bottom border-black pb-4">
      <h1 class="display-5 m-0 fw-black text-uppercase">Gestión de Usuarios</h1>
      <button @click="openAddModal" class="btn btn-primary py-3 px-4 fs-5 fw-black d-flex align-items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
          <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
        NUEVO USUARIO
      </button>
    </div>

    <div class="d-flex mb-4">
      <SearchBar v-model="searchQuery" @search="handleSearch" placeholder="Buscar por nombre, email o rol..." />
    </div>

    <div class="card border-black border-3 shadow-solid bg-white mb-4">
      <div class="card-body p-0 table-responsive">
        <table class="table table-hover align-middle m-0 fs-5">
          <thead class="table-dark text-uppercase border-bottom border-black border-3">
            <tr>
              <th scope="col" class="py-3 px-4">ID</th>
              <th scope="col" class="py-3 px-4">Nombre / Email</th>
              <th scope="col" class="py-3 px-4">Rol</th>
              <th scope="col" class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && users.length === 0">
              <td colspan="4" class="text-center py-5 fw-bold">CARGANDO USUARIOS...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="4" class="text-center py-5 fw-bold text-muted">NO HAY USUARIOS REGISTRADOS</td>
            </tr>
            <tr v-for="user in users" :key="user.id" class="border-bottom border-black">
              <td class="py-4 px-4 fw-black font-monospace">#{{ user.id }}</td>
              <td class="py-4 px-4">
                <div class="fw-bold text-uppercase">{{ user.name }}</div>
                <div class="text-muted fs-6">{{ user.email }}</div>
              </td>
              <td class="py-4 px-4">
                <span class="badge bg-black text-white border border-black px-3 py-2 fs-6 shadow-sm">
                  {{ user.role_name.toUpperCase() }}
                </span>
              </td>
              <td class="py-4 px-4 text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button @click="openEditModal(user)" class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6">
                    EDITAR
                  </button>
                  <button @click="triggerDeleteUser(user.id)" class="btn btn-danger fw-black py-2 px-3 border border-black shadow-sm fs-6" :disabled="user.id === authStore.user?.id || user.id === 1">
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
      <button @click="fetchUsers(page - 1)" :disabled="page <= 1 || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        &laquo; Anterior
      </button>
      <span class="fw-black fs-4 text-uppercase">Página {{ page }} de {{ lastPage }}</span>
      <button @click="fetchUsers(page + 1)" :disabled="page >= lastPage || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        Siguiente &raquo;
      </button>
    </div>

    <!-- Modal Brutalista de Edición/Creación -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative">
        <button @click="closeModal" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
        <h2 class="display-6 fw-black text-uppercase mb-4 border-bottom border-black pb-3">
          {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Nombre Completo</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="EJ. JUAN PÉREZ" 
              required
            />
          </div>
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Correo Electrónico</label>
            <input 
              v-model="form.email" 
              type="email" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="juan@ejemplo.com" 
              required
            />
          </div>
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Contraseña {{ isEditing ? '(Opcional: Dejar en blanco para mantener actual)' : '' }}</label>
            <input 
              v-model="form.password" 
              type="password" 
              autocomplete="new-password"
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="********" 
              :required="!isEditing"
            />
          </div>
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Rol de Sistema</label>
            <select v-model="form.role_id" class="form-select border-black border-3 p-3 fs-5 fw-bold" required>
              <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name.toUpperCase() }}</option>
            </select>
          </div>
          <div class="d-flex justify-content-end gap-3 mt-3">
            <button type="button" @click="closeModal" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
            <button type="submit" :disabled="loading" class="btn btn-primary py-3 px-5 fw-black fs-5">
              {{ loading ? 'GUARDANDO...' : 'GUARDAR USUARIO' }}
            </button>
          </div>
        </form>
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
          <button type="button" @click="cancelDeleteUser" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
          <button type="button" @click="executeDeleteUser" class="btn btn-danger py-3 px-4 fw-black fs-5">SÍ, ELIMINAR</button>
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
