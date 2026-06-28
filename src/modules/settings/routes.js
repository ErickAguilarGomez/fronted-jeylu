export default [
  {
    path: '/admin/social-media',
    name: 'AdminSocialMedia',
    component: () => import('./views/AdminSocialMedia.vue'),
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/admin/commissions',
    name: 'AdminCommissions',
    component: () => import('./views/AdminCommissions.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
