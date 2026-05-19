<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import SearchBar from '@/components/common/SearchBar.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const categories = ref([])
const loading = ref(false)

const page = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  description: ''
})

const fetchCategories = async (pageNumber = 1) => {
  loading.value = true
  page.value = pageNumber
  try {
    const res = await api.get('/categories', {
      params: { page: page.value, per_page: 10, search: searchQuery.value }
    })
    if (res.data && res.data.success) {
      categories.value = res.data.data
      lastPage.value = res.data.meta.last_page
    }
  } catch (e) {
    toast.error(e, 'Error al cargar categorías')
  } finally {
    loading.value = false
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  fetchCategories(1)
}

onMounted(() => {
  fetchCategories()
})

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  form.value = { name: '', description: '' }
  showModal.value = true
}

const openEditModal = (cat) => {
  isEditing.value = true
  editId.value = cat.id
  form.value = { name: cat.name, description: cat.description || '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    toast.warning('El nombre de la categoría es obligatorio.', 'Campo requerido')
    return
  }

  loading.value = true

  try {
    if (isEditing.value) {
      await api.put(`/categories/${editId.value}`, form.value)
      toast.success('La categoría fue actualizada correctamente.', '¡Categoría actualizada!')
    } else {
      await api.post('/categories', form.value)
      toast.success('La nueva categoría ha sido registrada.', '¡Categoría creada!')
    }
    closeModal()
    fetchCategories()
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar categoría' : 'Error al crear categoría')
  } finally {
    loading.value = false
  }
}

const showConfirmDeleteModal = ref(false)
const confirmDeleteMessage = ref('')
const categoryIdToDelete = ref(null)

const triggerDeleteCategory = (id) => {
  categoryIdToDelete.value = id
  confirmDeleteMessage.value = '¿Estás seguro de eliminar esta categoría? Todos los productos asociados deberán ser reclasificados.'
  showConfirmDeleteModal.value = true
}

const cancelDeleteCategory = () => {
  showConfirmDeleteModal.value = false
  categoryIdToDelete.value = null
}

const executeDeleteCategory = async () => {
  showConfirmDeleteModal.value = false
  if (!categoryIdToDelete.value) return

  loading.value = true

  try {
    await api.delete(`/categories/${categoryIdToDelete.value}`)
    toast.success('La categoría fue eliminada del sistema.', 'Categoría eliminada')
    fetchCategories()
  } catch (e) {
    toast.error(e, 'Error al eliminar categoría')
    loading.value = false
  } finally {
    categoryIdToDelete.value = null
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-5 border-bottom border-black pb-4">
      <h1 class="display-5 m-0 fw-black text-uppercase">Gestión de Categorías</h1>
      <button @click="openAddModal" class="btn btn-primary py-3 px-4 fs-5 fw-black d-flex align-items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
        </svg>
        NUEVA CATEGORÍA
      </button>
    </div>

    <div class="d-flex mb-4">
      <SearchBar v-model="searchQuery" @search="handleSearch" placeholder="Buscar por nombre o descripción..." />
    </div>

    <div class="card border-black border-3 shadow-solid bg-white mb-4">
      <div class="card-body p-0 table-responsive">
        <table class="table table-hover align-middle m-0 fs-5">
          <thead class="table-dark text-uppercase border-bottom border-black border-3">
            <tr>
              <th scope="col" class="py-3 px-4">ID</th>
              <th scope="col" class="py-3 px-4">Nombre</th>
              <th scope="col" class="py-3 px-4">Descripción</th>
              <th scope="col" class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && categories.length === 0">
              <td colspan="4" class="text-center py-5 fw-bold">CARGANDO CATEGORÍAS...</td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="4" class="text-center py-5 fw-bold text-muted">NO HAY CATEGORÍAS REGISTRADAS</td>
            </tr>
            <tr v-for="cat in categories" :key="cat.id" class="border-bottom border-black">
              <td class="py-4 px-4 fw-black font-monospace">#{{ cat.id }}</td>
              <td class="py-4 px-4 fw-bold text-uppercase">{{ cat.name }}</td>
              <td class="py-4 px-4 text-muted">{{ cat.description || 'Sin descripción' }}</td>
              <td class="py-4 px-4 text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button @click="openEditModal(cat)" class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6">
                    EDITAR
                  </button>
                  <button @click="triggerDeleteCategory(cat.id)" class="btn btn-danger fw-black py-2 px-3 border border-black shadow-sm fs-6">
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
      <button @click="fetchCategories(page - 1)" :disabled="page <= 1 || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        &laquo; Anterior
      </button>
      <span class="fw-black fs-4 text-uppercase">Página {{ page }} de {{ lastPage }}</span>
      <button @click="fetchCategories(page + 1)" :disabled="page >= lastPage || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
        Siguiente &raquo;
      </button>
    </div>

    <!-- Modal Brutalista de Edición/Creación -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative">
        <button @click="closeModal" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
        <h2 class="display-6 fw-black text-uppercase mb-4 border-bottom border-black pb-3">
          {{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Nombre de la Categoría</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              placeholder="EJ. CALZADO URBANO" 
              required
            />
          </div>
          <div>
            <label class="form-label fw-black text-uppercase fs-5">Descripción (Opcional)</label>
            <textarea 
              v-model="form.description" 
              class="form-control border-black border-3 p-3 fs-5 fw-bold" 
              rows="3"
              placeholder="Descripción breve..."
            ></textarea>
          </div>
          <div class="d-flex justify-content-end gap-3 mt-3">
            <button type="button" @click="closeModal" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
            <button type="submit" :disabled="loading" class="btn btn-primary py-3 px-5 fw-black fs-5">
              {{ loading ? 'GUARDANDO...' : 'GUARDAR CATEGORÍA' }}
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
          <button type="button" @click="cancelDeleteCategory" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
          <button type="button" @click="executeDeleteCategory" class="btn btn-danger py-3 px-4 fw-black fs-5">SÍ, ELIMINAR</button>
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
