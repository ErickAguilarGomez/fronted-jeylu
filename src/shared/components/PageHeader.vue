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
  <div class="d-flex justify-content-between align-items-center mb-5 border-bottom border-black pb-4">
    <h1 class="display-5 m-0 fw-black text-uppercase">{{ title }}</h1>
    <slot name="actions">
      <button v-if="buttonText" @click="$emit('action')" class="btn btn-primary py-3 px-4 fs-5 fw-black d-flex align-items-center gap-2">
        <slot name="icon"></slot>
        {{ buttonText }}
      </button>
    </slot>
  </div>
</template>
