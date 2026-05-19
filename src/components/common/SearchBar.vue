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
    <input 
      v-model="query" 
      @input="onInput"
      type="text" 
      class="form-control form-control-lg border-black border-2 shadow-none fw-bold pe-5" 
      :placeholder="placeholder"
    />
    <button 
      v-if="query" 
      @click="clear" 
      class="btn position-absolute top-50 end-0 translate-middle-y me-2 fw-black text-danger border-0 shadow-none p-1"
      title="Limpiar"
    >
      X
    </button>
  </div>
</template>

<style scoped>
.search-bar-container {
  max-width: 500px;
}
</style>
