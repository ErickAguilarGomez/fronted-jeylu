import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/modules/auth/stores/authStore.js'

import catalogRoutes from '@/modules/catalog/routes.js'
import authRoutes from '@/modules/auth/routes.js'
import adminRoutes from '@/modules/admin/routes.js'
import posRoutes from '@/modules/pos/routes.js'

const routes = [
  ...catalogRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...posRoutes,
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
  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin()
  const hasPosAccess = authStore.hasPosAccess()
  const roleId = authStore.user?.role_id

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Home' })
  } else if (to.meta.requiresAdmin && !isAdmin) {
    if (roleId === 2) {
      next({ name: 'PosScanner' })
    } else {
      next({ name: 'Home' })
    }
  } else if (to.meta.requiresPosAccess && !hasPosAccess) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
