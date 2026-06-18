<script setup>
defineProps({
  to: {
    type: [String, Object],
    default: null
  },
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary' // 'primary', 'secondary', 'danger', 'outline-dark', 'icon'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <router-link
    v-if="to"
    :to="to"
    :class="[
      'btn fw-black text-uppercase text-decoration-none text-center',
      variant === 'primary' ? 'btn-primary' : '',
      variant === 'secondary' ? 'btn-secondary' : '',
      variant === 'danger' ? 'btn-danger' : '',
      variant === 'outline-dark' ? 'btn-outline-dark bg-white' : '',
      variant === 'icon' ? 'btn-icon' : ''
    ]"
  >
    <slot></slot>
  </router-link>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="[
      'btn fw-black text-uppercase',
      variant === 'primary' ? 'btn-primary' : '',
      variant === 'secondary' ? 'btn-secondary' : '',
      variant === 'danger' ? 'btn-danger' : '',
      variant === 'outline-dark' ? 'btn-outline-dark bg-white' : '',
      variant === 'icon' ? 'btn-icon' : ''
    ]"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.btn-icon {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  color: #000;
}
.btn-icon:hover {
  transform: scale(1.1) !important;
  box-shadow: none !important;
  background: transparent !important;
}
</style>
