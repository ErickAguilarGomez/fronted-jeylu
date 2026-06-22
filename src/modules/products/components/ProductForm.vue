<script setup>
import { ref, defineExpose, defineEmits } from 'vue'
import { productStore } from '../stores/productStore.js'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()
const emit = defineEmits(['closed'])

const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const saving = ref(false)

// Form data
const form = ref({
  base_sku: '',
  category_id: '',
  store_id: '',
  name: '',
  description: '',
  price: 0,
  existing_images: [],
  new_image_boxes: [{ file: null, preview: null }],
  variants: []
})

// Dynamic image boxes
const addImageBox = () => {
  form.value.new_image_boxes.push({ file: null, preview: null })
}

const removeImageBox = (index) => {
  form.value.new_image_boxes.splice(index, 1)
}

const handleImageFileChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    form.value.new_image_boxes[index].file = file
    form.value.new_image_boxes[index].preview = URL.createObjectURL(file)
  }
}

const deleteExistingImage = async (imgUrl, index) => {
  if (confirm('¿ESTÁS SEGURO DE ELIMINAR ESTA IMAGEN? ESTO LA BORRARÁ DEFINITIVAMENTE DEL ALMACENAMIENTO CLOUDINARY Y BASE DE DATOS.')) {
    try {
      await productStore.deleteImage(imgUrl)
      form.value.existing_images.splice(index, 1)
    } catch (err) {
      toast.error(err, 'Error al eliminar la imagen')
    }
  }
}

// Add new variant row
const addVariant = () => {
  form.value.variants.push({ id: null, sku: '', size: '', stock: 0 })
}

// Remove variant row
const removeVariant = (index) => {
  form.value.variants.splice(index, 1)
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = { 
    base_sku: '', 
    category_id: productStore.categories[0]?.id || '',
    store_id: productStore.selectedFilterStore || productStore.stores[0]?.id || 1,
    name: '', 
    description: '',
    price: 0, 
    existing_images: [],
    new_image_boxes: [{ file: null, preview: null }],
    variants: [{ id: null, sku: '', size: '', stock: 0 }] 
  }
  showModal.value = true
}

const openEditModal = async (productSku) => {
  try {
    const product = await productStore.getProductBySku(productSku)

    modalMode.value = 'edit'
    form.value = { 
      base_sku: product.sku, 
      category_id: product.category_id || productStore.categories[0]?.id || '',
      store_id: productStore.selectedFilterStore || productStore.stores[0]?.id || 1,
      name: product.name, 
      description: product.description || '',
      price: product.price, 
      existing_images: product.images || [],
      new_image_boxes: [{ file: null, preview: null }],
      variants: product.variants.map(v => ({
        id: v.id,
        sku: v.sku || '',
        size: v.size || '',
        stock: v.stock
      }))
    }
    
    if (form.value.variants.length === 0) {
      addVariant()
    }

    showModal.value = true
  } catch(err) {
    toast.error(err, 'Error al cargar datos del producto para editar')
  }
}

const close = () => {
  showModal.value = false
  emit('closed')
}

const submitForm = async () => {
  // Front-end validations
  if (!form.value.name || !form.value.name.trim()) {
    toast.warning('El nombre del producto es obligatorio.', 'Formulario incompleto')
    return
  }

  if (form.value.price === null || form.value.price === undefined || form.value.price === '') {
    toast.warning('El precio unitario es obligatorio.', 'Formulario incompleto')
    return
  }

  if (Number(form.value.price) <= 0) {
    toast.warning('El precio unitario debe ser mayor a 0.', 'Precio inválido')
    return
  }

  if (!form.value.category_id) {
    toast.warning('La categoría es obligatoria.', 'Formulario incompleto')
    return
  }

  if (!form.value.store_id) {
    toast.warning('La sucursal de registro es obligatoria.', 'Formulario incompleto')
    return
  }

  if (form.value.variants.length === 0) {
    toast.warning('Debe registrar al menos una variante.', 'Variantes requeridas')
    return
  }

  // Validate variant stocks
  for (let i = 0; i < form.value.variants.length; i++) {
    const v = form.value.variants[i]
    if (v.stock === null || v.stock === undefined || v.stock === '') {
      toast.warning(`El stock para la variante #${i + 1} es obligatorio.`, 'Formulario incompleto')
      return
    }
    if (Number(v.stock) < 0) {
      toast.warning(`El stock para la variante #${i + 1} no puede ser negativo.`, 'Stock inválido')
      return
    }
  }

  saving.value = true
  
  const formData = new FormData()
  
  if (modalMode.value === 'create') {
    if (!form.value.base_sku) {
      const cleanName = form.value.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      form.value.base_sku = `${cleanName || 'PRD'}-${randomNum}`
    }
    formData.append('base_sku', form.value.base_sku)
  }
  
  formData.append('category_id', form.value.category_id)
  formData.append('store_id', form.value.store_id)
  formData.append('name', form.value.name)
  formData.append('description', form.value.description)
  formData.append('price', form.value.price)

  form.value.variants.forEach((v, index) => {
    if (v.id) formData.append(`variants[${index}][id]`, v.id)
    if (v.sku) formData.append(`variants[${index}][sku]`, v.sku)
    if (v.size) formData.append(`variants[${index}][size]`, v.size)
    formData.append(`variants[${index}][stock]`, v.stock)
  })

  let imgCount = 0
  form.value.new_image_boxes.forEach(box => {
    if (box.file) {
      formData.append(`images[${imgCount}]`, box.file)
      imgCount++
    }
  })

  try {
    if (modalMode.value === 'create') {
      await productStore.createProduct(formData)
      toast.success('El producto ha sido registrado exitosamente.', '¡Producto registrado!')
    } else {
      await productStore.updateProduct(form.value.base_sku, formData)
      toast.success('El producto ha sido actualizado exitosamente.', '¡Producto actualizado!')
    }
    close()
  } catch (err) {
    toast.error(err, 'Error al guardar el producto')
  } finally {
    saving.value = false
  }
}

// Expose methods to parent
defineExpose({
  openCreateModal,
  openEditModal
})
</script>

<template>
  <!-- Modal Form -->
  <div v-if="showModal" class="modal-backdrop" style="background: rgba(0,0,0,0.85); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div class="card border-2 shadow w-100" style="max-width: 900px; max-height: 92vh; overflow-y: auto;">
      <div class="card-header bg-black text-white p-4 border-bottom border-black border-2 d-flex justify-content-between align-items-center position-sticky top-0" style="z-index: 100;">
        <h2 class="m-0 fw-black text-uppercase fs-3">{{ modalMode === 'create' ? 'NUEVO PRODUCTO EN INVENTARIO' : 'EDITAR PRODUCTO Y VARIANTES' }}</h2>
        <button type="button" @click="close" class="btn btn-danger py-2 px-3 fw-black border border-white text-white m-0 fs-5">X</button>
      </div>
      
      <div class="card-body p-4 p-md-5 bg-white">
        <form @submit.prevent="submitForm">
          <!-- DATOS BASE -->
          <h4 class="fw-black mb-3 border-bottom border-black pb-2 text-uppercase text-primary">1. Datos Principales y Clasificación</h4>
          
          <div class="row g-3 mb-4 align-items-end">
            <div class="col-md-5">
              <label class="form-label fw-black text-uppercase fs-6">NOMBRE DEL PRODUCTO (Obligatorio)</label>
              <input v-model="form.name" type="text" class="form-control form-control-lg border-black border-2 shadow-none fw-bold" placeholder="Ejem: Adidas Samba Clásico" required>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-black text-uppercase fs-6">SKU BASE (Opcional)</label>
              <input v-model="form.base_sku" type="text" class="form-control form-control-lg border-black border-2 shadow-none fw-bold" placeholder="Autogenerado si está vacío" :disabled="modalMode === 'edit'">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-black text-uppercase fs-6">PRECIO UNITARIO ($)</label>
              <div class="input-group border border-black border-2">
                <span class="input-group-text bg-secondary border-0 fw-black px-3">$</span>
                <input v-model="form.price" type="number" step="0.01" min="0" class="form-control border-0 shadow-none fw-bold fs-5 py-2" placeholder="0.00" required>
              </div>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-black text-uppercase fs-6">CATEGORÍA (Obligatorio)</label>
              <select v-model="form.category_id" class="form-select form-select-lg border-black border-2 fw-bold bg-white shadow-none" required>
                <option value="" disabled>Seleccione una categoría...</option>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-black text-uppercase fs-6">SUCURSAL / TIENDA (Obligatorio)</label>
              <select v-model="form.store_id" class="form-select form-select-lg border-black border-2 fw-bold bg-white shadow-none" required>
                <option value="" disabled>Seleccione la sucursal de registro...</option>
                <option v-for="store in productStore.stores" :key="store.id" :value="store.id">{{ store.name }}</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-black text-uppercase fs-6">DESCRIPCIÓN (Opcional)</label>
            <textarea v-model="form.description" class="form-control border-black border-2 shadow-none fw-bold" rows="2" placeholder="Descripción breve..."></textarea>
          </div>

          <!-- IMAGENES DINÁMICAS -->
          <h4 class="fw-black mb-3 border-bottom border-black pb-2 text-uppercase text-primary d-flex justify-content-between align-items-center mt-5">
            2. Galería de Imágenes
            <button type="button" @click="addImageBox" class="btn btn-sm btn-dark fw-black">+ AÑADIR OTRA IMAGEN</button>
          </h4>

          <!-- Existing Images when editing -->
          <div v-if="form.existing_images.length > 0" class="mb-4 p-3 bg-light border border-black border-2">
            <label class="form-label fw-black text-uppercase fs-7 mb-3 d-block">Imágenes</label>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(img, idx) in form.existing_images" :key="img.id" class="position-relative border border-black border-2 bg-white p-2 text-center" style="width: 140px;">
                <img :src="img.image_url" class="object-fit-cover w-100 mb-2 border border-black" style="height: 100px;">
                <span v-if="img.is_primary" class="badge bg-warning text-black mb-2 d-block border border-black fw-bold fs-8">PORTADA</span>
                <button type="button" @click="deleteExistingImage(img.image_url, idx)" class="btn btn-sm btn-danger fw-black w-100 fs-8">ELIMINAR</button>
              </div>
            </div>
          </div>

          <!-- New Image sequential input boxes -->
          <div class="mb-5 p-3 bg-light border border-black border-2">
            <label class="form-label fw-black text-uppercase fs-7 mb-3 d-block">Nuevas Imágenes</label>
            
            <div v-for="(box, idx) in form.new_image_boxes" :key="idx" class="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-3 pb-3 border-bottom border-black">
              <div class="flex-grow-1">
                <label class="form-label fw-bold fs-7 mb-1">Imagen #{{ idx + 1 }} {{ idx === 0 && form.existing_images.length === 0 ? '(Será la Portada)' : '' }}</label>
                <input type="file" @change="(e) => handleImageFileChange(e, idx)" class="form-control border-black shadow-none fw-bold bg-white" accept="image/*">
              </div>
              
              <div v-if="box.preview" class="border border-black bg-white p-1" style="width: 70px; height: 70px;">
                <img :src="box.preview" class="w-100 h-100 object-fit-cover">
              </div>

              <button type="button" @click="removeImageBox(idx)" class="btn btn-danger fw-black border-black border-2 m-0 px-3 py-2 align-self-sm-end" :disabled="form.new_image_boxes.length === 1 && !box.file">
                X
              </button>
            </div>
          </div>

          <!-- VARIANTES -->
          <h4 class="fw-black mb-3 border-bottom border-black pb-2 text-uppercase text-primary d-flex justify-content-between align-items-center mt-5">
            3. Gestión de Tallas y Stock
            <button type="button" @click="addVariant" class="btn btn-sm btn-dark fw-black">+ AÑADIR TALLA / VARIANTE</button>
          </h4>

          <div v-for="(v, idx) in form.variants" :key="idx" class="row g-2 mb-3 align-items-end bg-light p-3 border border-black border-2 mx-0 position-relative">
            <div class="col-md-3">
              <label class="form-label fw-black fs-6 m-0 mb-1">TALLA (Letra/Número)</label>
              <input v-model="v.size" type="text" class="form-control border-black fw-bold" placeholder="Ejem: 40 o M" required>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-black fs-6 m-0 mb-1">SKU PROPIO (Opcional)</label>
              <input v-model="v.sku" type="text" class="form-control border-black fw-bold" placeholder="Autogenerado si está vacío">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-black fs-6 m-0 mb-1">STOCK SUCURSAL</label>
              <input v-model="v.stock" type="number" min="0" class="form-control border-black fw-bold" required>
            </div>
            <div class="col-md-2 text-end">
              <button type="button" @click="removeVariant(idx)" class="btn btn-danger fw-black w-100 border-black border-2 m-0" :disabled="form.variants.length === 1">X</button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-4 mt-4 fw-black text-uppercase fs-4 m-0 shadow" :disabled="saving">
            {{ saving ? 'GUARDANDO DATOS E IMÁGENES...' : (modalMode === 'create' ? 'REGISTRAR PRODUCTO EN SUCURSAL' : 'GUARDAR CAMBIOS') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
