export default [
  {
    path: '/admin/discounts',
    name: 'AdminDiscounts',
    component: () => import('./views/AdminDiscounts.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
