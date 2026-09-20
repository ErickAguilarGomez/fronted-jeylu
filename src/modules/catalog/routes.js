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
  },
  {
    path: '/carrito',
    name: 'Cart',
    component: () => import('./views/CartView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('./views/CheckoutView.vue'),
    meta: { requiresAuth: false }
  }
]

