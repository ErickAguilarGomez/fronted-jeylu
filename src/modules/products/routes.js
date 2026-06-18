export default [
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('./views/AdminProducts.vue'),
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/seller/products',
    name: 'SellerProducts',
    component: () => import('./views/AdminProducts.vue'),
    meta: { requiresAuth: true, roles: [2] }
  }
]
