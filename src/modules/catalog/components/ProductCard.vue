<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <router-link 
    :to="'/producto/' + product.sku" 
    class="card brutalist-card d-flex flex-column h-100 text-decoration-none text-black"
  >
    <div class="img-container position-relative bg-secondary border-bottom border-black">
      <img 
        :src="product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'" 
        :alt="product.name" 
        class="product-img w-100 object-fit-cover"
        loading="lazy"
      />
      <span class="badge bg-black text-white position-absolute top-0 start-0 m-3 fs-6 border border-black shadow-sm fw-black">
        S/ {{ Number(product.price).toFixed(2) }}
      </span>
    </div>

    <div class="card-body d-flex flex-column justify-content-between p-4 flex-grow-1">
      <div>
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span class="text-muted fw-bold fs-7 font-monospace">SKU: {{ product.sku }}</span>
        </div>
        <h3 class="card-title fs-4 fw-black text-uppercase mb-0 text-wrap">{{ product.name }}</h3>
      </div>

      <div class="mt-4 pt-3 border-top border-black">
        <div 
          :class="['btn w-100 py-3 fs-5 fw-black d-flex justify-content-center align-items-center gap-2 border-2 border-black m-0', product.is_available ? 'btn-dark text-white' : 'btn-secondary text-muted']"
        >
          {{ product.is_available ? 'VER DETALLE' : 'AGOTADO' }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.brutalist-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.brutalist-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
.img-container {
  height: 280px;
  overflow: hidden;
}
.product-img {
  height: 100%;
  transition: transform 0.3s ease;
}
.brutalist-card:hover .product-img {
  transform: scale(1.05);
}
</style>
