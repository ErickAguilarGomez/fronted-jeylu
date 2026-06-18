export default [
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('./views/AdminCategories.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
