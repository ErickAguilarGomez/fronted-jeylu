<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartStore } from '../stores/cartStore.js'
import { whatsappStore } from '@/modules/settings/stores/whatsappStore.js'
import { useToast } from '@/composables/useToast.js'
import api from '@/plugins/axios'
import WhatsappSelector from '@/shared/components/WhatsappSelector.vue'

const router = useRouter()
const toast = useToast()
const whatsappSelectorRef = ref(null)

const stores = ref([])
const loadingStores = ref(false)

// Payment selection first ('whatsapp' | 'card')
const selectedPaymentMethod = ref('whatsapp')

// Customer & Delivery fields (Only used for Card payment)
const customerName = ref('')
const customerPhone = ref('')
const customerEmail = ref('')
const deliveryType = ref('pickup') // 'pickup' | 'delivery'
const selectedStore = ref('')
const deliveryAddress = ref('')
const orderNotes = ref('')

// Card fields
const cardHolder = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const processingPayment = ref(false)

// Success state
const orderSuccess = ref(false)
const confirmedOrder = ref(null)

onMounted(async () => {
  if (cartStore.isEmpty && !orderSuccess.value) {
    router.push('/carrito')
    return
  }

  whatsappStore.fetchActiveNumbers()

  // Fetch stores for pickup
  try {
    loadingStores.value = true
    const res = await api.get('/stores/public')
    if (res.data && res.data.success) {
      stores.value = res.data.stores
      if (stores.value.length > 0) {
        selectedStore.value = stores.value[0].name
      }
    }
  } catch (err) {
    console.error('Error fetching stores:', err)
  } finally {
    loadingStores.value = false
  }
})

// WhatsApp Checkout (Zero forms needed, coordinated directly in WhatsApp chat)
const processWhatsAppCheckout = () => {
  if (cartStore.isEmpty) {
    toast.error('El carrito está vacío.')
    return
  }

  const activeNumbers = whatsappStore.whatsappNumbers
  if (activeNumbers.length === 0) {
    toast.error('No hay números de atención por WhatsApp configurados en este momento.')
    return
  }

  // Build clean message directly from cart items
  let message = `¡Hola JEILU! 👋 Deseo realizar el siguiente pedido desde la tienda virtual:\n\n`
  message += `📦 *DETALLE DEL PEDIDO:*\n`
  cartStore.items.forEach((item, index) => {
    const sizeStr = item.size ? ` (Talle: ${item.size})` : ''
    const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2)
    message += `${index + 1}. ${item.name}${sizeStr}\n`
    message += `   ↳ Cantidad: ${item.quantity} | Unitario: $${Number(item.price).toFixed(2)} | Subtotal: $${itemTotal}\n`
  })

  message += `\n💰 *TOTAL A PAGAR: $${cartStore.totalAmount.toFixed(2)}*\n\n`
  message += `¿Tienen disponibilidad para coordinar el pago y la entrega? ¡Muchas gracias!`

  if (activeNumbers.length === 1) {
    const rawNumber = activeNumbers[0].phone_number.replace(/\D/g, '')
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('Abriendo WhatsApp para confirmar tu pedido...')
  } else {
    if (whatsappSelectorRef.value) {
      whatsappSelectorRef.value.openModal(message)
    }
  }
}

// Card Checkout (Validates customer & dispatch details, saves sale in database)
const processCardCheckout = async () => {
  if (cartStore.isEmpty) {
    toast.error('El carrito está vacío.')
    return
  }

  if (!customerName.value.trim()) {
    toast.warning('Por favor ingresa tu nombre completo para el despacho.')
    return
  }

  if (!customerPhone.value.trim()) {
    toast.warning('Por favor ingresa un teléfono o WhatsApp de contacto.')
    return
  }

  if (deliveryType.value === 'delivery' && !deliveryAddress.value.trim()) {
    toast.warning('Por favor ingresa la dirección de entrega a domicilio.')
    return
  }

  if (!cardHolder.value.trim() || !cardNumber.value.trim() || !cardExpiry.value.trim() || !cardCvv.value.trim()) {
    toast.warning('Por favor completa todos los datos de la tarjeta de crédito/débito.')
    return
  }

  try {
    processingPayment.value = true

    const payload = {
      items: cartStore.items.map(item => ({
        sku: item.sku,
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      customer_name: customerName.value.trim(),
      customer_phone: customerPhone.value.trim(),
      customer_email: customerEmail.value.trim() || null,
      delivery_type: deliveryType.value,
      delivery_address: deliveryType.value === 'delivery' ? deliveryAddress.value.trim() : `Retiro en Sucursal: ${selectedStore.value}`,
      order_notes: orderNotes.value.trim() || null,
      card_name: cardHolder.value.trim(),
      card_number: cardNumber.value.slice(-4) // Last 4 digits for security record
    }

    const res = await api.post('/sales/checkout', payload)

    if (res.data && res.data.success) {
      confirmedOrder.value = {
        sale_id: res.data.sale_id,
        total: res.data.total,
        customer_name: res.data.customer_name,
        customer_phone: res.data.customer_phone,
        delivery_type: res.data.delivery_type,
        delivery_address: payload.delivery_address,
        items: [...cartStore.items]
      }
      orderSuccess.value = true
      cartStore.clearCart()
      toast.success('¡Compra realizada con éxito! Tu pedido ha sido registrado para despacho.', '¡Pago Confirmado!')
    } else {
      toast.error(res.data?.message || 'Error al procesar el pago.')
    }
  } catch (err) {
    console.error('Error in card checkout:', err)
    const errorMsg = err.response?.data?.message || 'No se pudo procesar el pago. Por favor intenta nuevamente.'
    toast.error(errorMsg)
  } finally {
    processingPayment.value = false
  }
}
</script>

<template>
  <div class="amazon-checkout-page py-4">
    <div class="container-fluid px-3 px-lg-5">
      
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small mb-0">
          <li class="breadcrumb-item"><router-link to="/" class="text-muted text-decoration-none">Inicio</router-link></li>
          <li class="breadcrumb-item"><router-link to="/carrito" class="text-muted text-decoration-none">Carrito</router-link></li>
          <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">Finalizar Compra</li>
        </ol>
      </nav>

      <!-- SCREEN 1: SUCCESS CONFIRMATION STATE -->
      <div v-if="orderSuccess && confirmedOrder" class="card bg-white p-4 p-lg-5 border-0 shadow-sm rounded-3 my-4 mx-auto" style="max-width: 800px;">
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle mb-3" style="width: 72px; height: 72px;">
            <i class="bi bi-check-circle-fill fs-1"></i>
          </div>
          <h2 class="fw-bold text-dark mb-1">¡Gracias por tu compra!</h2>
          <p class="text-muted">Tu pedido ha sido confirmado y guardado para despacho en el sistema.</p>
          <div class="badge bg-light text-dark border px-3 py-2 fs-6 mt-1">
            Número de Pedido: <strong>#{{ confirmedOrder.sale_id }}</strong>
          </div>
        </div>

        <!-- Dispatch summary card -->
        <div class="alert alert-info border-start border-4 border-info p-3 mb-4 rounded-2">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-truck fs-5 text-info"></i>
            <h6 class="fw-bold m-0 text-dark">Información de Despacho y Entrega</h6>
          </div>
          <div class="small text-muted d-flex flex-column gap-1 ps-4">
            <div><strong>Cliente:</strong> {{ confirmedOrder.customer_name }}</div>
            <div><strong>Contacto:</strong> {{ confirmedOrder.customer_phone }}</div>
            <div>
              <strong>Modalidad:</strong> 
              {{ confirmedOrder.delivery_type === 'pickup' ? 'Retiro en Sucursal' : 'Envío a Domicilio' }}
            </div>
            <div><strong>Destino:</strong> {{ confirmedOrder.delivery_address }}</div>
            <div><strong>Estado:</strong> <span class="badge bg-warning text-dark">Pendiente de Despacho</span></div>
          </div>
        </div>

        <!-- Items table -->
        <div class="border rounded p-3 mb-4 bg-light bg-opacity-50">
          <h6 class="fw-bold text-dark mb-2">Artículos comprados</h6>
          <div v-for="it in confirmedOrder.items" :key="it.id" class="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">{{ it.quantity }}x</span>
              <span class="small fw-semibold text-dark">{{ it.name }}</span>
              <span v-if="it.size" class="small text-muted">(Talle {{ it.size }})</span>
            </div>
            <span class="small fw-bold text-dark">${{ (it.price * it.quantity).toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-baseline pt-2 mt-1">
            <span class="fw-bold text-dark">Total pagado:</span>
            <span class="fs-5 fw-bold text-dark">${{ Number(confirmedOrder.total).toFixed(2) }}</span>
          </div>
        </div>

        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <router-link to="/catalog" class="btn btn-amazon-primary px-4 py-2 fw-semibold rounded-pill">
            <i class="bi bi-grid me-2"></i> Seguir Comprando en Catálogo
          </router-link>
        </div>
      </div>

      <!-- SCREEN 2: ACTIVE CHECKOUT LAYOUT -->
      <div v-else class="row g-4 align-items-start">
        
        <!-- Left Column: Step 1 (Payment) & Step 2 (Customer data only for card) -->
        <div class="col-lg-7">
          
          <!-- STEP 1: PAYMENT METHOD SELECTION (FIRST) -->
          <div class="card bg-white p-4 border-0 shadow-sm rounded-3 mb-4">
            <div class="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
              <span class="badge bg-dark rounded-circle px-2 py-1 fs-8">1</span>
              <h5 class="fw-bold text-dark m-0">Seleccionar Método de Pago</h5>
            </div>

            <div class="d-flex flex-column gap-3">
              
              <!-- OPTION A: WhatsApp Checkout (Default & Active) -->
              <div 
                class="p-3 rounded border border-2 border-success bg-white shadow-sm"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-whatsapp fs-3 text-success"></i>
                    <div>
                      <h6 class="fw-bold text-dark m-0">Comprar y Coordinar por WhatsApp</h6>
                      <span class="badge bg-success-subtle text-success border border-success-subtle fs-8">Disponible Ahora</span>
                    </div>
                  </div>
                  <div class="form-check m-0">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      value="whatsapp" 
                      v-model="selectedPaymentMethod" 
                      checked
                      id="pmWhatsApp"
                    />
                  </div>
                </div>

                <p class="text-muted fs-8 mb-2">
                  Coordina tu pedido directamente por WhatsApp con atención personalizada oficial. No necesitas llenar formularios aquí; acordarás el pago y la entrega directamente con nuestro asesor.
                </p>

                <div class="d-flex align-items-center gap-2 text-muted fs-8 bg-light p-2 rounded">
                  <i class="bi bi-chat-dots text-success"></i>
                  <span>Al confirmar tu pedido en el resumen, se enviará el detalle de tus {{ cartStore.totalCount }} productos y talles seleccionados al chat.</span>
                </div>
              </div>

              <!-- OPTION B: Credit/Debit Card Checkout (Desactivado por ahora) -->
              <div 
                class="p-3 rounded border bg-light bg-opacity-75 opacity-75 cursor-not-allowed"
              >
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-credit-card-2-front fs-3 text-secondary"></i>
                    <div>
                      <div class="d-flex align-items-center gap-2">
                        <h6 class="fw-bold text-secondary m-0">Tarjeta de Crédito o Débito</h6>
                        <span class="badge bg-secondary-subtle text-secondary border fs-8">Próximamente</span>
                      </div>
                      <span class="text-muted fs-8">Habilitaremos pagos online con tarjeta muy pronto. Por ahora, las compras se coordinan por WhatsApp.</span>
                    </div>
                  </div>
                  <div class="form-check m-0">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      value="card" 
                      disabled
                      id="pmCard"
                    />
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2 mt-2">
                  <span class="badge bg-white text-muted border">Visa</span>
                  <span class="badge bg-white text-muted border">Mastercard</span>
                  <span class="badge bg-white text-muted border">American Express</span>
                  <span class="badge bg-white text-muted border">Cabal</span>
                </div>
              </div>

            </div>

          </div>

          <!-- STEP 2: CUSTOMER & DISPATCH FORM (ONLY SHOWN FOR CARD PAYMENT) -->
          <div v-if="selectedPaymentMethod === 'card'" class="card bg-white p-4 border-0 shadow-sm rounded-3 mb-4 animate-fade-in">
            <div class="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
              <span class="badge bg-dark rounded-circle px-2 py-1 fs-8">2</span>
              <h5 class="fw-bold text-dark m-0">Datos del Comprador y Despacho</h5>
            </div>

            <p class="text-muted fs-8 mb-3">
              Completa los datos de destino para coordinar el empaque y despacho de tu compra.
            </p>

            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark mb-1">
                  Nombre Completo <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="customerName"
                  type="text" 
                  class="form-control border shadow-none" 
                  placeholder="Tu nombre y apellido"
                  required
                />
              </div>

              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark mb-1">
                  Teléfono / WhatsApp <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="customerPhone"
                  type="tel" 
                  class="form-control border shadow-none" 
                  placeholder="Ej: +54 9 11 2345 6789"
                  required
                />
              </div>

              <div class="col-12">
                <label class="form-label small fw-semibold text-dark mb-1">
                  Correo Electrónico (Para envío de factura/comprobante)
                </label>
                <input 
                  v-model="customerEmail"
                  type="email" 
                  class="form-control border shadow-none" 
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <!-- Delivery Mode Selection -->
              <div class="col-12 mt-3">
                <label class="form-label small fw-semibold text-dark mb-2">Modalidad de Entrega</label>
                <div class="d-flex flex-column flex-sm-row gap-2">
                  <div 
                    @click="deliveryType = 'pickup'"
                    :class="['p-3 rounded border cursor-pointer flex-fill transition', deliveryType === 'pickup' ? 'border-warning bg-warning bg-opacity-10' : 'bg-light']"
                  >
                    <div class="form-check m-0">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        value="pickup" 
                        v-model="deliveryType" 
                        id="radioPickup"
                      />
                      <label class="form-check-label fw-bold text-dark ms-1 cursor-pointer" for="radioPickup">
                        <i class="bi bi-shop me-1 text-primary"></i> Retiro en Sucursal
                      </label>
                    </div>
                    <span class="text-muted fs-8 d-block mt-1">Sin costo adicional en tiendas oficiales JEILU.</span>
                  </div>

                  <div 
                    @click="deliveryType = 'delivery'"
                    :class="['p-3 rounded border cursor-pointer flex-fill transition', deliveryType === 'delivery' ? 'border-warning bg-warning bg-opacity-10' : 'bg-light']"
                  >
                    <div class="form-check m-0">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        value="delivery" 
                        v-model="deliveryType" 
                        id="radioDelivery"
                      />
                      <label class="form-check-label fw-bold text-dark ms-1 cursor-pointer" for="radioDelivery">
                        <i class="bi bi-truck me-1 text-success"></i> Envío a Domicilio
                      </label>
                    </div>
                    <span class="text-muted fs-8 d-block mt-1">Despacho postal o mensajería a tu dirección.</span>
                  </div>
                </div>
              </div>

              <!-- Store Select for Pickup -->
              <div v-if="deliveryType === 'pickup'" class="col-12 mt-2">
                <label class="form-label small fw-semibold text-dark mb-1">Seleccionar Sucursal de Retiro</label>
                <select v-model="selectedStore" class="form-select border shadow-none">
                  <option v-for="st in stores" :key="st.id" :value="st.name">
                    {{ st.name }} ({{ st.address }})
                  </option>
                </select>
              </div>

              <!-- Address for Delivery -->
              <div v-else class="col-12 mt-2">
                <label class="form-label small fw-semibold text-dark mb-1">Dirección Completa de Despacho <span class="text-danger">*</span></label>
                <input 
                  v-model="deliveryAddress"
                  type="text" 
                  class="form-control border shadow-none" 
                  placeholder="Calle, número, piso/depto, ciudad, código postal..."
                  required
                />
              </div>

              <div class="col-12">
                <label class="form-label small fw-semibold text-dark mb-1">Notas u Observaciones para el Despacho (Opcional)</label>
                <textarea 
                  v-model="orderNotes"
                  rows="2" 
                  class="form-control border shadow-none" 
                  placeholder="Horarios de preferencia o indicaciones para el repartidor..."
                ></textarea>
              </div>

              <!-- Card Data Sub-section -->
              <div class="col-12 mt-4 pt-3 border-top">
                <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i class="bi bi-shield-lock-fill text-success"></i>
                  <span>Datos de la Tarjeta</span>
                </h6>

                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label small fw-semibold text-dark mb-1">Nombre que figura en la tarjeta</label>
                    <input 
                      v-model="cardHolder" 
                      type="text" 
                      class="form-control border shadow-none text-uppercase" 
                      placeholder="JUAN PEREZ"
                      required 
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-dark mb-1">Número de Tarjeta</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white border-end-0"><i class="bi bi-credit-card text-muted"></i></span>
                      <input 
                        v-model="cardNumber" 
                        type="text" 
                        maxlength="19"
                        class="form-control border shadow-none font-monospace border-start-0" 
                        placeholder="•••• •••• •••• ••••" 
                        required
                      />
                    </div>
                  </div>

                  <div class="col-sm-6">
                    <label class="form-label small fw-semibold text-dark mb-1">Vencimiento (MM/AA)</label>
                    <input 
                      v-model="cardExpiry" 
                      type="text" 
                      maxlength="5"
                      class="form-control border shadow-none text-center font-monospace" 
                      placeholder="12/28" 
                      required
                    />
                  </div>

                  <div class="col-sm-6">
                    <label class="form-label small fw-semibold text-dark mb-1">CVV / Código de Seguridad</label>
                    <input 
                      v-model="cardCvv" 
                      type="password" 
                      maxlength="4"
                      class="form-control border shadow-none text-center font-monospace" 
                      placeholder="•••" 
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- Submit Payment Button -->
              <div class="col-12 mt-4">
                <button 
                  @click="processCardCheckout"
                  :disabled="processingPayment"
                  class="btn btn-amazon-primary w-100 py-3 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill fs-6"
                >
                  <span v-if="processingPayment" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-lock-fill me-1"></i>
                  <span>{{ processingPayment ? 'Procesando pago y registrando pedido...' : `Pagar y Confirmar Pedido ($${cartStore.totalAmount.toFixed(2)})` }}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        <!-- Right Column: Order Summary -->
        <div class="col-lg-5">
          <div class="card bg-white p-4 border-0 shadow-sm rounded-3 sticky-top" style="top: 85px;">
            
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h5 class="fw-bold text-dark m-0">Resumen del Pedido</h5>
              <router-link to="/carrito" class="small text-primary text-decoration-none fw-semibold">
                Modificar carrito
              </router-link>
            </div>

            <!-- Items Mini List -->
            <div class="d-flex flex-column gap-2 mb-3 max-h-300 overflow-y-auto pe-1">
              <div 
                v-for="item in cartStore.items" 
                :key="item.id"
                class="d-flex align-items-center justify-content-between gap-2 p-2 rounded bg-light"
              >
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                  <img 
                    v-if="item.image" 
                    :src="item.image" 
                    :alt="item.name" 
                    class="rounded border bg-white object-fit-contain flex-shrink-0" 
                    style="width: 44px; height: 44px;"
                  />
                  <div class="overflow-hidden">
                    <div class="fw-semibold text-dark text-truncate fs-8 lh-sm">{{ item.name }}</div>
                    <div class="text-muted fs-8">
                      <span v-if="item.size" class="fw-semibold text-dark">Talle {{ item.size }} &bull; </span>
                      Cant: {{ item.quantity }}
                    </div>
                  </div>
                </div>

                <div class="fw-bold text-dark fs-7 flex-shrink-0 text-end">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Totals Breakdown -->
            <div class="border-top pt-3 d-flex flex-column gap-2">
              <div class="d-flex justify-content-between text-muted fs-7">
                <span>Subtotal ({{ cartStore.totalCount }} productos):</span>
                <span class="text-dark fw-semibold">${{ cartStore.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between text-muted fs-7">
                <span>Entrega:</span>
                <span class="text-success fw-semibold">{{ deliveryType === 'pickup' ? 'Gratis en tienda' : 'Coordinada en despacho' }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-baseline border-top pt-2 mt-1">
                <span class="fw-bold text-dark fs-6">Total a pagar:</span>
                <span class="fs-4 fw-bold text-dark">${{ cartStore.totalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Primary Action in Summary Card based on selected payment -->
            <div class="mt-4">
              <button 
                v-if="selectedPaymentMethod === 'whatsapp'"
                @click="processWhatsAppCheckout"
                class="btn btn-amazon-primary w-100 py-3 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill fs-6"
              >
                <i class="bi bi-whatsapp fs-5 text-success"></i>
                <span>Comprar por WhatsApp</span>
              </button>

              <button 
                v-else
                @click="processCardCheckout"
                :disabled="processingPayment"
                class="btn btn-amazon-primary w-100 py-3 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill fs-6"
              >
                <span v-if="processingPayment" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-lock-fill me-1"></i>
                <span>{{ processingPayment ? 'Procesando...' : `Confirmar y Pagar $${cartStore.totalAmount.toFixed(2)}` }}</span>
              </button>
            </div>

            <!-- Trust signals -->
            <div class="mt-4 pt-3 border-top text-center text-muted fs-8">
              <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
                <i class="bi bi-shield-check text-success"></i>
                <span class="fw-semibold">Atención y Garantía Oficial JEILU</span>
              </div>
              <span>Transacciones protegidas con confirmación de pedido y despacho.</span>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- WhatsApp Selector Modal for multiple numbers -->
    <WhatsappSelector ref="whatsappSelectorRef" />
  </div>
</template>

<style scoped>
.amazon-checkout-page {
  min-height: 80vh;
  background-color: var(--amazon-bg, #eaeded);
}

.max-h-300 {
  max-height: 280px;
}

.cursor-pointer {
  cursor: pointer;
}

.transition {
  transition: all 0.15s ease;
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fs-7 {
  font-size: 0.88rem;
}

.fs-8 {
  font-size: 0.76rem;
}
</style>
