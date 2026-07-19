<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/shared/components/BaseModal.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  categoryData: {
    type: Object,
    default: () => ({ name: '', description: '' })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])
const toast = useToast()

const localForm = ref({
  name: '',
  description: '',
  unit_of_measure: ''
})

watch(() => props.show, (newShow) => {
  if (newShow) {
    localForm.value = {
      name: props.categoryData.name || '',
      description: props.categoryData.description || '',
      unit_of_measure: props.categoryData.unit_of_measure || ''
    }
  }
})

const handleSubmit = () => {
  if (!localForm.value.name.trim()) {
    toast.warning('El nombre de la categoría es obligatorio.', 'Campo requerido')
    return
  }
  emit('submit', { ...localForm.value })
}
</script>

<template>
  <BaseModal :show="show" :title="isEditing ? 'Editar Categoría' : 'Nueva Categoría'" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Nombre de la Categoría</label>
        <input 
          v-model="localForm.name" 
          type="text" 
          class="form-control border-black border-3 p-3 fs-5 fw-bold" 
          placeholder="EJ. CALZADO URBANO" 
          required
        />
      </div>
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Descripción (Opcional)</label>
        <textarea 
          v-model="localForm.description" 
          class="form-control border-black border-3 p-3 fs-5 fw-bold" 
          rows="3"
          placeholder="Descripción breve..."
        ></textarea>
      </div>
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Unidad de Medida (Opcional)</label>
        <input 
          v-model="localForm.unit_of_measure" 
          type="text" 
          class="form-control border-black border-3 p-3 fs-5 fw-bold" 
          placeholder="Ejem: kg, g, ml, L, caja, paquete, unidad..." 
        />
      </div>
      <div class="d-flex justify-content-end gap-3 mt-3">
        <BaseButton type="button" variant="secondary" @click="emit('close')" class="py-3 px-4 fs-5">CANCELAR</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="loading" class="py-3 px-5 fs-5">
          {{ loading ? 'GUARDANDO...' : 'GUARDAR CATEGORÍA' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
