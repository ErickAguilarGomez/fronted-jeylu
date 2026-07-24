<script setup>
import { ref, onMounted } from 'vue'
import { priceIncreaseStore } from '../stores/priceIncreaseStore.js'
import PageHeader from '@/shared/components/PageHeader.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const percentageInput = ref(0)
const isActiveInput = ref(false)

const loadData = async () => {
  try {
    await priceIncreaseStore.fetchGeneralIncrease()
    percentageInput.value = priceIncreaseStore.generalIncrease.percentage || 0
    isActiveInput.value = Boolean(priceIncreaseStore.generalIncrease.is_active)
  } catch (e) {
    toast.error(e, 'Error al cargar aumento general')
  }
}

onMounted(() => {
  loadData()
})

const handleSave = async () => {
  if (isActiveInput.value && (percentageInput.value < 1 || percentageInput.value > 100)) {
    toast.warning('El porcentaje de aumento debe estar entre 1% y 100%.', 'Valor inválido')
    return
  }

  try {
    await priceIncreaseStore.saveGeneralIncrease(percentageInput.value, isActiveInput.value)
    toast.success('Configuración guardada exitosamente.', '¡Guardado!')
  } catch (e) {
    toast.error(e, 'Error al guardar configuración')
  }
}
</script>

<template>
  <div class="container py-5">
    <PageHeader title="Gestión de Aumentos de Precios" />

    <div class="row g-4">
      <!-- General Markup Card -->
      <div class="col-lg-6">
        <div class="card border-3 border-black shadow-solid h-100 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-black border-2">
            <div>
              <h3 class="fw-black text-uppercase m-0 fs-4">AUMENTO GENERAL</h3>
              <small class="text-muted fw-bold">Aplica a todos los productos cuyas categorías no tengan aumento propio</small>
            </div>
          </div>

          <form @submit.prevent="handleSave" class="d-flex flex-column gap-4">
            <!-- Percentage input -->
            <div>
              <label class="form-label fw-black text-uppercase fs-5">Porcentaje de Aumento (%)</label>
              <div class="input-group border border-black border-3 shadow-solid-sm">
                <input
                  v-model.number="percentageInput"
                  type="number"
                  min="1"
                  max="100"
                  step="0.01"
                  class="form-control border-0 fw-black fs-3 p-3 text-center"
                  placeholder="10.00"
                  required
                />
                <span class="input-group-text bg-black text-white fw-black fs-3 border-0 px-4">%</span>
              </div>
              <small class="text-muted fw-bold mt-2 d-block">
                Solo puede existir un único aumento general para la tienda.
              </small>
            </div>

            <!-- Active / Inactive Switch Box -->
            <div 
              class="d-flex align-items-center justify-content-between p-3 border border-black border-3"
              :class="isActiveInput ? 'bg-success bg-opacity-25' : 'bg-light'"
            >
              <div>
                <label class="fw-black text-uppercase fs-5 m-0 cursor-pointer" for="generalActiveSwitch">
                  Estado: {{ isActiveInput ? '🟢 ACTIVADO' : '⚪ DESACTIVADO' }}
                </label>
                <small class="text-muted fw-bold d-block">
                  {{ isActiveInput ? 'El aumento se aplicará a los productos.' : 'El aumento está inactivo.' }}
                </small>
              </div>
              <div class="form-check form-switch m-0 fs-3">
                <input
                  class="form-check-input border-2 border-black cursor-pointer m-0"
                  type="checkbox"
                  role="switch"
                  id="generalActiveSwitch"
                  v-model="isActiveInput"
                  style="width: 54px; height: 28px;"
                />
              </div>
            </div>

            <!-- Single Action Button -->
            <div class="mt-2">
              <BaseButton
                type="submit"
                variant="primary"
                :disabled="priceIncreaseStore.loading"
                class="w-100 py-3 fs-5 fw-black"
              >
                {{ priceIncreaseStore.loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
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
            Los aumentos **no son acumulativos** y alteran directamente el precio del producto sin etiquetas visuales en el catálogo. Se aplica un solo aumento según el siguiente orden:
          </p>

          <div class="d-flex flex-column gap-3 mb-4">
            <div class="p-3 border border-black border-2 bg-warning bg-opacity-25 d-flex align-items-center gap-3">
              <span class="fs-2">🥇</span>
              <div>
                <div class="fw-black text-uppercase fs-5">1. Aumento de Categoría</div>
                <small class="fw-bold text-muted">Mayor prioridad. Si la categoría del producto tiene aumento propio activado, se aplica este.</small>
              </div>
            </div>

            <div class="p-3 border border-black border-2 bg-info bg-opacity-25 d-flex align-items-center gap-3">
              <span class="fs-2">🥈</span>
              <div>
                <div class="fw-black text-uppercase fs-5">2. Aumento General</div>
                <small class="fw-bold text-muted">Se aplica únicamente si la categoría NO tiene aumento configurado y el aumento general está activo.</small>
              </div>
            </div>

            <div class="p-3 border border-black border-2 bg-white d-flex align-items-center gap-3">
              <span class="fs-2">🥉</span>
              <div>
                <div class="fw-black text-uppercase fs-5">3. Sin Aumento</div>
                <small class="fw-bold text-muted">El producto mantiene su precio normal si la categoría no tiene aumento y el general está inactivo.</small>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-3 border-top border-black border-2 d-flex justify-content-between align-items-center">
            <span class="fw-bold text-muted small">¿Deseas configurar un aumento por categoría?</span>
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
