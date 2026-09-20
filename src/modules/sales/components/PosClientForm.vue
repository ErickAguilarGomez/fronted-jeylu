<script setup>
import { posStore } from '../stores/posStore.js'
import { authStore } from '@/modules/auth/stores/authStore.js'
import SearchableSelect from '@/shared/components/SearchableSelect.vue'
</script>

<template>
  <div class="pos-client-form mb-2">
    <!-- Administrador: 2 columnas compactas (Cliente y Sucursal) -->
    <div v-if="authStore.user?.role_id === 1" class="row g-2">
      <div class="col-sm-6">
        <label class="form-label text-dark fw-semibold small mb-1 d-flex align-items-center gap-1">
          <i class="bi bi-person text-secondary"></i>
          <span>Cliente (DNI / Nombre opcional)</span>
        </label>
        <input 
          v-model="posStore.customerName" 
          type="text" 
          class="form-control form-control-sm border shadow-none" 
          placeholder="DNI, CUIT o Nombre..."
        />
      </div>
      <div class="col-sm-6">
        <label class="form-label text-dark fw-semibold small mb-1 d-flex align-items-center gap-1">
          <i class="bi bi-shop text-secondary"></i>
          <span>Sucursal de Origen</span>
        </label>
        <SearchableSelect
          v-model="posStore.selectedStoreId"
          :options="posStore.stores"
          placeholder="Seleccionar sucursal..."
          :required="false"
        />
      </div>
    </div>

    <!-- Vendedor: solo campo Cliente compacto -->
    <div v-else>
      <label class="form-label text-dark fw-semibold small mb-1 d-flex align-items-center gap-1">
        <i class="bi bi-person text-secondary"></i>
        <span>Cliente (DNI / Nombre opcional)</span>
      </label>
      <input 
        v-model="posStore.customerName" 
        type="text" 
        class="form-control form-control-sm border shadow-none" 
        placeholder="DNI, CUIT o Nombre del cliente..."
      />
    </div>
  </div>
</template>

<style scoped>
.pos-client-form :deep(.form-control),
.pos-client-form :deep(.form-select) {
  font-size: 0.85rem;
}
</style>

