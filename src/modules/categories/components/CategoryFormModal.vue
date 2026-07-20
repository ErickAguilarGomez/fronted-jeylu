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
    default: () => ({ name: '', description: '', unit_of_measure: '', discount_enabled: false, discount_percentage: '' })
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
  unit_of_measure: '',
  discount_enabled: false,
  discount_percentage: ''
})

watch(() => props.show, (newShow) => {
  if (newShow) {
    localForm.value = {
      name: props.categoryData.name || '',
      description: props.categoryData.description || '',
      unit_of_measure: props.categoryData.unit_of_measure || '',
      discount_enabled: Boolean(props.categoryData.discount_enabled),
      discount_percentage: props.categoryData.discount_percentage || ''
    }
  }
})

const handleSubmit = () => {
  if (!localForm.value.name.trim()) {
    toast.warning('El nombre de la categoría es obligatorio.', 'Campo requerido')
    return
  }

  if (localForm.value.discount_enabled) {
    const pct = Number(localForm.value.discount_percentage)
    if (!pct || pct < 1 || pct > 100) {
      toast.warning('El porcentaje de descuento debe estar entre 1% y 100%.', 'Descuento inválido')
      return
    }
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

      <!-- Discount section -->
      <div class="p-3 border border-black border-3 bg-light">
        <label class="form-label fw-black text-uppercase fs-5 mb-2 d-block">
          🏷️ Configuración de Descuento
        </label>
        
        <div class="mb-3">
          <label class="form-label fw-bold small text-muted d-block">¿Aplicar descuento específico a esta categoría?</label>
          <div class="btn-group w-100 border border-black border-2" role="group">
            <button
              type="button"
              :class="['btn fw-black py-2 fs-6', localForm.discount_enabled ? 'btn-black text-white' : 'btn-white text-black']"
              @click="localForm.discount_enabled = true"
            >
              SÍ, APLICAR DESCUENTO
            </button>
            <button
              type="button"
              :class="['btn fw-black py-2 fs-6', !localForm.discount_enabled ? 'btn-black text-white' : 'btn-white text-black']"
              @click="localForm.discount_enabled = false; localForm.discount_percentage = ''"
            >
              NO (USAR GENERAL O NINGUNO)
            </button>
          </div>
        </div>

        <div v-if="localForm.discount_enabled" class="mt-3">
          <label class="form-label fw-black text-uppercase fs-6">Porcentaje de Descuento (%)</label>
          <div class="input-group border border-black border-2">
            <input 
              v-model="localForm.discount_percentage" 
              type="number" 
              min="1" 
              max="100" 
              step="0.01" 
              class="form-control border-0 shadow-none fw-black fs-4 p-2 text-center" 
              placeholder="Ejem: 15" 
              required
            />
            <span class="input-group-text bg-black text-white fw-black fs-4 border-0 px-3">%</span>
          </div>
          <small class="text-muted fw-bold mt-1 d-block">
            Este descuento tendrá prioridad sobre el descuento general de la tienda.
          </small>
        </div>
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

<style scoped>
.btn-black {
  background-color: #000 !important;
  color: #fff !important;
}
.btn-white {
  background-color: #fff !important;
  color: #000 !important;
}
</style>
