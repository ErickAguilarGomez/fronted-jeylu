<script setup>
defineProps({
  columns: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Cargando datos...'
  },
  emptyText: {
    type: String,
    default: 'No hay datos registrados'
  },
  itemKey: {
    type: String,
    default: 'id'
  }
})
</script>

<template>
  <div class="card border bg-white mb-4 shadow-sm rounded-3 overflow-hidden">
    <div class="card-body p-0 table-responsive">
      <table class="table table-hover align-middle m-0">
        <thead class="amazon-thead">
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key" 
              scope="col" 
              class="py-3 px-3 text-dark fw-semibold"
              :class="col.headerClass || ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading && items.length === 0">
            <td :colspan="columns.length" class="text-center py-5 text-muted">
              <div class="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
              {{ loadingText }}
            </td>
          </tr>
          <!-- Empty State -->
          <tr v-else-if="items.length === 0">
            <td :colspan="columns.length" class="text-center py-5 text-muted small">
              {{ emptyText }}
            </td>
          </tr>
          <!-- Data Rows -->
          <tr v-else v-for="item in items" :key="item[itemKey]" class="border-bottom border-light">
            <td 
              v-for="col in columns" 
              :key="col.key" 
              class="py-3 px-3 text-dark"
              :class="col.class || ''"
            >
              <slot :name="`cell-${col.key}`" :item="item">
                {{ item[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.amazon-thead {
  background-color: #f0f2f2;
  border-bottom: 1px solid #d5d9d9;
}
.amazon-thead th {
  font-size: 0.88rem;
  background-color: #f0f2f2 !important;
  color: #0f1111 !important;
}
</style>
