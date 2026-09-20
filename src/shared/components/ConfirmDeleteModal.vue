<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '¿Estás seguro de que deseas eliminar este elemento?'
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="confirm-delete-backdrop">
      <div class="card border-0 shadow-lg p-4 p-lg-5 bg-white text-center rounded-3" style="max-width: 480px; width: 100%;">
        <div class="text-danger mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
            <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
          </svg>
        </div>
        <h4 class="fw-bold text-dark mb-2">¿Confirmar eliminación?</h4>
        <p class="small text-muted mb-4">{{ message }}</p>
        <div class="d-flex gap-3 justify-content-center">
          <button type="button" @click="$emit('cancel')" class="btn btn-outline-secondary py-2 px-4 fw-semibold">Cancelar</button>
          <button type="button" @click="$emit('confirm')" class="btn btn-danger py-2 px-4 fw-semibold">Sí, eliminar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-delete-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 17, 17, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 1rem;
}
</style>
