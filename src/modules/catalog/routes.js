export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: () => import('./views/CatalogView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/producto/:slug',
    name: 'ProductDetail',
    component: () => import('./views/ProductDetailView.vue'),
    meta: { requiresAuth: false }
  }
]
