<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const query = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  query.value = newVal
})

let timeout = null
const onInput = () => {
  emit('update:modelValue', query.value)
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('search', query.value)
  }, 400)
}

const clear = () => {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<template>
  <div class="search-bar-container position-relative w-100">
    <div class="position-relative">
      <span class="position-absolute top-50 start-0 translate-middle-y ms-3 z-3 text-muted">
        <span v-if="loading" class="spinner-border spinner-border-sm text-black" role="status"></span>
        <i v-else class="bi bi-search fs-5 text-black"></i>
      </span>
      <input 
        v-model="query" 
        @input="onInput"
        type="text" 
        class="form-control form-control-lg border-black border-2 shadow-none fw-bold ps-5 pe-5" 
        :placeholder="placeholder"
      />
      <button 
        v-if="query" 
        @click="clear" 
        class="btn position-absolute top-50 end-0 translate-middle-y me-3 fw-black text-danger border-0 shadow-none p-0 z-3 m-0"
        type="button"
        title="Limpiar"
        style="box-shadow: none !important; transform: translateY(-50%) !important;"
      >
        X
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar-container {
  max-width: 500px;
}
.search-bar-container button {
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}
</style>
