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
    <div class="card-body p-0 table-responsive d-none d-md-block">
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

    <div class="mobile-table-list d-md-none">
      <div v-if="loading && items.length === 0" class="mobile-table-state">
        <div class="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
        {{ loadingText }}
      </div>
      <div v-else-if="items.length === 0" class="mobile-table-state text-muted">
        {{ emptyText }}
      </div>
      <article v-else v-for="item in items" :key="item[itemKey]" class="mobile-table-card">
        <div
          v-for="col in columns"
          :key="col.key"
          class="mobile-table-row"
          :class="{ 'mobile-table-actions': col.key === 'actions' }"
        >
          <span class="mobile-table-label">{{ col.label }}</span>
          <div class="mobile-table-value" :class="col.class || ''">
            <slot :name="`cell-${col.key}`" :item="item">
              {{ item[col.key] }}
            </slot>
          </div>
        </div>
      </article>
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

.mobile-table-list {
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f5f6f6;
}

.mobile-table-card {
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid #d5d9d9;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}

.mobile-table-row {
  display: grid;
  grid-template-columns: minmax(5.25rem, 34%) minmax(0, 1fr);
  align-items: start;
  gap: 0.5rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #edf0f0;
  text-align: left;
}

.mobile-table-row:last-child {
  border-bottom: 0;
}

.mobile-table-label {
  color: #5b6268;
  font-size: 0.75rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.mobile-table-value {
  min-width: 0;
  overflow-wrap: anywhere;
}

.mobile-table-value :deep(img) {
  max-width: 100%;
}

.mobile-table-value :deep(.d-flex) {
  flex-wrap: wrap;
}

.mobile-table-actions {
  grid-template-columns: 1fr;
  padding-top: 0.75rem;
}

.mobile-table-actions .mobile-table-label {
  display: none;
}

.mobile-table-actions .mobile-table-value :deep(.btn) {
  max-width: 100%;
}

.mobile-table-state {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
}
</style>
