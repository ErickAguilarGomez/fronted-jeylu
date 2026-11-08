export default [
  {
    path: '/tiendas',
    name: 'PublicStores',
    component: () => import('./views/PublicStoresView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/stores',
    name: 'AdminStores',
    component: () => import('./views/AdminStores.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
