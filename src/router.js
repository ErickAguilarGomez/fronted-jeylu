import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/modules/auth/stores/authStore.js'
import { cancelPendingRequests } from '@/plugins/axios.js'

import catalogRoutes from '@/modules/catalog/routes.js'
import authRoutes from '@/modules/auth/routes.js'
import adminRoutes from '@/modules/admin/routes.js'
import sellerRoutes from '@/modules/seller/routes.js'
import productsRoutes from '@/modules/products/routes.js'
import categoriesRoutes from '@/modules/categories/routes.js'
import storesRoutes from '@/modules/stores/routes.js'
import usersRoutes from '@/modules/users/routes.js'
import bannersRoutes from '@/modules/banners/routes.js'
import settingsRoutes from '@/modules/settings/routes.js'
import salesRoutes from '@/modules/sales/routes.js'
import discountsRoutes from '@/modules/discounts/routes.js'

const routes = [
  ...catalogRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...sellerRoutes,
  ...productsRoutes,
  ...categoriesRoutes,
  ...storesRoutes,
  ...usersRoutes,
  ...bannersRoutes,
  ...settingsRoutes,
  ...salesRoutes,
  ...discountsRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  cancelPendingRequests()
  const isAuthenticated = authStore.isAuthenticated
  const roleId = Number(authStore.user?.role_id)

  if (to.meta.guestOnly && isAuthenticated) {
    if (roleId === 1) return next({ name: 'AdminDashboard' })
    if (roleId === 2) return next({ name: 'SellerDashboard' })
    return next({ name: 'Home' })
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login' })
  }

  if (to.meta.roles && !to.meta.roles.includes(roleId)) {
    if (roleId === 2) return next({ name: 'SellerDashboard' })
    return next({ name: 'Home' })
  }

  next()
})

router.onError((error) => {
  const pattern = /Failed to fetch dynamically imported module|chunk/i;
  if (pattern.test(error.message)) {
    window.location.reload()
  }
})

export default router
