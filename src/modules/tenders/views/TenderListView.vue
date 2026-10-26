<script setup lang="ts">
/**
 * Vista de listado de ofertas.
 *
 * Renderiza la tabla de ofertas con filtros de búsqueda, paginación y exportación a Excel.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { toApiError } from '@/api/api'

import TenderPagination from '../components/TenderPagination.vue'
import TenderStatus from '../components/TenderStatus.vue'
import { exportTenders, listTenders } from '../services/tenders'
import type { Tender, TenderFilters, TenderPage } from '../types/tender'
import { formatDate } from '../utils/format'

// Filtros de búsqueda: texto de búsqueda, página actual y cantidad por página
const filters = reactive<TenderFilters>({
  search: '',
  page: 1,
  per_page: 15,
})

// Lista de ofertas obtenida del backend
const tenders = ref<Tender[]>([])

// Metadatos de paginación: total, página actual, cantidad por página, última página
const meta = reactive({
  total: 0,
  current_page: 1,
  per_page: 15,
  last_page: 1,
})

// Indica si el listado está cargando datos
const loading = ref(false)

// Mensaje de error si falla la carga o la exportación
const error = ref('')

// Indica si se está exportando el reporte de Excel
const exporting = ref(false)

// Texto del buscador que el usuario escribe (aún no aplicado)
const searchDraft = ref('')

// Temporizador para aplicar el buscador con debounce
let searchTimeout: ReturnType<typeof setTimeout> | undefined

// Secuencia de solicitud para evitar condiciones de carrera en búsquedas rápidas
let requestSequence = 0

// Indica si hay resultados para mostrar
const hasResults = computed(() => tenders.value.length > 0)

// Indica si el usuario está escribiendo un filtro de búsqueda
const isFiltering = computed(() => filters.search.trim().length > 0)

// Carga las ofertas desde el backend aplicando los filtros actuales
async function loadTenders(): Promise<void> {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''

  try {
    const page: TenderPage = await listTenders(filters)

    // Si la solicitud ya no es la más reciente, ignora el resultado (evita condiciones de carrera)
    if (sequence !== requestSequence) {
      return
    }

    tenders.value = page.data
    meta.total = page.meta.total
    meta.current_page = page.meta.current_page
    meta.per_page = page.meta.per_page
    meta.last_page = page.meta.last_page
  } catch (requestError) {
    if (sequence === requestSequence) {
      error.value = toApiError(requestError).message
    }
  } finally {
    if (sequence === requestSequence) {
      loading.value = false
    }
  }
}

// Maneja la escritura en el buscador con debounce de 350ms para no saturar la API
function handleSearchInput(): void {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.search = searchDraft.value.trim()
    filters.page = 1
    void loadTenders()
  }, 350)
}

// Limpia el buscador y vuelve a cargar el listado completo
function clearSearch(): void {
  clearTimeout(searchTimeout)
  searchDraft.value = ''
  filters.search = ''
  filters.page = 1
  void loadTenders()
}

// Cambia la página actual y vuelve a cargar el listado
function changePage(page: number): void {
  filters.page = page
  void loadTenders()
}

// Descarga el reporte de Excel generado por el backend con los filtros actuales
async function downloadReport(): Promise<void> {
  if (exporting.value) {
    return
  }

  exporting.value = true
  error.value = ''

  try {
    const report = await exportTenders(filters)
    const downloadUrl = URL.createObjectURL(report.blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = report.filename
    link.click()
    URL.revokeObjectURL(downloadUrl)
  } catch (requestError) {
    error.value = toApiError(requestError).message
  } finally {
    exporting.value = false
  }
}

// Carga las ofertas al montar la vista
onMounted(loadTenders)

// Limpia el temporizador de búsqueda al desmontar la vista
onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1 class="page-title">
          Licitaciones
        </h1>
        <p class="page-subtitle">
          Consulta, filtra y exporta las licitaciones registradas.
        </p>
      </div>

      <div class="page-actions">
        <button
          type="button"
          class="btn btn-outline-primary"
          :disabled="exporting"
          @click="downloadReport"
        >
          <span
            v-if="exporting"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
          {{ exporting ? 'Exportando...' : 'Exportar Excel' }}
        </button>
        <RouterLink
          class="btn btn-primary"
          to="/tenders/new"
        >
          Nueva oferta
        </RouterLink>
      </div>
    </header>

    <section
      class="search-panel mb-3"
      aria-label="Filtros del listado"
    >
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-9">
          <label
            for="tender-search"
            class="form-label"
          >Buscar</label>
          <input
            id="tender-search"
            v-model="searchDraft"
            class="form-control"
            type="search"
            placeholder="Consecutivo, objeto o descripción"
            autocomplete="off"
            @input="handleSearchInput"
          >
        </div>
        <div class="col-12 col-lg-3">
          <button
            type="button"
            class="btn btn-outline-secondary w-100"
            :disabled="!isFiltering && !searchDraft"
            @click="clearSearch"
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>

    <div
      v-if="error"
      class="alert alert-danger"
      role="alert"
    >
      {{ error }}
      <button
        type="button"
        class="btn btn-link btn-sm"
        @click="loadTenders"
      >
        Reintentar
      </button>
    </div>

    <section
      class="content-card table-card"
      aria-labelledby="tender-list-heading"
    >
      <div class="content-card-header">
        <h2
          id="tender-list-heading"
          class="section-title"
        >
          Listado de ofertas
        </h2>
      </div>

      <div
        v-if="loading"
        class="loading-state"
        role="status"
      >
        <span
          class="spinner-border mb-3"
          aria-hidden="true"
        />
        <p class="mb-0">
          Cargando ofertas...
        </p>
      </div>

      <div
        v-else-if="!hasResults"
        class="empty-state"
      >
        <div
          class="empty-state-icon"
          aria-hidden="true"
        >
          0
        </div>
        <h3 class="h5">
          No se encontraron ofertas
        </h3>
        <p class="text-secondary mb-0">
          {{ isFiltering ? 'Ajusta los filtros e intenta nuevamente.' : 'Registra la primera oferta.' }}
        </p>
      </div>

      <template v-else>
        <div class="table-responsive">
          <table class="table app-table tender-table">
            <caption class="visually-hidden">
              Listado de ofertas registradas
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  Consecutivo
                </th>
                <th scope="col">
                  Objeto
                </th>
                <th scope="col">
                  Descripción
                </th>
                <th scope="col">
                  Fecha de inicio
                </th>
                <th scope="col">
                  Fecha de cierre
                </th>
                <th scope="col">
                  Estado
                </th>
                <th scope="col">
                  <span class="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tender in tenders"
                :key="tender.id"
              >
                <td
                  class="fw-semibold"
                  data-label="Consecutivo"
                >
                  {{ tender.consecutive_code }}
                </td>
                <td data-label="Objeto">
                  <div class="table-primary-text">
                    {{ tender.subject }}
                  </div>
                </td>
                <td data-label="Descripción">
                  <div class="table-secondary-text">
                    {{ tender.description }}
                  </div>
                </td>
                <td data-label="Fecha de inicio">
                  {{ formatDate(tender.start_date) }}
                </td>
                <td data-label="Fecha de cierre">
                  {{ formatDate(tender.close_date) }}
                </td>
                <td data-label="Estado">
                  <TenderStatus :status="tender.status" />
                </td>
                <td
                  class="text-end"
                  data-label="Acciones"
                >
                  <RouterLink
                    class="btn btn-outline-primary btn-sm w-100 w-md-auto"
                    :to="{ name: 'tender-detail', params: { id: tender.id } }"
                  >
                    Ver detalle
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TenderPagination
          :current-page="meta.current_page"
          :last-page="meta.last_page"
          :total="meta.total"
          :per-page="meta.per_page"
          @page-change="changePage"
        />
      </template>
    </section>
  </div>
</template>
