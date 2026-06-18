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
    <div v-if="show" class="brutal-modal-backdrop" @click.self="$emit('close')">
      <div class="brutal-modal-card card border-black border-4 shadow-solid p-5 bg-white position-relative" :style="{ maxWidth }">
        <button @click="$emit('close')" class="btn-close position-absolute top-0 end-0 m-4 fs-4"></button>
        <h2 v-if="title" class="display-6 fw-black text-uppercase mb-4 border-bottom border-black pb-3">
          {{ title }}
        </h2>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.brutal-modal-backdrop {
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
.brutal-modal-card {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
