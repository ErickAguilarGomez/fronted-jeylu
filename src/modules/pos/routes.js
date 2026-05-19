export default [
  {
    path: '/admin/pos',
    name: 'PosScanner',
    component: () => import('./views/PosScanner.vue'),
    meta: { requiresAuth: true, requiresPosAccess: true }
  }
]
