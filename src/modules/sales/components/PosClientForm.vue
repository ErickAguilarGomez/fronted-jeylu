<script setup>
import { ref, watch } from 'vue'
import { posStore } from '../stores/posStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import SearchableSelect from '@/shared/components/SearchableSelect.vue'

const customerMode = ref('casual') // 'casual' or 'registered'

watch(customerMode, (newMode) => {
  if (newMode === 'casual') {
    posStore.customerId = ''
  } else {
    posStore.customerName = ''
  }
})
</script>

<template>
  <div>
    <div class="bg-white border border-black border-2 p-3 mb-4 shadow-sm">
      <label class="fw-black text-uppercase mb-3 fs-5">Datos del Cliente</label>
      
      <!-- Selection Mode Buttons -->
      <div class="d-flex gap-2 mb-3">
        <button 
          type="button" 
          @click="customerMode = 'casual'" 
          :class="['btn btn-sm w-50 py-2 fs-6 fw-black border-2 border-black m-0 shadow-none', customerMode === 'casual' ? 'bg-black text-white' : 'bg-light text-black']"
        >
          CLIENTE CASUAL
        </button>
        <button 
          type="button" 
          @click="customerMode = 'registered'" 
          :class="['btn btn-sm w-50 py-2 fs-6 fw-black border-2 border-black m-0 shadow-none', customerMode === 'registered' ? 'bg-black text-white' : 'bg-light text-black']"
        >
          REGISTRADO
        </button>
      </div>

      <!-- Casual Customer Mode -->
      <div v-if="customerMode === 'casual'">
        <label class="fw-bold text-uppercase mb-1 fs-6 text-muted">Identificación (Opcional)</label>
        <input 
          v-model="posStore.customerName" 
          type="text" 
          class="form-control border-black border-2 fw-bold p-3 fs-5" 
          placeholder="Nombre completo o DNI / RUC"
        >
      </div>

      <!-- Registered Customer Mode -->
      <div v-else>
        <label class="fw-bold text-uppercase mb-1 fs-6 text-muted">Buscar Usuario Registrado</label>
        <SearchableSelect
          v-model="posStore.customerId"
          :options="posStore.users"
          placeholder="Escriba nombre o email para buscar..."
          :required="false"
        />
      </div>
    </div>

    <div v-if="authStore.user?.role_id === 1" class="bg-white border border-black border-2 p-3 mb-4 shadow-sm">
      <label class="fw-black text-uppercase mb-2 fs-5">Sucursal de Origen (Solo Administrador)</label>
      <SearchableSelect
        v-model="posStore.selectedStoreId"
        :options="posStore.stores"
        placeholder="Buscar y seleccionar sucursal..."
        :required="false"
      />
    </div>
  </div>
</template>
