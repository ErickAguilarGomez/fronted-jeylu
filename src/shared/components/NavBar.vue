<script setup>
import { ref, onMounted } from 'vue'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { catalogStore } from '@/modules/catalog/stores/catalogStore.js'
import { cartStore } from '@/modules/catalog/stores/cartStore.js'
import { useRouter } from 'vue-router'
import { socialMediaStore } from '@/modules/settings/stores/socialMediaStore.js'

const router = useRouter()
const localSearch = ref('')
const isUserDropdownOpen = ref(false)

onMounted(() => { 
  if (socialMediaStore.socialMedia.length === 0) {
    socialMediaStore.fetchActiveSocialMedia()
  }
  if (catalogStore.categories.length === 0) {
    catalogStore.fetchCategories()
  }
  localSearch.value = catalogStore.searchQuery || ''
})

const handleSearch = () => {
  catalogStore.searchQuery = localSearch.value
  catalogStore.selectedCategoryId = null
  catalogStore.fetchProducts(1)
  if (router.currentRoute.value.path !== '/catalog') {
    router.push('/catalog')
  }
}

const goToCategory = (catId) => {
  catalogStore.selectedCategoryId = catId
  catalogStore.searchQuery = ''
  localSearch.value = ''
  catalogStore.fetchProducts(1)
  if (router.currentRoute.value.path !== '/catalog') {
    router.push('/catalog')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  window.location.href = '/login'
}

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}
</script>

<template>
  <header class="amazon-header shadow-sm">
    <!-- TOP TIER: Primary Brand, Location, Search, Account, Cart -->
    <div class="amazon-nav-top py-2 px-3 px-lg-4">
      <div class="container-fluid p-0 d-flex align-items-center justify-content-between gap-2 gap-lg-3">
        
        <!-- Logo Amazon Style (Clean JEILU Brand) -->
        <router-link to="/" class="amazon-brand d-flex flex-column align-items-start text-decoration-none me-2">
          <span class="brand-text">JEILU</span>
          <!-- Amazon Style Smile Curve -->
          <svg class="amazon-smile" viewBox="0 0 100 20" width="65" height="12">
            <path d="M 5 5 Q 50 25 95 5" fill="none" stroke="#FEBD69" stroke-width="3.5" stroke-linecap="round"/>
            <polygon points="90,1 98,6 94,13" fill="#FEBD69" />
          </svg>
        </router-link>

        <!-- Central Global Search Bar -->
        <div class="amazon-search-bar flex-grow-1 mx-lg-2">
          <form @submit.prevent="handleSearch" class="d-flex w-100 rounded-2 overflow-hidden shadow-sm">
            <!-- Search Input -->
            <input 
              type="text" 
              v-model="localSearch"
              @keyup.enter="handleSearch"
              class="form-control amazon-search-input border-0 shadow-none px-3"
              placeholder="Buscar productos, calzado, marcas..."
              aria-label="Buscar en JEILU"
            />

            <!-- Search Submit Button (Amber Yellow) -->
            <button 
              type="submit" 
              class="amazon-search-btn btn d-flex align-items-center justify-content-center"
              aria-label="Buscar"
            >
              <i class="bi bi-search fs-5"></i>
            </button>
          </form>
        </div>

        <!-- Right Side Nav Actions -->
        <div class="d-flex align-items-center gap-1 gap-lg-3">
          
          <!-- User / Account Menu -->
          <template v-if="authStore.isAuthenticated">
            <div class="position-relative">
              <div 
                @click="toggleUserDropdown" 
                class="amazon-nav-box text-white cursor-pointer d-flex flex-column line-height-tight"
                tabindex="0"
              >
                <span class="nav-small-text text-secondary text-truncate" style="max-width: 120px;">
                  Hola, {{ authStore.user?.name || 'Usuario' }}
                </span>
                <span class="nav-bold-text d-flex align-items-center">
                  Cuenta y Listas <i class="bi bi-caret-down-fill fs-8 ms-1"></i>
                </span>
              </div>

              <!-- Dropdown Menu -->
              <div 
                v-if="isUserDropdownOpen" 
                class="amazon-dropdown shadow-lg position-absolute end-0 mt-2 bg-white rounded-2 p-3"
                style="width: 240px; z-index: 1060;"
              >
                <div class="border-bottom pb-2 mb-2">
                  <div class="fw-bold text-dark">{{ authStore.user?.name }}</div>
                  <div class="small text-muted">{{ authStore.user?.email }}</div>
                  <span class="badge bg-warning text-dark mt-1">{{ authStore.user?.role_name || 'Vendedor' }}</span>
                </div>

                <div class="d-flex flex-column gap-1">
                  <router-link 
                    v-if="authStore.isAdmin()" 
                    to="/admin" 
                    @click="isUserDropdownOpen = false" 
                    class="dropdown-item py-2 px-2 rounded"
                  >
                    <i class="bi bi-speedometer2 me-2"></i> Panel de Administración
                  </router-link>

                  <router-link 
                    v-if="authStore.isSeller()" 
                    to="/seller" 
                    @click="isUserDropdownOpen = false" 
                    class="dropdown-item py-2 px-2 rounded"
                  >
                    <i class="bi bi-graph-up me-2"></i> Mi Panel de Ventas
                  </router-link>

                  <router-link 
                    v-if="authStore.hasPosAccess()" 
                    to="/pos" 
                    @click="isUserDropdownOpen = false" 
                    class="dropdown-item py-2 px-2 rounded"
                  >
                    <i class="bi bi-upc-scan me-2"></i> POS / Escáner
                  </router-link>

                  <hr class="my-2" />

                  <button 
                    @click="handleLogout" 
                    class="btn btn-sm btn-outline-danger w-100 text-center py-2"
                  >
                    <i class="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="amazon-nav-box text-white text-decoration-none d-flex flex-column line-height-tight">
              <span class="nav-small-text text-secondary">Hola, identifícate</span>
              <span class="nav-bold-text">Cuenta y Listas</span>
            </router-link>
          </template>


          <!-- Cart Button -->
          <router-link to="/carrito" class="amazon-nav-box text-white text-decoration-none d-flex align-items-center">
            <div class="position-relative me-1">
              <i class="bi bi-cart3 fs-3 text-white"></i>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fw-bold px-1 py-0 fs-8" style="transform: translate(-45%, -10%) !important;">
                {{ cartStore.totalCount }}
              </span>
            </div>
            <span class="nav-bold-text d-none d-sm-inline align-self-end mb-1">Carrito</span>
          </router-link>

        </div>
      </div>
    </div>

    <!-- SUB TIER: Secondary Navigation Bar (Amazon Slate Blue #232F3E) -->
    <div class="amazon-nav-sub py-1 px-3 px-lg-4">
      <div class="container-fluid p-0 d-flex align-items-center justify-content-between overflow-x-auto text-nowrap">
        <div class="d-flex align-items-center gap-1 gap-lg-2">
          
          <!-- "Todo" Menu button -->
          <a 
            href="#" 
            @click.prevent="goToCategory(null)" 
            class="subnav-link fw-bold d-flex align-items-center text-white text-decoration-none px-2 py-1 rounded"
          >
            <i class="bi bi-list fs-5 me-1"></i> Todo
          </a>

          <!-- Main Nav Links -->
          <router-link to="/" class="subnav-link text-white text-decoration-none px-2 py-1 rounded">
            Inicio
          </router-link>

          <!-- Categorías Dinámicas Reales del Sistema -->
          <a 
            v-for="cat in catalogStore.categories.slice(0, 5)" 
            :key="cat.id" 
            href="#"
            @click.prevent="goToCategory(cat.id)"
            class="subnav-link text-white text-decoration-none px-2 py-1 rounded"
          >
            {{ cat.name }}
          </a>

          <a href="/#tiendas" class="subnav-link text-white text-decoration-none px-2 py-1 rounded">
            Nuestras Tiendas
          </a>

        </div>

        <!-- Social Icons in Subnav -->
        <div v-if="socialMediaStore.socialMedia.length > 0" class="d-none d-lg-flex align-items-center gap-2">
          <a 
            v-for="item in socialMediaStore.socialMedia" 
            :key="item.id" 
            v-show="item.type !== 'whatsapp' && item.url"
            :href="item.url" 
            target="_blank" 
            class="text-white-50 text-decoration-none p-1 hover-white" 
            :title="item.type.toUpperCase()"
          >
            <i :class="['bi', `bi-${item.icon || item.type}`, 'fs-6']"></i>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.amazon-header {
  position: sticky;
  top: 0;
  z-index: 1030;
  width: 100%;
}

/* TOP BAR */
.amazon-nav-top {
  background-color: var(--amazon-navy-dark, #131921);
  color: #ffffff;
}

.amazon-brand {
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 2px;
  border: 1px solid transparent;
}
.amazon-brand:hover {
  border-color: #ffffff;
}

.brand-text {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
}

.brand-tld {
  color: #febd69;
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: 2px;
}

.amazon-smile {
  display: block;
  margin-top: -2px;
}

/* BOX BUTTONS (Deliver to, Account, Orders) */
.amazon-nav-box {
  padding: 5px 9px;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.1s;
}

.amazon-nav-box:hover {
  border-color: #ffffff;
}

.line-height-tight {
  line-height: 1.15;
}

.nav-small-text {
  font-size: 0.75rem;
  color: #cccccc !important;
}

.nav-bold-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

/* SEARCH BAR */
.amazon-search-bar {
  max-width: 850px;
}

.amazon-search-bar form {
  height: 40px;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.amazon-search-bar form:focus-within {
  border-color: #f3a847;
  box-shadow: 0 0 0 2px rgba(228, 121, 17, 0.5);
}

.amazon-search-select {
  background-color: #f3f3f3;
  color: #0f1111;
  border: none;
  border-right: 1px solid #cdcdcd;
  font-size: 0.82rem;
  padding: 0 10px;
  cursor: pointer;
  max-width: 140px;
  outline: none;
}

.amazon-search-select:hover {
  background-color: #dadada;
}

.amazon-search-input {
  border-radius: 0 !important;
  font-size: 0.95rem;
  color: #0f1111;
  background-color: #ffffff !important;
}

.amazon-search-input:focus {
  box-shadow: none !important;
}

.amazon-search-btn {
  background-color: var(--amazon-search-btn, #febd69) !important;
  color: #131921 !important;
  border-radius: 0 !important;
  padding: 0 16px !important;
  border: none !important;
  transition: background-color 0.15s;
}

.amazon-search-btn:hover {
  background-color: var(--amazon-search-btn-hover, #f3a847) !important;
}

/* SUBNAV TIER */
.amazon-nav-sub {
  background-color: var(--amazon-navy-light, #232f3e);
}

.subnav-link {
  font-size: 0.88rem;
  color: #ffffff;
  border: 1px solid transparent;
  transition: border-color 0.1s;
}

.subnav-link:hover {
  border-color: #ffffff;
  color: #ffffff;
  text-decoration: none;
}

.hover-white:hover {
  color: #ffffff !important;
}

/* USER DROPDOWN */
.amazon-dropdown {
  box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
  border: 1px solid #d5d9d9;
}

.amazon-dropdown .dropdown-item {
  color: #0f1111;
  font-size: 0.9rem;
  transition: background-color 0.15s;
}

.amazon-dropdown .dropdown-item:hover {
  background-color: #f0f2f2;
}

.fs-8 {
  font-size: 0.72rem;
}
</style>
