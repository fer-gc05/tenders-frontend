<script setup lang="ts">
/**
 * Vista de detalle de oferta.
 *
 * Muestra la información completa de una oferta organizada en pestañas: Información general, Cronograma y Documentos.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { toApiError } from '@/api/api'

import TenderStatus from '../components/TenderStatus.vue'
import { getTender, resolveDownloadUrl } from '../services/tenders'
import type { TenderDetail } from '../types/tender'
import { formatBudget, formatDate, formatTime, formatTimestamp } from '../utils/format'

// Identificador de la oferta a mostrar, recibido como parámetro de ruta
const props = defineProps<{
  id: string
}>()

// Ruta actual para leer parámetros de consulta (created, updated)
const route = useRoute()

// Datos de la oferta cargados desde el backend
const tender = ref<TenderDetail | null>(null)

// Indica si la oferta está cargándose
const loading = ref(true)

// Mensaje de error si falla la carga
const error = ref('')

// Mensaje de éxito mostrado tras crear o editar una oferta (parámetros de consulta)
const successMessage = computed(() => {
  if (route.query.created === '1') {
    return 'La oferta fue creada correctamente.'
  }

  if (route.query.updated === '1') {
    return 'La oferta fue actualizada correctamente.'
  }

  return ''
})

// Carga los datos de la oferta desde el backend
async function loadTender(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    tender.value = await getTender(Number(props.id))
  } catch (requestError) {
    tender.value = null
    error.value = toApiError(requestError).message
  } finally {
    loading.value = false
  }
}

// Formatea el tamaño de un archivo en KB o MB según su magnitud
function formatFileSize(size?: number | null): string {
  if (typeof size !== 'number') {
    return 'Tamaño no disponible'
  }

  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// Carga la oferta al montar la vista
onMounted(loadTender)

// Vuelve a cargar la oferta si cambia el ID de la ruta
watch(
  () => props.id,
  (nextId, previousId) => {
    if (nextId !== previousId) {
      void loadTender()
    }
  },
)
</script>

<template>
  <div>
    <div
      v-if="loading"
      class="content-card loading-state"
      role="status"
    >
      <span
        class="spinner-border mb-3"
        aria-hidden="true"
      />
      <p class="mb-0">
        Cargando el detalle de la oferta...
      </p>
    </div>

    <div
      v-else-if="error"
      class="content-card error-state"
      role="alert"
    >
      <h1 class="h3">
        No fue posible cargar la oferta
      </h1>
      <p class="text-secondary">
        {{ error }}
      </p>
      <div class="d-flex justify-content-center gap-2">
        <RouterLink
          class="btn btn-outline-secondary"
          to="/tenders"
        >
          Volver
        </RouterLink>
        <button
          type="button"
          class="btn btn-primary"
          @click="loadTender"
        >
          Reintentar
        </button>
      </div>
    </div>

    <template v-else-if="tender">
      <div
        v-if="successMessage"
        class="alert alert-success"
        role="status"
      >
        {{ successMessage }}
      </div>

      <header class="page-header">
        <div>
          <p class="text-secondary mb-1">
            <RouterLink to="/tenders">
              Licitaciones
            </RouterLink> / Detalle
          </p>
          <h1 class="page-title">
            {{ tender.subject }}
          </h1>
          <p class="page-subtitle d-flex flex-wrap align-items-center gap-2">
            <span>{{ tender.consecutive_code }}</span>
            <TenderStatus :status="tender.status" />
          </p>
        </div>

        <div class="page-actions">
          <RouterLink
            class="btn btn-outline-secondary"
            to="/tenders"
          >
            Volver
          </RouterLink>
          <RouterLink
            class="btn btn-primary"
            :to="{ name: 'tender-edit', params: { id: tender.id } }"
          >
            Editar
          </RouterLink>
        </div>
      </header>

      <section
        class="content-card"
        aria-label="Detalle de la oferta"
      >
        <div class="content-card-header">
          <ul
            class="nav nav-tabs card-header-tabs tabs-border"
            role="tablist"
          >
            <li
              class="nav-item"
              role="presentation"
            >
              <button
                id="general-tab"
                class="nav-link active"
                type="button"
                role="tab"
                aria-controls="general-tab-panel"
                aria-selected="true"
                data-bs-toggle="tab"
                data-bs-target="#general-tab-panel"
              >
                Información general
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
            >
              <button
                id="schedule-tab"
                class="nav-link"
                type="button"
                role="tab"
                aria-controls="schedule-tab-panel"
                aria-selected="false"
                data-bs-toggle="tab"
                data-bs-target="#schedule-tab-panel"
              >
                Cronograma
              </button>
            </li>
            <li
              class="nav-item"
              role="presentation"
            >
              <button
                id="documents-tab"
                class="nav-link"
                type="button"
                role="tab"
                aria-controls="documents-tab-panel"
                aria-selected="false"
                data-bs-toggle="tab"
                data-bs-target="#documents-tab-panel"
              >
                Documentos
              </button>
            </li>
          </ul>
        </div>

        <div class="tab-content content-card-body">
          <section
            id="general-tab-panel"
            class="tab-pane fade show active"
            role="tabpanel"
            aria-labelledby="general-tab"
            tabindex="0"
          >
            <div class="detail-grid">
              <div class="detail-item-full">
                <p class="detail-label">
                  Objeto
                </p>
                <p class="detail-value mb-0">
                  {{ tender.subject }}
                </p>
              </div>
              <div class="detail-item-full">
                <p class="detail-label">
                  Descripción / alcance
                </p>
                <p class="mb-0">
                  {{ tender.description }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Moneda
                </p>
                <p class="detail-value mb-0">
                  {{ tender.currency }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Presupuesto
                </p>
                <p class="detail-value mb-0">
                  {{ formatBudget(tender.budget, tender.currency) }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Actividad
                </p>
                <p class="detail-value mb-0">
                  <template v-if="tender.activity">
                    <RouterLink
                      :to="{ name: 'activity-detail', params: { id: tender.activity.id } }"
                    >
                      {{ tender.activity.product_code }} — {{ tender.activity.product_name }}
                    </RouterLink>
                  </template>
                  <template v-else>
                    No disponible
                  </template>
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Estado
                </p>
                <TenderStatus :status="tender.status" />
              </div>
              <div
                v-if="tender.activity"
                class="detail-item-full"
              >
                <p class="detail-label">
                  Clasificación de la actividad
                </p>
                <p class="mb-0">
                  {{ tender.activity.segment_name }} · {{ tender.activity.family_name }} · {{ tender.activity.class_name }}
                </p>
              </div>
            </div>
          </section>

          <section
            id="schedule-tab-panel"
            class="tab-pane fade"
            role="tabpanel"
            aria-labelledby="schedule-tab"
            tabindex="0"
          >
            <div class="detail-grid">
              <div class="detail-item">
                <p class="detail-label">
                  Fecha de inicio
                </p>
                <p class="detail-value mb-0">
                  {{ formatDate(tender.start_date) }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Hora de inicio
                </p>
                <p class="detail-value mb-0">
                  {{ formatTime(tender.start_time) }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Fecha de cierre
                </p>
                <p class="detail-value mb-0">
                  {{ formatDate(tender.close_date) }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Hora de cierre
                </p>
                <p class="detail-value mb-0">
                  {{ formatTime(tender.close_time) }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Creada
                </p>
                <p class="detail-value mb-0">
                  {{ formatTimestamp(tender.created_at) }}
                </p>
              </div>
              <div class="detail-item">
                <p class="detail-label">
                  Actualizada
                </p>
                <p class="detail-value mb-0">
                  {{ formatTimestamp(tender.updated_at) }}
                </p>
              </div>
            </div>
          </section>

          <section
            id="documents-tab-panel"
            class="tab-pane fade"
            role="tabpanel"
            aria-labelledby="documents-tab"
            tabindex="0"
          >
            <div
              v-if="tender.documents.length"
              class="document-list"
            >
              <article
                v-for="document in tender.documents"
                :key="document.id"
                class="document-item"
              >
                <div
                  class="document-icon"
                  aria-hidden="true"
                >
                  DOC
                </div>
                <div>
                  <h2 class="document-title">
                    {{ document.title }}
                  </h2>
                  <p
                    v-if="document.description"
                    class="document-meta"
                  >
                    {{ document.description }}
                  </p>
                  <p class="document-meta">
                    {{ formatFileSize(document.size) }}
                    <span v-if="document.extension"> · {{ document.extension.toUpperCase() }}</span>
                    <span v-if="document.document_date || document.created_at">
                      · {{ (document.document_date || document.created_at || '').slice(0, 10) }}
                    </span>
                    <span v-if="document.extra_data"> · {{ document.extra_data }}</span>
                  </p>
                </div>
                <a
                  class="btn btn-outline-primary btn-sm"
                  :href="resolveDownloadUrl(document.download_url)"
                  download
                >Descargar</a>
              </article>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <div
                class="empty-state-icon"
                aria-hidden="true"
              >
                0
              </div>
              <h2 class="h5">
                No hay documentos registrados
              </h2>
              <p class="text-secondary mb-0">
                Esta oferta no tiene documentos relacionados.
              </p>
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>
