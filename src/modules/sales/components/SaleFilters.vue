<script setup>
import { authStore } from '@/modules/auth/stores/authStore.js'

defineProps({
  sellerId: String,
  startDate: String,
  endDate: String,
  sellers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:sellerId', 'update:startDate', 'update:endDate', 'change', 'clear'])
</script>

<template>
  <div class="card border-2 border-black p-4 mb-4 bg-light" style="box-shadow: 4px 4px 0px #000; border-radius: 0px;">
    <div class="row g-3 align-items-end">
      <div class="col-md-3" v-if="authStore.isAdmin()">
        <label class="form-label fw-black text-uppercase fs-7 m-0 mb-1">Cajero / Vendedor</label>
        <select 
          :value="sellerId" 
          @change="emit('update:sellerId', $event.target.value); emit('change')"
          class="form-select border-2 border-black rounded-0 fw-bold shadow-none"
        >
          <option value="">Todos los Cajeros</option>
          <option v-for="user in sellers" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label fw-black text-uppercase fs-7 m-0 mb-1">Desde</label>
        <input 
          type="date" 
          :value="startDate" 
          @change="emit('update:startDate', $event.target.value); emit('change')"
          class="form-control border-2 border-black rounded-0 fw-bold shadow-none" 
        />
      </div>
      <div class="col-md-3">
        <label class="form-label fw-black text-uppercase fs-7 m-0 mb-1">Hasta</label>
        <input 
          type="date" 
          :value="endDate" 
          @change="emit('update:endDate', $event.target.value); emit('change')"
          class="form-control border-2 border-black rounded-0 fw-bold shadow-none" 
        />
      </div>
      <div class="col-md-3 d-flex gap-2">
        <button @click="emit('clear')" class="btn btn-outline-dark border-2 border-black rounded-0 fw-black w-100 py-2 shadow-none" style="border-radius: 0px;">
          LIMPIAR FILTROS
        </button>
      </div>
    </div>
  </div>
</template>
