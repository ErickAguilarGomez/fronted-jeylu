export default [
  {
    path: '/admin/stores',
    name: 'AdminStores',
    component: () => import('./views/AdminStores.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
