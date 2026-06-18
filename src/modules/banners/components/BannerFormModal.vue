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
  bannerData: {
    type: Object,
    default: () => ({ is_active: true, sort_order: 0 })
  },
  initialImagePreview: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])
const toast = useToast()

const localForm = ref({
  is_active: true,
  sort_order: 0
})

const selectedFile = ref(null)
const imagePreview = ref(null)

watch(() => props.show, (newShow) => {
  if (newShow) {
    localForm.value = { ...props.bannerData }
    selectedFile.value = null
    imagePreview.value = props.initialImagePreview
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Validate format
  if (!file.type.startsWith('image/')) {
    toast.warning('El archivo seleccionado debe ser una imagen.', 'Formato no soportado')
    return
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.warning('La imagen no debe pesar más de 5MB.', 'Archivo muy pesado')
    return
  }

  selectedFile.value = file
  
  // Preview
  const reader = new FileReader()
  reader.onload = (event) => {
    imagePreview.value = event.target.result
  }
  reader.readAsDataURL(file)
}

const handleSubmit = () => {
  emit('submit', {
    is_active: localForm.value.is_active,
    sort_order: localForm.value.sort_order,
    file: selectedFile.value
  })
}
</script>

<template>
  <BaseModal :show="show" :title="isEditing ? 'Editar Banner' : 'Nuevo Banner'" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
      
      <!-- Image File Picker -->
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Imagen del Banner</label>
        <div class="border border-black border-3 p-3 text-center bg-light position-relative">
          <input 
            type="file" 
            @change="handleFileChange" 
            class="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" 
            accept="image/*"
          />
          <div v-if="!imagePreview" class="py-4">
            <span class="fs-3">📁</span>
            <p class="m-0 mt-2 fw-bold text-uppercase">Hacer clic para buscar imagen</p>
            <span class="small text-muted">Formatos soportados: JPG, PNG, WEBP (Max 5MB)</span>
          </div>
          <div v-else class="py-2">
            <img :src="imagePreview" class="border border-black border-2 mw-100" style="max-height: 200px; object-fit: contain;" />
            <p class="m-0 mt-2 small text-muted text-uppercase fw-bold">Clic para reemplazar la imagen</p>
          </div>
        </div>
      </div>

      <!-- Order input -->
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Orden de Visualización</label>
        <input 
          v-model.number="localForm.sort_order" 
          type="number" 
          min="0" 
          class="form-control border-black border-3 p-3 fs-5 fw-bold" 
          required 
        />
      </div>

      <!-- Status switch -->
      <div class="d-flex align-items-center justify-content-between border border-black border-3 p-3">
        <label class="form-label fw-black text-uppercase m-0 fs-5">¿Banner Activo?</label>
        <div class="form-check form-switch m-0 fs-4">
          <input 
            v-model="localForm.is_active" 
            type="checkbox" 
            class="form-check-input cursor-pointer border-black" 
            role="switch" 
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex justify-content-end gap-3 mt-3">
        <BaseButton type="button" variant="secondary" @click="emit('close')" class="py-3 px-4 fs-5">CANCELAR</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="loading" class="py-3 px-5 fs-5">
          {{ loading ? 'GUARDANDO...' : 'GUARDAR BANNER' }}
        </BaseButton>
      </div>

    </form>
  </BaseModal>
</template>
