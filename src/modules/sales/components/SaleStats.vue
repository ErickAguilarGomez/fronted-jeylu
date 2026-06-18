<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="row g-4 mb-5" v-if="stats">
    <div class="col-md-6">
      <div class="card border-2 border-black shadow-sm p-4 bg-white" style="box-shadow: 4px 4px 0px #000; border-radius: 0px;">
        <div class="fs-6 fw-bold text-uppercase text-muted mb-1">Total Facturado</div>
        <div class="fs-1 fw-black text-black">S/ {{ Number(stats.total_amount).toFixed(2) }}</div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-2 border-black shadow-sm p-4 bg-white" style="box-shadow: 4px 4px 0px #000; border-radius: 0px;">
        <div class="fs-6 fw-bold text-uppercase text-muted mb-1">Cantidad de Ventas</div>
        <div class="fs-1 fw-black text-black">{{ stats.total_sales }}</div>
      </div>
    </div>
  </div>
</template>
