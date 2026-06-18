export default [
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('./views/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
