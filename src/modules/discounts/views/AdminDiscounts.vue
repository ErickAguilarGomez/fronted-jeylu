<script setup>
import { ref, onMounted } from 'vue'
import { discountStore } from '../stores/discountStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const percentageInput = ref(0)
const isActiveInput = ref(false)

const loadData = async () => {
  try {
    await discountStore.fetchGeneralDiscount()
    percentageInput.value = discountStore.generalDiscount.percentage || 0
    isActiveInput.value = Boolean(discountStore.generalDiscount.is_active)
  } catch (e) {
    toast.error(e, 'Error al cargar descuento general')
  }
}

onMounted(() => {
  loadData()
})

const handleSave = async () => {
  if (percentageInput.value < 1 || percentageInput.value > 100) {
    toast.warning('El porcentaje de descuento debe estar entre 1% y 100%.', 'Valor inválido')
    return
  }

  try {
    await discountStore.saveGeneralDiscount(percentageInput.value, isActiveInput.value)
    toast.success('El descuento general se ha guardado correctamente.', '¡Guardado!')
  } catch (e) {
    toast.error(e, 'Error al guardar descuento general')
  }
}

const handleToggleStatus = async () => {
  try {
    await discountStore.toggleGeneralDiscount()
    isActiveInput.value = Boolean(discountStore.generalDiscount.is_active)
    toast.success(
      discountStore.generalDiscount.is_active ? 'Descuento general activado.' : 'Descuento general desactivado.',
      'Estado actualizado'
    )
  } catch (e) {
    toast.error(e, 'Error al cambiar estado')
  }
}
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Gestión de Descuentos" />

    <div class="row g-4">
      <!-- General Discount Card -->
      <div class="col-lg-6">
        <div class="card border-3 border-black shadow-solid h-100 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-black border-2">
            <div>
              <h3 class="fw-black text-uppercase m-0 fs-4">DESCUENTO GENERAL</h3>
              <small class="text-muted fw-bold">Aplica a todos los productos sin descuento específico</small>
            </div>
            <span
              :class="['badge fs-6 border-2 border-black fw-black py-2 px-3', discountStore.generalDiscount.is_active ? 'bg-success text-black' : 'bg-secondary text-black']"
            >
              {{ discountStore.generalDiscount.is_active ? '🟢 ACTIVO' : '⚪ INACTIVO' }}
            </span>
          </div>

          <form @submit.prevent="handleSave" class="d-flex flex-column gap-4">
            <!-- Percentage input -->
            <div>
              <label class="form-label fw-black text-uppercase fs-5">Porcentaje de Descuento (%)</label>
              <div class="input-group border border-black border-3 shadow-solid-sm">
                <input
                  v-model.number="percentageInput"
                  type="number"
                  min="1"
                  max="100"
                  step="0.01"
                  class="form-control border-0 fw-black fs-3 p-3 text-center"
                  placeholder="20"
                  required
                />
                <span class="input-group-text bg-black text-white fw-black fs-3 border-0 px-4">%</span>
              </div>
              <small class="text-muted fw-bold mt-2 d-block">
                Solo puede existir un único descuento general para la tienda.
              </small>
            </div>

            <!-- Active / Inactive switch -->
            <div class="form-check form-switch d-flex align-items-center gap-3 p-3 border border-black border-2 bg-light rounded-0">
              <input
                class="form-check-input border-2 border-black m-0"
                type="checkbox"
                role="switch"
                id="generalActiveSwitch"
                v-model="isActiveInput"
                style="width: 50px; height: 26px; cursor: pointer;"
              />
              <label class="form-check-label fw-black text-uppercase fs-5 cursor-pointer m-0" for="generalActiveSwitch">
                {{ isActiveInput ? 'Descuento General Activo' : 'Descuento General Inactivo' }}
              </label>
            </div>

            <div class="d-flex justify-content-end gap-3 mt-2">
              <BaseButton
                type="button"
                variant="secondary"
                @click="handleToggleStatus"
                :disabled="discountStore.loading || !discountStore.generalDiscount.id"
                class="py-3 px-4 fs-6"
              >
                {{ isActiveInput ? 'DESACTIVAR' : 'ACTIVAR' }}
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                :disabled="discountStore.loading"
                class="py-3 px-5 fs-6"
              >
                {{ discountStore.loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Priority & Explanation Card -->
      <div class="col-lg-6">
        <div class="card border-3 border-black shadow-solid h-100 p-4 bg-light">
          <h3 class="fw-black text-uppercase mb-3 fs-4 d-flex align-items-center gap-2">
            <span>⚡</span> PRIORIDAD DE APLICACIÓN
          </h3>

          <p class="fw-bold fs-6 text-muted mb-4">
            Los descuentos **no son acumulativos**. El sistema aplica automáticamente un solo descuento según el siguiente orden:
          </p>

          <div class="d-flex flex-column gap-3 mb-4">
            <div class="p-3 border border-black border-2 bg-warning bg-opacity-25 d-flex align-items-center gap-3">
              <span class="fs-2">🥇</span>
              <div>
                <div class="fw-black text-uppercase fs-5">1. Descuento de Categoría</div>
                <small class="fw-bold text-muted">Mayor prioridad. Si la categoría del producto tiene descuento propio activado, se aplica este.</small>
              </div>
            </div>

            <div class="p-3 border border-black border-2 bg-info bg-opacity-25 d-flex align-items-center gap-3">
              <span class="fs-2">🥈</span>
              <div>
                <div class="fw-black text-uppercase fs-5">2. Descuento General</div>
                <small class="fw-bold text-muted">Se aplica únicamente si la categoría NO tiene descuento configurado y el descuento general está activo.</small>
              </div>
            </div>

            <div class="p-3 border border-black border-2 bg-white d-flex align-items-center gap-3">
              <span class="fs-2">🥉</span>
              <div>
                <div class="fw-black text-uppercase fs-5">3. Sin Descuento</div>
                <small class="fw-bold text-muted">El producto mantiene su precio normal si la categoría no tiene descuento y el general está inactivo.</small>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-3 border-top border-black border-2 d-flex justify-content-between align-items-center">
            <span class="fw-bold text-muted small">¿Deseas configurar un descuento por categoría?</span>
            <router-link to="/admin/categories" class="btn btn-dark fw-black border-2 border-black fs-6 py-2 px-3">
              IR A CATEGORÍAS
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-solid {
  box-shadow: 6px 6px 0px 0px #000000 !important;
}
.shadow-solid-sm {
  box-shadow: 4px 4px 0px 0px #000000 !important;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
