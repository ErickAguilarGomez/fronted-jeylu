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
        v-if="product.image_url"
        :src="product.image_url" 
        :alt="product.name" 
        class="product-img w-100 object-fit-cover"
        loading="lazy"
      />
      <!-- Discount Percentage Badge -->
      <span 
        v-if="product.discount_percentage > 0" 
        class="badge bg-warning text-black position-absolute top-0 end-0 m-3 fs-6 border-2 border-black shadow-solid-sm fw-black"
      >
        -{{ Number(product.discount_percentage) }}%
      </span>

      <!-- Price Badge -->
      <div class="position-absolute top-0 start-0 m-3 d-flex flex-column align-items-start gap-1">
        <span class="badge bg-black text-white fs-6 border border-black shadow-sm fw-black">
          $ {{ Number(product.price).toFixed(2) }}
        </span>
        <span 
          v-if="product.discount_percentage > 0 && product.original_price > product.price" 
          class="badge bg-danger text-white text-decoration-line-through fs-7 border border-black shadow-sm fw-bold opacity-75"
        >
          $ {{ Number(product.original_price).toFixed(2) }}
        </span>
      </div>
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
