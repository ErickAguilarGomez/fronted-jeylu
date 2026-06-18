export default [
  {
    path: '/admin/sales',
    name: 'AdminSales',
    component: () => import('./views/AdminSales.vue'),
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/seller/sales',
    name: 'SellerSales',
    component: () => import('./views/AdminSales.vue'),
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/pos',
    name: 'PosScanner',
    component: () => import('./views/PosScanner.vue'),
    meta: { requiresAuth: true, roles: [1, 2] }
  }
]
