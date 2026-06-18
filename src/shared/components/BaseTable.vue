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
    default: 'CARGANDO...'
  },
  emptyText: {
    type: String,
    default: 'NO HAY DATOS REGISTRADOS'
  },
  itemKey: {
    type: String,
    default: 'id'
  }
})
</script>

<template>
  <div class="card border-black border-3 shadow-solid bg-white mb-4">
    <div class="card-body p-0 table-responsive">
      <table class="table table-hover align-middle m-0 fs-5">
        <thead class="table-dark text-uppercase border-bottom border-black border-3">
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key" 
              scope="col" 
              class="py-3 px-4"
              :class="col.headerClass || ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading && items.length === 0">
            <td :colspan="columns.length" class="text-center py-5 fw-bold">{{ loadingText }}</td>
          </tr>
          <!-- Empty State -->
          <tr v-else-if="items.length === 0">
            <td :colspan="columns.length" class="text-center py-5 fw-bold text-muted">{{ emptyText }}</td>
          </tr>
          <!-- Data Rows -->
          <tr v-else v-for="item in items" :key="item[itemKey]" class="border-bottom border-black">
            <td 
              v-for="col in columns" 
              :key="col.key" 
              class="py-4 px-4"
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
.shadow-solid {
  box-shadow: 8px 8px 0px 0px #000000 !important;
}
</style>
