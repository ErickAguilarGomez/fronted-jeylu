export default [
  {
    path: '/admin/price-increases',
    name: 'AdminPriceIncreases',
    component: () => import('./views/AdminPriceIncreases.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
