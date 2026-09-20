<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-3 gap-3">
    <h2 class="fw-bold m-0 text-dark fs-3">{{ title }}</h2>
    <slot name="actions">
      <button v-if="buttonText" @click="$emit('action')" class="btn btn-amazon-primary py-2 px-4 fw-semibold d-flex align-items-center gap-2">
        <slot name="icon"></slot>
        {{ buttonText }}
      </button>
    </slot>
  </div>
</template>
