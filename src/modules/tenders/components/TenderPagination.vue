<script setup lang="ts">
/**
 * Componente de paginación para listados de ofertas.
 *
 * Renderiza controles de paginación (anterior, páginas intermedias, siguiente) y emite el evento page-change al cambiar de página.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  lastPage: number
  total: number
  perPage: number
}>()

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const start = Math.max(1, props.currentPage - 2)
  const end = Math.min(props.lastPage, start + 4)
  const adjustedStart = Math.max(1, end - 4)
  const pages: number[] = []

  for (let page = adjustedStart; page <= end; page += 1) {
    pages.push(page)
  }

  return pages
})

const from = computed(() => (props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1))
const to = computed(() => Math.min(props.currentPage * props.perPage, props.total))

function changePage(page: number): void {
  if (page >= 1 && page <= props.lastPage && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<template>
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3">
    <p class="pagination-summary mb-0">
      Mostrando {{ from }}–{{ to }} de {{ total }} resultados
    </p>

    <nav aria-label="Paginación de ofertas">
      <ul class="pagination mb-0">
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
        >
          <button
            class="page-link"
            type="button"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Anterior
          </button>
        </li>
        <li
          v-for="page in visiblePages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button
            class="page-link"
            type="button"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === lastPage }"
        >
          <button
            class="page-link"
            type="button"
            :disabled="currentPage === lastPage"
            @click="changePage(currentPage + 1)"
          >
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
