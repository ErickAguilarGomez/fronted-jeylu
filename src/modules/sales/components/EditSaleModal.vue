<script setup>
import { ref, watch, computed } from 'vue'
import saleService from '../services/saleService.js'
import api from '@/plugins/axios'
import BaseModal from '@/shared/components/BaseModal.vue'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  sale: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const toast = useToast()
const saving = ref(false)
const editForm = ref({ customer_name: '', status: 'COMPLETED', items: [] })

watch(() => props.show, (newVal) => {
  if (newVal && props.sale) {
    editForm.value = {
      customer_name: props.sale.customer_name || '',
      status: props.sale.status || 'COMPLETED',
      items: props.sale.items.map(i => ({
        sku: i.variant_sku,
        quantity: i.quantity,
        price: Number(i.price),
        product_name: i.product_name
      }))
    }
  }
})

const recalculatedTotal = computed(() => {
  return editForm.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const saveSaleEdit = async () => {
  saving.value = true
  try {
    const payload = {
      customer_name: editForm.value.customer_name,
      status: editForm.value.status,
      items: editForm.value.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.price
      }))
    }
    const response = await saleService.updateSale(props.sale.id, payload)
    if (response && response.success) {
      toast.success('Venta modificada con éxito.')
      emit('saved')
      emit('close')
    } else {
      toast.error(response?.message || 'Error al guardar cambios.')
    }
  } catch (e) {
    toast.error(e.message || e, 'Error al guardar cambios')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :show="show" :title="`Editar Venta #${sale?.id}`" maxWidth="850px" @close="emit('close')">
    <div class="row g-4 mb-4">
      <!-- Nombre del Cliente -->
      <div class="col-md-6">
        <label class="form-label fw-bold text-uppercase fs-6">Nombre del Cliente</label>
        <input v-model="editForm.customer_name" type="text" class="form-control border-black border-2 rounded-0 shadow-sm px-3 py-2 fw-bold" placeholder="Anónimo">
      </div>
      
      <!-- Estado de la Venta -->
      <div class="col-md-6">
        <label class="form-label fw-bold text-uppercase fs-6">Estado de la Venta</label>
        <select v-model="editForm.status" class="form-select border-black border-2 rounded-0 shadow-sm px-3 py-2 fw-bold">
          <option value="COMPLETED">Completada</option>
          <option value="REFUNDED">Reembolsada</option>
        </select>
      </div>
    </div>

    <!-- Datos de Auditoría -->
    <div class="bg-light p-3 border border-black border-2 mb-4">
      <div class="row">
        <div class="col-sm-6 mb-2 mb-sm-0">
          <span class="fw-bold text-uppercase fs-7 text-muted d-block">Vendido por</span>
          <span class="fw-black fs-6 text-black">{{ sale?.seller_name }}</span>
        </div>
        <div class="col-sm-6" v-if="sale?.modifier_name">
          <span class="fw-bold text-uppercase fs-7 text-muted d-block">Última Modificación por</span>
          <span class="fw-black fs-6 text-black">{{ sale?.modifier_name }}</span>
        </div>
      </div>
    </div>

    <!-- Listado de Ítems / Productos -->
    <h4 class="fw-black text-uppercase border-bottom border-black border-2 pb-2 mb-3">Productos en esta Venta</h4>
    
    <div class="list-group list-group-flush border border-black border-2 mb-4" style="max-height: 250px; overflow-y: auto;">
      <div v-for="item in editForm.items" :key="item.sku" class="list-group-item p-3 border-bottom border-black d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <div>
            <h5 class="fw-black m-0 text-uppercase">{{ item.product_name || 'Producto' }}</h5>
            <span class="badge bg-secondary text-black border border-black font-monospace fs-7 mt-1">SKU: {{ item.sku }}</span>
          </div>
        </div>
        
        <div class="d-flex align-items-center gap-4 justify-content-end text-end">
          <!-- Cantidad -->
          <div>
            <span class="fw-bold text-uppercase fs-8 text-muted d-block mb-1">Cantidad</span>
            <span class="fw-bold fs-5 text-black">{{ item.quantity }}</span>
          </div>
          <!-- Precio Unitario -->
          <div>
            <span class="fw-bold text-uppercase fs-8 text-muted d-block mb-1">Precio Unitario</span>
            <span class="fw-bold fs-5 text-black">$ {{ Number(item.price).toFixed(2) }}</span>
          </div>
          <!-- Subtotal -->
          <div style="min-width: 100px;">
            <span class="fw-bold text-uppercase fs-8 text-muted d-block mb-1">Subtotal</span>
            <span class="fw-black fs-5 text-success">$ {{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen Total Recalculado -->
    <div class="d-flex justify-content-between align-items-center bg-black text-white p-3 border border-black border-2 mb-4">
      <span class="fw-black text-uppercase fs-5 m-0">Total</span>
      <span class="fw-black fs-4 text-success">$ {{ recalculatedTotal.toFixed(2) }}</span>
    </div>

    <!-- Footer de acciones -->
    <div class="d-flex gap-3 justify-content-end mt-4 pt-3 border-top border-black border-2">
      <button @click="emit('close')" class="btn btn-outline-dark fw-black border border-black border-2 py-2 px-4 shadow-sm text-uppercase" :disabled="saving">Cancelar</button>
      <button @click="saveSaleEdit" class="btn btn-success fw-black border border-black border-2 py-2 px-4 shadow-sm text-uppercase text-white" :disabled="saving">
        {{ saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
      </button>
    </div>
  </BaseModal>
</template>
