export default [
  {
    path: '/seller',
    name: 'SellerDashboard',
    component: () => import('./views/SellerDashboard.vue'),
    meta: { requiresAuth: true, roles: [2] }
  }
]
