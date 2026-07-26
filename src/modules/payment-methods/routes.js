export default [
  {
    path: '/admin/payment-methods',
    name: 'AdminPaymentMethods',
    component: () => import('./views/AdminPaymentMethods.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
