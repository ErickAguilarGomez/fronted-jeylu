<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import { authStore } from '@/modules/auth/stores/authStore.js'
import BaseModal from '@/shared/components/BaseModal.vue'

const show = ref(false)
const lowStockItems = ref([])
let autoCloseTimer = null

const AUTO_CLOSE_SECONDS = 10

onMounted(async () => {
  // Solo mostrar si es admin y acaba de loguearse
  const justLoggedIn = sessionStorage.getItem('just_logged_in')
  if (!justLoggedIn || !authStore.isAdmin()) return

  // Consumir el flag para que no vuelva a mostrarse
  sessionStorage.removeItem('just_logged_in')

  try {
    const res = await api.get('/products/low-stock')
    if (res.data && res.data.success && res.data.data.length > 0) {
      lowStockItems.value = res.data.data
      show.value = true

      autoCloseTimer = setTimeout(() => {
        show.value = false
      }, AUTO_CLOSE_SECONDS * 1000)
    }
  } catch (e) {
    console.error('Error al consultar stock bajo:', e)
  }
})

const closeAlert = () => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  show.value = false
}

const getStockBadge = (stock) => {
  const n = Number(stock)
  if (n === 0) return { class: 'stock-badge-critical', icon: '🔴', label: 'AGOTADO' }
  if (n <= 2) return { class: 'stock-badge-danger', icon: '🟠', label: `${n} uds.` }
  return { class: 'stock-badge-warning', icon: '🟡', label: `${n} uds.` }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-alert">
      <div v-if="show" class="low-stock-overlay" @click.self="closeAlert">
        <div class="low-stock-card">
          <!-- Header -->
          <div class="low-stock-header">
            <div class="d-flex align-items-center gap-3">
              <div class="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
              </div>
              <div>
                <h3 class="m-0 fw-black text-uppercase">Alerta de Stock</h3>
                <small class="text-white-50">Productos con bajo inventario</small>
              </div>
            </div>
            <button @click="closeAlert" class="close-btn" aria-label="Cerrar">&times;</button>
          </div>

          <!-- Body -->
          <div class="low-stock-body">
            <p class="description-text">
              Los siguientes productos tienen <strong>5 unidades o menos</strong> en alguna de tus tiendas:
            </p>

            <div class="stock-list">
              <div v-for="(item, idx) in lowStockItems" :key="idx" class="stock-item">
                <div class="stock-item-info">
                  <span class="product-name">{{ item.product_name }}</span>
                  <div class="product-meta">
                    <span class="meta-tag talla-tag" v-if="item.size">Talla {{ item.size }}</span>
                    <span class="meta-tag store-tag">{{ item.store_name }}</span>
                  </div>
                </div>
                <div class="stock-item-badge" :class="getStockBadge(item.stock).class">
                  <span class="badge-icon">{{ getStockBadge(item.stock).icon }}</span>
                  <span class="badge-label">{{ getStockBadge(item.stock).label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="low-stock-footer">
            <button @click="closeAlert" class="btn-understood">ENTENDIDO</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.low-stock-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.low-stock-card {
  background: #fff;
  width: 100%;
  max-width: 600px;
  border: 3px solid #000;
  box-shadow: 12px 12px 0px #000;
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.low-stock-header {
  background: #dc3545;
  color: #fff;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.4);
  color: #fff;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255,255,255,0.35);
}

/* Body */
.low-stock-body {
  padding: 1.5rem;
}

.description-text {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1rem;
}

.stock-list {
  max-height: 280px;
  overflow-y: auto;
  border: 2px solid #000;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.15s;
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-item:hover {
  background: #f8f9fa;
}

.stock-item-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 4px;
}

.product-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.talla-tag {
  background: #000;
  color: #fff;
}

.store-tag {
  background: #e9ecef;
  color: #333;
  border: 1px solid #ccc;
}

/* Badges */
.stock-item-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
  margin-left: 12px;
  border: 2px solid #000;
}

.stock-badge-critical {
  background: #dc3545;
  color: #fff;
}

.stock-badge-danger {
  background: #fd7e14;
  color: #000;
}

.stock-badge-warning {
  background: #ffc107;
  color: #000;
}

.badge-icon {
  font-size: 0.8rem;
}

/* Footer */
.low-stock-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #000;
  background: #f8f9fa;
}

.alert-count {
  font-weight: 700;
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.btn-understood {
  background: #000;
  color: #fff;
  border: 2px solid #000;
  padding: 0.6rem 2rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  letter-spacing: 0.5px;
}

.btn-understood:hover {
  background: #333;
  box-shadow: 4px 4px 0px #000;
  transform: translate(-2px, -2px);
}

/* Transition */
.fade-alert-enter-active,
.fade-alert-leave-active {
  transition: opacity 0.3s ease;
}

.fade-alert-enter-from,
.fade-alert-leave-to {
  opacity: 0;
}
</style>
