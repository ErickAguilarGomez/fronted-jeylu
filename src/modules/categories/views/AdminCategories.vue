<script setup>
import { ref, onMounted } from 'vue'
import { categoryStore } from '../stores/categoryStore.js'
import BaseSearch from '@/shared/components/BaseSearch.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseTable from '@/shared/components/BaseTable.vue'
import BasePagination from '@/shared/components/BasePagination.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal.vue'
import CategoryFormModal from '../components/CategoryFormModal.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const activeCategoryData = ref({
  name: '',
  description: ''
})

const columns = [
  { key: 'id', label: 'ID', class: 'fw-black font-monospace' },
  { key: 'name', label: 'Nombre', class: 'fw-bold text-uppercase' },
  { key: 'description', label: 'Descripción', class: 'text-muted' },
  { key: 'unit_of_measure', label: 'Unidad de Medida', class: 'font-monospace small fw-bold' },
  { key: 'actions', label: 'Acciones', headerClass: 'text-center', class: 'text-center' }
]

const fetchCategories = async (page = 1) => {
  try {
    await categoryStore.fetchCategories(page, searchQuery.value)
  } catch (e) {
    toast.error(e, 'Error al cargar categorías')
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
  activeCategoryData.value = { name: '', description: '', unit_of_measure: '' }
  showModal.value = true
}

const openEditModal = (cat) => {
  isEditing.value = true
  editId.value = cat.id
  activeCategoryData.value = { 
    name: cat.name, 
    description: cat.description || '', 
    unit_of_measure: cat.unit_of_measure || ''
  }
  showModal.value = true
}

const handleSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      await categoryStore.updateCategory(editId.value, formData)
      toast.success('La categoría fue actualizada correctamente.', '¡Categoría actualizada!')
    } else {
      await categoryStore.createCategory(formData)
      toast.success('La nueva categoría ha sido registrada.', '¡Categoría creada!')
    }
    showModal.value = false
  } catch (e) {
    toast.error(e, isEditing.value ? 'Error al actualizar categoría' : 'Error al crear categoría')
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

const executeDeleteCategory = async () => {
  showConfirmDeleteModal.value = false
  if (!categoryIdToDelete.value) return

  try {
    await categoryStore.deleteCategory(categoryIdToDelete.value)
    toast.success('La categoría fue eliminada del sistema.', 'Categoría eliminada')
  } catch (e) {
    toast.error(e, 'Error al eliminar categoría')
  } finally {
    categoryIdToDelete.value = null
  }
}
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Gestión de Categorías" buttonText="NUEVA CATEGORÍA" @action="openAddModal">
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
        </svg>
      </template>
    </PageHeader>

    <div class="d-flex mb-4">
      <BaseSearch v-model="searchQuery" :loading="categoryStore.loading" @search="handleSearch" placeholder="Buscar por nombre o descripción..." />
    </div>

    <BaseTable
      :columns="columns"
      :items="categoryStore.categories"
      :loading="categoryStore.loading"
      loadingText="CARGANDO CATEGORÍAS..."
      emptyText="NO HAY CATEGORÍAS REGISTRADAS"
    >
      <template #cell-id="{ item }">
        #{{ item.id }}
      </template>
      <template #cell-description="{ item }">
        {{ item.description || 'Sin descripción' }}
      </template>
      <template #cell-unit_of_measure="{ item }">
        <span v-if="item.unit_of_measure" class="badge bg-black text-white">{{ item.unit_of_measure.toUpperCase() }}</span>
        <span v-else class="text-muted font-monospace">—</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="d-flex justify-content-center gap-2">
          <button @click="openEditModal(item)" class="btn btn-warning fw-black py-2 px-3 border border-black shadow-sm fs-6">
            EDITAR
          </button>
          <BaseButton variant="danger" @click="triggerDeleteCategory(item.id)" class="py-2 px-3 fs-6">
            ELIMINAR
          </BaseButton>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      :page="categoryStore.page"
      :lastPage="categoryStore.lastPage"
      :loading="categoryStore.loading"
      @change="fetchCategories"
    />

    <!-- Modal Formulario Creación/Edición -->
    <CategoryFormModal
      :show="showModal"
      :isEditing="isEditing"
      :categoryData="activeCategoryData"
      :loading="categoryStore.loading"
      @close="showModal = false"
      @submit="handleSubmit"
    />

    <ConfirmDeleteModal
      :show="showConfirmDeleteModal"
      :message="confirmDeleteMessage"
      @confirm="executeDeleteCategory"
      @cancel="showConfirmDeleteModal = false; categoryIdToDelete = null"
    />
  </div>
</template>
