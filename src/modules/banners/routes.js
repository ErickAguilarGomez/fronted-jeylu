export default [
  {
    path: '/admin/banners',
    name: 'AdminBanners',
    component: () => import('./views/AdminBanners.vue'),
    meta: { requiresAuth: true, roles: [1] }
  }
]
