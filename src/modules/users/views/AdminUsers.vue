<script setup>
import { ref, onMounted } from 'vue'
import { userStore } from '../stores/userStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import BaseSearch from '@/shared/components/BaseSearch.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BasePagination from '@/shared/components/BasePagination.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import UserFormModal from '../components/UserFormModal.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const activeUserData = ref({
  name: '',
  email: '',
  password: '',
  role_id: 3,
  store_id: ''
})

const columns = [
  { key: 'id', label: 'ID', class: 'fw-black font-monospace' },
  { key: 'user_info', label: 'Nombre / Email' },
  { key: 'role', label: 'Rol' },
  { key: 'actions', label: 'Acciones', headerClass: 'text-center', class: 'text-center' }
]

const fetchUsers = async (page = 1) => {
  try {
    await userStore.fetchUsers(page, searchQuery.value)
  } catch (e) {
    toast.error(e, 'Error al cargar usuarios')
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchUsers(1)
}

onMounted(() => {
  fetchUsers()
  userStore.fetchRoles()
  userStore.fetchAllStores()
})

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  activeUserData.value = { name: '', email: '', password: '', role_id: 3, store_id: '' }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditing.value = true
  editId.value = user.id
  activeUserData.value = { name: user.name, email: user.email, password: '', role_id: user.role_id, store_id: user.store_id || '' }
  showModal.value = true
}

const handleSubmit = async (formData) => {
  if (!formData.name.trim() || !formData.email.trim() || !formData.role_id) {
    toast.warning('Completa todos los campos obligatorios.', 'Formulario incompleto')
    return
  }
  if (Number(formData.role_id) === 2 && !formData.store_id) {
    toast.warning('La sucursal es obligatoria para el rol de Cajero.', 'Sucursal requerida')
    return
  }
  if (!isEditing.value && !formData.password) {
    toast.warning('La contraseña es obligatoria para crear un nuevo usuario.', 'Campo requerido')
    return
  }

  try {
    if (isEditing.value) {
      await userStore.updateUser(editId.value, formData)
      toast.success('El usuario ha sido actualizado correctamente.', '¡Usuario actualizado!')
      if (editId.value === authStore.user?.id) {
        await authStore.fetchUser()
      }
    } else {
      await userStore.createUser(formData)
      toast.success('El nuevo usuario ha sido creado y puede iniciar sesión.', '¡Usuario creado!')
    }
    showModal.value = false
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar usuario' : 'Error al crear usuario')
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

const executeDeleteUser = async () => {
  showConfirmDeleteModal.value = false
  if (!userIdToDelete.value) return

  try {
    await userStore.deleteUser(userIdToDelete.value)
    toast.success('El usuario fue eliminado del sistema.', 'Usuario eliminado')
  } catch (e) {
    toast.error(e, 'Error al eliminar usuario')
  } finally {
    userIdToDelete.value = null
  }
}
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Gestión de Usuarios" buttonText="NUEVO USUARIO" @action="openAddModal">
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
          <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
      </template>
    </PageHeader>

    <div class="d-flex mb-4">
      <BaseSearch v-model="searchQuery" @search="handleSearch" :loading="userStore.loading" placeholder="Buscar por nombre, email o rol..." />
    </div>

    <BaseTable
      :columns="columns"
      :items="userStore.users"
      :loading="userStore.loading"
      loadingText="CARGANDO USUARIOS..."
      emptyText="NO HAY USUARIOS REGISTRADOS"
    >
      <template #cell-id="{ item }">
        #{{ item.id }}
      </template>
      <template #cell-user_info="{ item }">
        <div class="fw-bold text-uppercase">{{ item.name }}</div>
        <div class="text-muted fs-6">{{ item.email }}</div>
      </template>
      <template #cell-role="{ item }">
        <span class="badge bg-black text-white border border-black px-3 py-2 fs-6 shadow-sm">
          {{ item.role_name.toUpperCase() }}
        </span>
        <div v-if="item.store_name" class="mt-2 fs-6 fw-bold text-uppercase text-muted">
          🏢 {{ item.store_name }}
        </div>
      </template>
      <template #cell-actions="{ item }">
        <div class="d-flex justify-content-center gap-2">
          <button @click="openEditModal(item)" class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6">
            EDITAR
          </button>
          <BaseButton variant="danger" @click="triggerDeleteUser(item.id)" :disabled="item.id === authStore.user?.id || item.id === 1" class="py-2 px-3 fs-6">
            ELIMINAR
          </BaseButton>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      :page="userStore.page"
      :lastPage="userStore.lastPage"
      :loading="userStore.loading"
      @change="fetchUsers"
    />

    <!-- Modal Edición/Creación -->
    <UserFormModal
      :show="showModal"
      :isEditing="isEditing"
      :userData="activeUserData"
      :loading="userStore.loading"
      @close="showModal = false"
      @submit="handleSubmit"
    />

    <ConfirmDeleteModal
      :show="showConfirmDeleteModal"
      :message="confirmDeleteMessage"
      @confirm="executeDeleteUser"
      @cancel="showConfirmDeleteModal = false; userIdToDelete = null"
    />
  </div>
</template>
