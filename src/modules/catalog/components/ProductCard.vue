<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// Price split for Amazon style format ($ 99 .00)
const priceParts = computed(() => {
  const num = Number(props.product.price || 0)
  const [whole, fraction] = num.toFixed(2).split('.')
  return { whole, fraction }
})
</script>

<template>
  <div class="card amazon-product-card h-100 d-flex flex-column bg-white">
    <!-- Image Box with Stock Status -->
    <router-link :to="'/producto/' + product.sku" class="amazon-img-wrapper position-relative text-decoration-none">
      <img 
        v-if="product.image_url"
        :src="product.image_url" 
        :alt="product.name" 
        class="amazon-product-img"
        loading="lazy"
      />
      <div v-else class="no-img-placeholder d-flex align-items-center justify-content-center text-muted">
        <i class="bi bi-image fs-1 opacity-25"></i>
      </div>

      <!-- Out of Stock Badge -->
      <span v-if="!product.is_available" class="position-absolute top-0 start-0 m-2 badge bg-secondary text-white fw-bold px-2 py-1">
        Agotado
      </span>
    </router-link>

    <!-- Card Details -->
    <div class="card-body p-3 d-flex flex-column justify-content-between flex-grow-1">
      <div>
        <!-- Category & SKU -->
        <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
          <span class="text-muted fs-8 text-truncate">{{ product.category_name || 'Calzado' }}</span>
          <span class="text-muted fs-8 font-monospace text-nowrap">SKU: {{ product.sku }}</span>
        </div>

        <!-- Product Name (Max 2 lines, Amazon link style) -->
        <h3 class="amazon-title mb-2">
          <router-link :to="'/producto/' + product.sku" class="amazon-title-link">
            {{ product.name }}
          </router-link>
        </h3>

        <!-- Amazon Real Price Block -->
        <div class="amazon-price-row d-flex align-items-baseline gap-1 my-2">
          <span class="amazon-price-currency">$</span>
          <span class="amazon-price-whole">{{ priceParts.whole }}</span>
          <span class="amazon-price-fraction">{{ priceParts.fraction }}</span>
        </div>

        <!-- Stock Status Signal -->
        <div class="small mb-2">
          <div v-if="product.is_available" class="text-success fw-semibold">
            <i class="bi bi-check-circle-fill me-1"></i> En stock
          </div>
          <div v-else class="text-danger fw-semibold">
            <i class="bi bi-x-circle-fill me-1"></i> No disponible temporalmente
          </div>
        </div>
      </div>

      <!-- Action Button (Amazon Pill) -->
      <div class="mt-2 pt-2 border-top border-light">
        <router-link 
          :to="'/producto/' + product.sku"
          :class="['btn w-100 py-2 fs-7 fw-semibold d-flex justify-content-center align-items-center gap-2 rounded-pill', product.is_available ? 'btn-amazon-primary' : 'btn-outline-secondary disabled']"
        >
          <i class="bi bi-eye me-1"></i>
          {{ product.is_available ? 'Ver detalles' : 'Agotado' }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.amazon-product-card {
  border: 1px solid #e7e7e7 !important;
  border-radius: 8px !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;
  overflow: hidden;
}

.amazon-product-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.amazon-img-wrapper {
  background-color: #f7f7f7;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
}

.amazon-product-img {
  max-height: 90%;
  max-width: 90%;
  object-fit: contain;
  transition: transform 0.25s ease;
}

.amazon-product-card:hover .amazon-product-img {
  transform: scale(1.04);
}

.no-img-placeholder {
  width: 100%;
  height: 100%;
}

.amazon-title {
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  line-height: 1.35;
  height: 2.6rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.amazon-title-link {
  color: #0f1111;
  text-decoration: none;
}

.amazon-title-link:hover {
  color: var(--amazon-link-hover, #c7511f);
  text-decoration: underline;
}

.amazon-price-currency {
  font-size: 0.85rem;
  font-weight: 600;
  vertical-align: top;
  color: #0f1111;
}

.amazon-price-whole {
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1;
  color: #0f1111;
}

.amazon-price-fraction {
  font-size: 0.85rem;
  font-weight: 600;
  vertical-align: top;
  color: #0f1111;
}

.fs-7 {
  font-size: 0.88rem;
}
.fs-8 {
  font-size: 0.75rem;
}
</style>

