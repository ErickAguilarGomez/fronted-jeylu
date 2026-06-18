<script setup>
const props = defineProps({
  page: {
    type: Number,
    required: true
  },
  lastPage: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mt-4 mb-5" v-if="lastPage > 1">
    <button @click="emit('change', page - 1)" :disabled="page <= 1 || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
      &laquo; Anterior
    </button>
    <span class="fw-black fs-4 text-uppercase">Página {{ page }} de {{ lastPage }}</span>
    <button @click="emit('change', page + 1)" :disabled="page >= lastPage || loading" class="btn btn-dark fw-black border-2 border-black shadow-sm px-4 py-2 text-uppercase fs-5">
      Siguiente &raquo;
    </button>
  </div>
</template>
