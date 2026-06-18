<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Buscar y seleccionar...'
  },
  required: {
    type: Boolean,
    default: false
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  valueKey: {
    type: String,
    default: 'id'
  }
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const isOpen = ref(false)
const inputRef = ref(null)

const selectedOption = computed(() => {
  return props.options.find(o => o[props.valueKey] === props.modelValue)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const opt = props.options.find(o => o[props.valueKey] === newVal)
    if (opt) searchQuery.value = opt[props.labelKey]
  } else {
    searchQuery.value = ''
  }
}, { immediate: true })

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => {
    const label = String(o[props.labelKey]).toLowerCase()
    const email = o.email ? String(o.email).toLowerCase() : ''
    return label.includes(q) || email.includes(q)
  })
})

const selectOption = (opt) => {
  searchQuery.value = opt[props.labelKey]
  emit('update:modelValue', opt[props.valueKey])
  isOpen.value = false
}

const onInput = () => {
  isOpen.value = true
  emit('update:modelValue', '') // Clear selection if typing
}

const handleBlur = () => {
  setTimeout(() => {
    if (!props.modelValue && props.required && searchQuery.value) {
      searchQuery.value = ''
    } else if (props.modelValue) {
      const opt = props.options.find(o => o[props.valueKey] === props.modelValue)
      if (opt) searchQuery.value = opt[props.labelKey]
    } else {
      searchQuery.value = ''
    }
    isOpen.value = false
  }, 200)
}

const clear = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  isOpen.value = true
  inputRef.value?.focus()
}
</script>

<template>
  <div class="position-relative w-100" style="z-index: 10;">
    <div class="position-relative">
      <input 
        ref="inputRef"
        v-model="searchQuery" 
        @input="onInput"
        @focus="isOpen = true"
        @blur="handleBlur"
        type="text" 
        class="form-control border-black border-2 fw-bold"
        :class="{ 'is-invalid': required && !modelValue && searchQuery }"
        :placeholder="placeholder"
        :required="required && !modelValue"
      />
      <button 
        v-if="modelValue" 
        type="button"
        @click.prevent="clear" 
        class="btn position-absolute top-50 end-0 translate-middle-y fw-black text-danger border-0 shadow-none px-2"
        style="background: transparent;"
      >
        X
      </button>
    </div>
    
    <div v-if="required && !modelValue && searchQuery" class="invalid-feedback d-block fw-bold">
      Debe seleccionar una opción de la lista.
    </div>

    <ul v-if="isOpen && filteredOptions.length > 0" class="list-group position-absolute w-100 mt-1 shadow-lg border border-black border-2" style="max-height: 250px; overflow-y: auto; z-index: 1050;">
      <li 
        v-for="opt in filteredOptions" 
        :key="opt[valueKey]" 
        @mousedown.prevent="selectOption(opt)"
        class="list-group-item list-group-item-action fw-bold"
        style="cursor: pointer;"
      >
        {{ opt[labelKey] }} <span v-if="opt.email" class="text-muted fw-normal">({{ opt.email }})</span>
      </li>
    </ul>
    <ul v-else-if="isOpen && searchQuery" class="list-group position-absolute w-100 mt-1 shadow-lg border border-black border-2" style="z-index: 1050;">
      <li class="list-group-item text-muted fw-bold">No se encontraron resultados</li>
    </ul>
  </div>
</template>
