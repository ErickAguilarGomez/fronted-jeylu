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
      <div class="card border-black border-4 shadow-solid p-5 bg-white text-center" style="max-width: 500px; width: 100%;">
        <div class="text-danger mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
            <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
          </svg>
        </div>
        <h3 class="fw-black text-uppercase mb-3">¿CONFIRMAR ELIMINACIÓN?</h3>
        <p class="fs-5 fw-bold text-muted mb-4">{{ message }}</p>
        <div class="d-flex gap-3 justify-content-center">
          <button type="button" @click="$emit('cancel')" class="btn btn-secondary py-3 px-4 fw-black fs-5">CANCELAR</button>
          <button type="button" @click="$emit('confirm')" class="btn btn-danger py-3 px-4 fw-black fs-5">SÍ, ELIMINAR</button>
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
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 1rem;
}
</style>
