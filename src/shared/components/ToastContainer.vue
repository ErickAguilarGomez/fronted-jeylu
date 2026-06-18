<script setup>
import { useToast } from '@/composables/useToast.js'
import ToastItem from './ToastItem.vue'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-live="polite" aria-label="Notificaciones">
      <TransitionGroup name="toast-list" tag="div" class="toast-stack">
        <ToastItem
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  pointer-events: none;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

/* Allow clicks on individual toasts */
.toast-stack > * {
  pointer-events: all;
}

/* TransitionGroup animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(60px);
  max-height: 0;
}
.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
