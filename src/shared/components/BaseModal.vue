<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '650px'
  }
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="amazon-modal-backdrop" @click.self="$emit('close')">
      <div class="amazon-modal-card card border-0 shadow-lg p-4 p-lg-5 bg-white position-relative rounded-3" :style="{ maxWidth }">
        <button @click="$emit('close')" class="btn-close position-absolute top-0 end-0 m-4" aria-label="Cerrar"></button>
        <h3 v-if="title" class="fw-bold text-dark mb-4 border-bottom pb-3">
          {{ title }}
        </h3>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.amazon-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 17, 17, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}
.amazon-modal-card {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 10px !important;
}
</style>
