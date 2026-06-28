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

const searchResults = ref([])
const productSearchQuery = ref('')
const searchingProducts = ref(false)

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
    productSearchQuery.value = ''
    searchResults.value = []
  }
})

const searchProducts = async () => {
  if (!productSearchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searchingProducts.value = true
  try {
    const res = await api.get('/products', {
      params: {
        search: productSearchQuery.value,
        store_id: props.sale?.store_id,
        per_page: 5
      }
    })
    
    const list = []
    if (res.data && res.data.data) {
      res.data.data.forEach(p => {
        p.variants.forEach(v => {
          list.push({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            product_name: p.name,
            price: Number(p.price)
          })
        })
      })
    }
    searchResults.value = list
  } catch (e) {
    console.error('Error al buscar productos:', e)
  } finally {
    searchingProducts.value = false
  }
}

const addVariantToEdit = (variant) => {
  if (variant.stock <= 0) {
    toast.error(`El producto ${variant.product_name} (${variant.sku}) no tiene stock en esta sucursal.`)
    return
  }
  
  const exists = editForm.value.items.find(i => i.sku === variant.sku)
  if (exists) {
    if (exists.quantity >= variant.stock) {
      toast.warning(`No puedes agregar más. Stock disponible: ${variant.stock}`)
      return
    }
    exists.quantity += 1
    toast.info(`Incrementada cantidad de ${variant.product_name} en la lista.`)
  } else {
    editForm.value.items.push({
      sku: variant.sku,
      quantity: 1,
      price: variant.price,
      product_name: `${variant.product_name} (Talla: ${variant.size}${variant.color ? ', ' + variant.color : ''})`
    })
    toast.success(`Producto agregado a la lista.`)
  }
  productSearchQuery.value = ''
  searchResults.value = []
}

const removeItemFromEdit = (index) => {
  if (editForm.value.items.length > 1) {
    editForm.value.items.splice(index, 1)
  }
}

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

    <!-- Buscar y Agregar Productos -->
    <div class="mb-4">
      <label class="form-label fw-bold text-uppercase fs-6">Buscar Producto para Agregar</label>
      <div class="position-relative">
        <input 
          v-model="productSearchQuery" 
          @input="searchProducts" 
          type="text" 
          class="form-control border-black border-2 rounded-0 shadow-sm px-3 py-2 fw-bold" 
          placeholder="Escribe el nombre o SKU para buscar..."
        >
        
        <!-- Resultados de Búsqueda Desplegables -->
        <div v-if="searchResults.length > 0" class="position-absolute w-100 bg-white border border-black border-2 shadow-lg mt-1" style="z-index: 1050; max-height: 200px; overflow-y: auto;">
          <div v-for="v in searchResults" :key="v.sku" @click="addVariantToEdit(v)" class="d-flex justify-content-between align-items-center p-3 border-bottom border-black cursor-pointer bg-white list-group-item-action" style="cursor: pointer;">
            <div class="text-start">
              <h6 class="fw-bold m-0 text-black">{{ v.product_name }} - Talla: {{ v.size }}</h6>
              <small class="text-muted font-monospace">{{ v.sku }}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-black text-white border border-black shadow-sm fs-7">Stock: {{ v.stock }}</span>
              <span class="d-block fw-bold text-success mt-1">$ {{ v.price.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="productSearchQuery.trim() && searchingProducts" class="position-absolute w-100 bg-white border border-black border-2 p-3 mt-1 text-center" style="z-index: 1050;">
          <span class="fw-bold text-muted">Buscando productos...</span>
        </div>
      </div>
    </div>

    <!-- Listado de Ítems / Productos -->
    <h4 class="fw-black text-uppercase border-bottom border-black border-2 pb-2 mb-3">Productos en esta Venta</h4>
    
    <div class="list-group list-group-flush border border-black border-2 mb-4" style="max-height: 250px; overflow-y: auto;">
      <div v-for="(item, index) in editForm.items" :key="item.sku" class="list-group-item p-3 border-bottom border-black d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <div>
            <h5 class="fw-black m-0 text-uppercase">{{ item.product_name || 'Producto' }}</h5>
            <span class="badge bg-secondary text-black border border-black font-monospace fs-7 mt-1">SKU: {{ item.sku }}</span>
          </div>
        </div>
        
        <div class="d-flex align-items-center gap-3 justify-content-end">
          <!-- Cantidad -->
          <div>
            <label class="fw-bold text-uppercase fs-8 text-muted d-block mb-1">Cantidad</label>
            <input v-model.number="item.quantity" type="number" min="1" class="form-control border-black border-2 rounded-0 text-center fw-bold shadow-none" style="width: 80px; height: 35px;">
          </div>
          <!-- Precio Unitario -->
          <div>
            <label class="fw-bold text-uppercase fs-8 text-muted d-block mb-1">Precio Unitario ($)</label>
            <input v-model.number="item.price" type="number" step="0.01" min="0" class="form-control border-black border-2 rounded-0 text-end fw-bold shadow-none" style="width: 110px; height: 35px;">
          </div>
          <!-- Subtotal -->
          <div class="text-end" style="min-width: 80px;">
            <label class="fw-bold text-uppercase fs-8 text-muted d-block mb-1">Subtotal</label>
            <span class="fw-black fs-6 text-success d-block">$ {{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <!-- Eliminar Ítem de la edición (opcional) -->
          <div>
            <label class="d-block mb-1" style="height: 18px;"></label>
            <button @click="removeItemFromEdit(index)" class="btn btn-danger btn-sm border border-black border-2 shadow-none py-1 px-2 fw-bold rounded-0" :disabled="editForm.items.length <= 1">X</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen Total Recalculado -->
    <div class="d-flex justify-content-between align-items-center bg-black text-white p-3 border border-black border-2 mb-4">
      <span class="fw-black text-uppercase fs-5 m-0">Nuevo Total</span>
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
