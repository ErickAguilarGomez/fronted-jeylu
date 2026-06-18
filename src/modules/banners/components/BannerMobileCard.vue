<script setup>
import BaseButton from '@/shared/components/BaseButton.vue'

defineProps({
  item: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="card border-black border-3 shadow-solid bg-white overflow-hidden animate-fade-in">
    <!-- Banner Image -->
    <div class="border-bottom border-black border-3" style="height: 180px; background-color: #f0f0f0;">
      <img :src="item.image_url" class="w-100 h-100" style="object-fit: cover;" alt="Banner Preview" />
    </div>

    <!-- Card Body -->
    <div class="p-3">
      <div class="row g-2 mb-3">
        <div class="col-6">
          <span class="small text-muted text-uppercase fw-bold d-block">Orden</span>
          <span class="fs-4 fw-black font-monospace">{{ item.sort_order }}</span>
        </div>
        <div class="col-6">
          <span class="small text-muted text-uppercase fw-bold d-block mb-1">Estado</span>
          <span 
            class="badge fw-bold p-1 px-3 border border-black border-2" 
            :class="item.is_active ? 'bg-success text-black' : 'bg-danger text-white'"
            style="font-size: 0.75rem !important; box-shadow: 2px 2px 0px #000 !important; display: inline-block;"
          >
            {{ item.is_active ? 'ACTIVO' : 'INACTIVO' }}
          </span>
        </div>
      </div>
      
      <div class="mb-4">
        <span class="small text-muted text-uppercase fw-bold d-block">Creado el</span>
        <span class="fw-bold">{{ formatDate(item.created_at) }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2">
        <button 
          @click="emit('edit')" 
          class="btn btn-warning fw-black w-100 border border-black shadow-solid-sm fs-6"
          style="padding: 10px !important; box-shadow: 3px 3px 0px #000 !important;"
        >
          EDITAR
        </button>
        <BaseButton 
          variant="danger"
          @click="emit('delete')" 
          class="w-100 border border-black shadow-solid-sm fs-6"
          style="padding: 10px !important; box-shadow: 3px 3px 0px #000 !important;"
          :disabled="loading"
        >
          ELIMINAR
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 8px 8px 0px #000 !important;
}
</style>
