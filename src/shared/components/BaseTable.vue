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
      <table class="table table-hover align-middle m-0 responsive-data-table">
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

@media (min-width: 768px) and (max-width: 1399.98px) {
  .responsive-data-table {
    width: 100%;
    table-layout: fixed;
    font-size: 0.78rem;
  }

  .responsive-data-table :deep(th),
  .responsive-data-table :deep(td) {
    padding: 0.45rem 0.35rem !important;
    line-height: 1.25;
    overflow-wrap: anywhere;
    vertical-align: middle;
  }

  .responsive-data-table :deep(th) {
    font-size: 0.72rem;
  }

  .responsive-data-table :deep(.text-nowrap) {
    white-space: normal !important;
  }

  .responsive-data-table :deep(.fs-4) {
    font-size: 0.95rem !important;
  }

  .responsive-data-table :deep(.fs-5) {
    font-size: 0.85rem !important;
  }

  .responsive-data-table :deep(.fs-6) {
    font-size: 0.78rem !important;
  }

  .responsive-data-table :deep(.badge) {
    padding: 0.3rem 0.4rem !important;
    font-size: 0.65rem !important;
    white-space:normal;
  }

  .responsive-data-table :deep(.btn) {
    max-width: 100%;
    margin: 0.1rem !important;
    padding: 0.3rem 0.4rem !important;
    font-size: 0.66rem !important;
    line-height: 1.15;
    white-space: normal;
  }

  .responsive-data-table :deep(.d-flex) {
    flex-wrap: wrap;
    gap: 0.25rem !important;
  }

  .responsive-data-table :deep(img) {
    max-width: 40px;
    max-height: 40px;
    object-fit: contain;
  }
}

.mobile-table-list {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f5f6f6;
}

.mobile-table-card {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.1rem 0.65rem;
  padding: 0.5rem;
  border: 1px solid #d5d9d9;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}

.mobile-table-row {
  min-width: 0;
  padding: 0.3rem 0;
  text-align: left;
}

.mobile-table-row:last-child {
  border-bottom: 0;
}

.mobile-table-label {
  display: block;
  margin-bottom: 0.1rem;
  color: #5b6268;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.mobile-table-value {
  min-width: 0;
  font-size: 0.78rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.mobile-table-value :deep(img) {
  max-width: 48px;
  max-height: 48px;
  object-fit: contain;
}

.mobile-table-value :deep(.d-flex) {
  flex-wrap: wrap;
}

.mobile-table-actions {
  grid-column: 1 / -1;
  border-top: 1px solid #edf0f0;
  padding-top: 0.45rem;
}

.mobile-table-actions .mobile-table-label {
  display: none;
}

.mobile-table-actions .mobile-table-value :deep(.btn) {
  max-width: 100%;
  margin: 0.1rem !important;
  padding: 0.35rem 0.45rem !important;
  font-size: 0.68rem !important;
  line-height: 1.15;
  white-space: normal;
}

.mobile-table-value :deep(.fs-4) {
  font-size: 0.9rem !important;
}

.mobile-table-value :deep(.fs-5) {
  font-size: 0.82rem !important;
}

.mobile-table-value :deep(.fs-6) {
  font-size: 0.75rem !important;
}

.mobile-table-state {
  padding: 1.25rem 0.75rem;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
}

@media (max-width: 360px) {
  .mobile-table-card {
    gap: 0.05rem 0.4rem;
    padding: 0.4rem;
  }

  .mobile-table-label {
    font-size: 0.6rem;
  }

  .mobile-table-value {
    font-size: 0.72rem;
  }
}
</style>
