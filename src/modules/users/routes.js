export default [
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('./views/AdminUsers.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
