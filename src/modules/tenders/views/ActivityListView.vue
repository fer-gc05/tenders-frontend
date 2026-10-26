<script setup lang="ts">
/**
 * Vista de listado de actividades.
 *
 * Renderiza el catálogo de actividades con buscador y enlace al detalle de cada actividad.
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

import { toApiError } from '@/api/api'

import { listActivities } from '../services/activities'
import type { Activity } from '../types/tender'

// Filtros de búsqueda: solo campo de texto
const filters = reactive<{ search: string }>({
  search: '',
})

// Lista de actividades obtenida del backend
const activities = ref<Activity[]>([])

// Indica si las actividades están cargando
const loading = ref(false)

// Mensaje de error si falla la carga
const error = ref('')

// Texto del buscador que el usuario escribe (aún no aplicado)
const searchDraft = ref('')

// Temporizador para aplicar el buscador con debounce
let searchTimeout: ReturnType<typeof setTimeout> | undefined

// Secuencia de solicitud para evitar condiciones de carrera
let requestSequence = 0

// Indica si hay resultados para mostrar
const hasResults = computed(() => activities.value.length > 0)

// Indica si el usuario está escribiendo un filtro de búsqueda
const isFiltering = computed(() => filters.search.trim().length > 0)

// Carga las actividades desde el backend aplicando el filtro de búsqueda
async function loadActivities(): Promise<void> {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''

  try {
    const items = await listActivities(filters.search)

    // Si la solicitud ya no es la más reciente, ignora el resultado
    if (sequence !== requestSequence) {
      return
    }

    activities.value = items
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

// Maneja la escritura en el buscador con debounce de 350ms
function handleSearchInput(): void {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.search = searchDraft.value.trim()
    void loadActivities()
  }, 350)
}

// Limpia el buscador y vuelve a cargar el listado completo
function clearSearch(): void {
  clearTimeout(searchTimeout)
  searchDraft.value = ''
  filters.search = ''
  void loadActivities()
}

onMounted(loadActivities)

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1 class="page-title">
          Actividades
        </h1>
        <p class="page-subtitle">
          Catálogo de bienes y servicios disponibles para licitar.
        </p>
      </div>
    </header>

    <section
      class="search-panel mb-3"
      aria-label="Filtros de actividades"
    >
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-8">
          <label
            for="activity-search"
            class="form-label"
          >Buscar</label>
          <input
            id="activity-search"
            v-model="searchDraft"
            class="form-control"
            type="search"
            placeholder="Código, producto, segmento, familia o clase"
            autocomplete="off"
            @input="handleSearchInput"
          >
        </div>
        <div class="col-12 col-lg-4">
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
        @click="loadActivities"
      >
        Reintentar
      </button>
    </div>

    <section
      class="content-card table-card"
      aria-labelledby="activity-list-heading"
    >
      <div class="content-card-header">
        <h2
          id="activity-list-heading"
          class="section-title"
        >
          Catálogo de actividades
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
          Cargando actividades...
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
          No se encontraron actividades
        </h3>
        <p class="text-secondary mb-0">
          {{ isFiltering ? 'Ajusta los filtros e intenta nuevamente.' : 'No hay actividades registradas.' }}
        </p>
      </div>

      <template v-else>
        <div class="table-responsive">
          <table class="table app-table tender-table">
            <caption class="visually-hidden">
              Catálogo de actividades
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  Código producto
                </th>
                <th scope="col">
                  Producto
                </th>
                <th scope="col">
                  Segmento
                </th>
                <th scope="col">
                  Familia
                </th>
                <th scope="col">
                  Clase
                </th>
                <th scope="col">
                  <span class="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="activity in activities"
                :key="activity.id"
              >
                <td
                  class="fw-semibold"
                  data-label="Código producto"
                >
                  {{ activity.product_code }}
                </td>
                <td data-label="Producto">
                  <RouterLink
                    class="table-primary-text"
                    :to="{ name: 'activity-detail', params: { id: activity.id } }"
                  >
                    {{ activity.product_name }}
                  </RouterLink>
                </td>
                <td data-label="Segmento">
                  {{ activity.segment_name }}
                </td>
                <td data-label="Familia">
                  {{ activity.family_name }}
                </td>
                <td data-label="Clase">
                  {{ activity.class_name }}
                </td>
                <td
                  data-label="Acciones"
                  class="text-end"
                >
                  <RouterLink
                    class="btn btn-outline-primary btn-sm w-100 w-md-auto"
                    :to="{ name: 'activity-detail', params: { id: activity.id } }"
                  >
                    Ver detalle
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>
