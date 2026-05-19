export default [
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('./views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('./views/AdminProducts.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('./views/AdminCategories.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stores',
    name: 'AdminStores',
    component: () => import('./views/AdminStores.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('./views/AdminUsers.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/sales',
    name: 'AdminSales',
    component: () => import('./views/AdminSales.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
