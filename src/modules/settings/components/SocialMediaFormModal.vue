<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/shared/components/BaseModal.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  modalMode: {
    type: String,
    default: 'create'
  },
  networkData: {
    type: Object,
    default: () => ({ id: null, type: '', url: '', phone: '', default_message: '', icon: '', active: true, sort_order: 1 })
  },
  availableNetworks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])
const toast = useToast()

const localForm = ref({
  id: null,
  type: '',
  url: '',
  phone: '',
  default_message: '',
  icon: '',
  active: true,
  sort_order: 1
})

watch(() => props.show, (newShow) => {
  if (newShow) {
    localForm.value = { ...props.networkData }
  }
})

const supportedNetworks = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' }
]

const handleTypeChange = () => {
  const network = supportedNetworks.find(n => n.value === localForm.value.type)
  if (network) {
    localForm.value.icon = network.icon
  }
}

const handleSubmit = () => {
  if (!localForm.value.type) {
    toast.warning('Debe seleccionar una red social.', 'Formulario incompleto')
    return
  }

  // If whatsapp, validate phone number format
  if (localForm.value.type === 'whatsapp') {
    if (!localForm.value.phone.trim()) {
      toast.warning('El número de teléfono es obligatorio para WhatsApp.', 'Formulario incompleto')
      return
    }
    const numberRegex = /^[0-9]+$/
    if (!numberRegex.test(localForm.value.phone.trim())) {
      toast.warning('El número de WhatsApp debe contener únicamente dígitos.', 'Número inválido')
      return
    }
  } else {
    // Other networks require URL
    if (!localForm.value.url.trim()) {
      toast.warning('La dirección URL es obligatoria.', 'Formulario incompleto')
      return
    }
  }

  emit('submit', { ...localForm.value })
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="modalMode === 'create' ? 'AGREGAR RED SOCIAL' : 'EDITAR RED SOCIAL'" 
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-3">
      <!-- Type Dropdown Select -->
      <div>
        <label class="form-label fw-black text-uppercase fs-6">Seleccionar Red Social</label>
        <select 
          v-model="localForm.type" 
          @change="handleTypeChange"
          class="form-select border-black border-2 fw-bold bg-white" 
          required
        >
          <option value="" disabled>Seleccione una red...</option>
          <option v-for="net in availableNetworks" :key="net.value" :value="net.value">
            {{ net.label }}
          </option>
        </select>
      </div>

      <!-- WhatsApp specific fields -->
      <template v-if="localForm.type === 'whatsapp'">
        <div>
          <label class="form-label fw-black text-uppercase fs-6">Número de Teléfono</label>
          <input 
            v-model="localForm.phone" 
            type="text" 
            class="form-control border-black border-2 fw-bold" 
            placeholder="Ejem: 51999999999" 
            required
          >
          <div class="form-text text-muted fw-bold mt-1">* Con código de país sin el símbolo + (Ej: 51 para Perú).</div>
        </div>
        <div>
          <label class="form-label fw-black text-uppercase fs-6">Mensaje Predeterminado (Template)</label>
          <textarea 
            v-model="localForm.default_message" 
            rows="4" 
            class="form-control border-black border-2 fw-bold font-monospace" 
            placeholder="Ejem: Hola, quiero comprar este producto..."
          ></textarea>
          <div class="form-text text-muted fw-bold mt-1">* Puedes usar los marcadores: {product_name}, {product_sku}, {product_price}.</div>
        </div>
      </template>

      <!-- General fields -->
      <template v-else-if="localForm.type">
        <div>
          <label class="form-label fw-black text-uppercase fs-6">Dirección URL</label>
          <input 
            v-model="localForm.url" 
            type="url" 
            class="form-control border-black border-2 fw-bold" 
            placeholder="Ejem: https://instagram.com/mi_marca" 
            required
          >
        </div>
      </template>

      <!-- Sort order input -->
      <div>
        <label class="form-label fw-black text-uppercase fs-6">Orden de Visualización</label>
        <input 
          v-model="localForm.sort_order" 
          type="number" 
          min="1"
          class="form-control border-black border-2 fw-bold" 
          placeholder="Ejem: 1, 2, 3" 
          required
        >
      </div>

      <!-- Active Checkbox -->
      <div class="form-check form-switch mt-2">
        <input 
          v-model="localForm.active" 
          class="form-check-input border-black border-2" 
          type="checkbox" 
          id="activeSwitch"
        >
        <label class="form-check-label fw-black text-uppercase fs-6 ms-2" for="activeSwitch">Activa</label>
      </div>

      <BaseButton type="submit" variant="primary" :disabled="loading" class="w-100 py-3 mt-3 fs-5 m-0">
        {{ loading ? 'GUARDANDO...' : 'GUARDAR RED SOCIAL' }}
      </BaseButton>
    </form>
  </BaseModal>
</template>
