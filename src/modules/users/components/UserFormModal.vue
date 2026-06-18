<script setup>
import { ref, watch } from 'vue'
import { userStore } from '../stores/userStore.js'
import BaseModal from '@/shared/components/BaseModal.vue'
import BaseButton from '@/shared/components/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: () => ({ name: '', email: '', password: '', role_id: 3, store_id: '' })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const localForm = ref({
  name: '',
  email: '',
  password: '',
  role_id: 3,
  store_id: ''
})

watch(() => props.show, (newShow) => {
  if (newShow) {
    localForm.value = { ...props.userData }
  }
})

const handleSubmit = () => {
  emit('submit', { ...localForm.value })
}
</script>

<template>
  <BaseModal :show="show" :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Nombre Completo</label>
        <input v-model="localForm.name" type="text" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="EJ. JUAN PÉREZ" required />
      </div>
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Correo Electrónico</label>
        <input v-model="localForm.email" type="email" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="juan@ejemplo.com" required />
      </div>
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Contraseña {{ isEditing ? '(Opcional: Dejar en blanco para mantener actual)' : '' }}</label>
        <input v-model="localForm.password" type="password" autocomplete="new-password" class="form-control border-black border-3 p-3 fs-5 fw-bold" placeholder="********" :required="!isEditing" />
      </div>
      <div>
        <label class="form-label fw-black text-uppercase fs-5">Rol de Sistema</label>
        <select v-model="localForm.role_id" class="form-select border-black border-3 p-3 fs-5 fw-bold" required>
          <option v-for="role in userStore.roles" :key="role.id" :value="role.id">{{ role.name.toUpperCase() }}</option>
        </select>
      </div>
      <div v-if="Number(localForm.role_id) === 2">
        <label class="form-label fw-black text-uppercase fs-5">Sucursal Asignada</label>
        <select v-model="localForm.store_id" class="form-select border-black border-3 p-3 fs-5 fw-bold" required>
          <option value="" disabled>SELECCIONE SUCURSAL...</option>
          <option v-for="store in userStore.stores" :key="store.id" :value="store.id">{{ store.name.toUpperCase() }}</option>
        </select>
      </div>
      <div class="d-flex justify-content-end gap-3 mt-3">
        <BaseButton type="button" variant="secondary" @click="emit('close')" class="py-3 px-4 fs-5">CANCELAR</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="loading" class="py-3 px-5 fs-5">
          {{ loading ? 'GUARDANDO...' : 'GUARDAR USUARIO' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
