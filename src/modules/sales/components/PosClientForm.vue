<script setup>
import { posStore } from '../stores/posStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import SearchableSelect from '@/shared/components/SearchableSelect.vue'
</script>

<template>
  <div>
    <div class="bg-white border border-black border-2 p-3 mb-4 shadow-sm">
      <label class="fw-black text-uppercase mb-2 fs-5">Datos del Comprador</label>
      <div>
        <label class="fw-bold text-uppercase mb-1 fs-6 text-muted">Nombre / Razón Social / DNI (Opcional)</label>
        <input 
          v-model="posStore.customerName" 
          type="text" 
          class="form-control border-black border-2 fw-bold p-3 fs-5" 
          placeholder="Nombre completo o DNI / RUC"
        >
      </div>
    </div>

    <!-- Sucursal de Origen (Solo Administrador) -->
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
