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
              <div class="header-icon text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
              </div>
              <div>
                <h4 class="m-0 fw-bold text-white">Alerta de Inventario</h4>
                <small class="text-white-50">Productos con stock bajo en tiendas</small>
              </div>
            </div>
            <button @click="closeAlert" class="close-btn" aria-label="Cerrar">&times;</button>
          </div>

          <!-- Body -->
          <div class="low-stock-body">
            <div class="alert alert-warning mb-3 py-2 px-3 d-flex align-items-center gap-2 small">
              <i class="bi bi-exclamation-triangle-fill fs-6 text-warning"></i>
              <span>Los siguientes artículos registran <strong>5 unidades o menos</strong> en inventario:</span>
            </div>

            <div class="stock-list">
              <div v-for="(item, idx) in lowStockItems" :key="idx" class="stock-item">
                <div class="stock-item-info">
                  <span class="product-name">{{ item.product_name }}</span>
                  <div class="product-meta">
                    <span class="meta-tag talla-tag" v-if="item.size">Talle {{ item.size }}</span>
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
            <span class="text-muted small">Notificación automática para administradores</span>
            <button @click="closeAlert" class="btn btn-amazon-primary px-4 py-2 fw-semibold rounded-pill">
              Entendido
            </button>
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
  background: rgba(15, 17, 17, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.low-stock-card {
  background: #ffffff;
  width: 100%;
  max-width: 580px;
  border: 1px solid #d5d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(15, 17, 17, 0.25);
  overflow: hidden;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.low-stock-header {
  background: var(--amazon-navy-light, #232f3e);
  color: #ffffff;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #febd69;
}

.header-icon {
  background: rgba(254, 189, 105, 0.15);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* Body */
.low-stock-body {
  padding: 1.25rem;
}

.stock-list {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-item:hover {
  background: #f7fafa;
}

.stock-item-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #0f1111;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 3px;
}

.product-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.talla-tag {
  background: #f0f2f2;
  color: #0f1111;
  border: 1px solid #d5d9d9;
}

.store-tag {
  background: #e7f4f5;
  color: #007185;
}

/* Badges */
.stock-item-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-left: 12px;
  border-radius: 4px;
}

.stock-badge-critical {
  background: #cc0c39;
  color: #ffffff;
}

.stock-badge-danger {
  background: #ffa41c;
  color: #0f1111;
}

.stock-badge-warning {
  background: #fff8e1;
  color: #b78103;
}

.badge-icon {
  font-size: 0.75rem;
}

/* Footer */
.low-stock-footer {
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e7e7e7;
  background: #f7fafa;
}

/* Transition */
.fade-alert-enter-active,
.fade-alert-leave-active {
  transition: opacity 0.25s ease;
}

.fade-alert-enter-from,
.fade-alert-leave-to {
  opacity: 0;
}
</style>
