<script setup lang="ts">
/**
 * Vista de detalle de actividad.
 *
 * Muestra los datos de una actividad del catálogo y las ofertas asociadas a la misma.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { toApiError } from '@/api/api'

import TenderStatus from '../components/TenderStatus.vue'
import { getActivity } from '../services/activities'
import { listTenders } from '../services/tenders'
import type { Activity, Tender } from '../types/tender'
import { formatBudget, formatDate } from '../utils/format'

// Identificador de la actividad a mostrar, recibido como parámetro de ruta
const props = defineProps<{
  id: string
}>()

// Datos de la actividad cargados desde el backend
const activity = ref<Activity | null>(null)

// Ofertas asociadas a esta actividad
const relatedTenders = ref<Tender[]>([])

// Indica si la actividad está cargándose
const loading = ref(true)

// Mensaje de error si falla la carga
const error = ref('')

// Carga los datos de la actividad y sus ofertas asociadas desde el backend
async function loadActivity(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const act = await getActivity(Number(props.id))
    activity.value = act

    // Carga las ofertas asociadas a esta actividad (máximo 5)
    const page = await listTenders({
      search: '',
      page: 1,
      per_page: 5,
      activity_id: act.id,
    })

    relatedTenders.value = page.data
  } catch (requestError) {
    activity.value = null
    error.value = toApiError(requestError).message
  } finally {
    loading.value = false
  }
}

// Carga la actividad al montar la vista
onMounted(loadActivity)

// Vuelve a cargar la actividad si cambia el ID de la ruta
watch(
  () => props.id,
  (nextId, previousId) => {
    if (nextId !== previousId) {
      void loadActivity()
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
        Cargando la actividad...
      </p>
    </div>

    <div
      v-else-if="error"
      class="content-card error-state"
      role="alert"
    >
      <h1 class="h3">
        No fue posible cargar la actividad
      </h1>
      <p class="text-secondary">
        {{ error }}
      </p>
      <div class="d-flex justify-content-center gap-2">
        <RouterLink
          class="btn btn-outline-secondary"
          to="/tenders"
        >
          Volver a ofertas
        </RouterLink>
        <button
          type="button"
          class="btn btn-primary"
          @click="loadActivity"
        >
          Reintentar
        </button>
      </div>
    </div>

    <template v-else-if="activity">
      <header class="page-header">
        <div>
          <p class="text-secondary mb-1">
            <RouterLink to="/tenders">
              Ofertas
            </RouterLink> / Actividad
          </p>
          <h1 class="page-title">
            {{ activity.product_name }}
          </h1>
          <p class="page-subtitle">
            {{ activity.product_code }}
          </p>
        </div>

        <div class="page-actions">
          <RouterLink
            class="btn btn-outline-secondary"
            to="/tenders"
          >
            Volver a ofertas
          </RouterLink>
        </div>
      </header>

      <section
        class="content-card"
        aria-label="Detalle de la actividad"
      >
        <div class="content-card-body">
          <div class="detail-grid">
            <div class="detail-item-full">
              <p class="detail-label">
                Producto / servicio
              </p>
              <p class="detail-value mb-0">
                {{ activity.product_name }}
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-label">
                Código de producto
              </p>
              <p class="detail-value mb-0">
                {{ activity.product_code }}
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-label">
                Segmento
              </p>
              <p class="detail-value mb-0">
                {{ activity.segment_name }}
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-label">
                Familia
              </p>
              <p class="detail-value mb-0">
                {{ activity.family_name }}
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-label">
                Clase
              </p>
              <p class="detail-value mb-0">
                {{ activity.class_name }}
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-label">
                Creada
              </p>
              <p class="detail-value mb-0">
                {{ formatDate(activity.created_at ?? '') }}
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-label">
                Actualizada
              </p>
              <p class="detail-value mb-0">
                {{ formatDate(activity.updated_at ?? '') }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        class="content-card mt-3"
        aria-label="Ofertas asociadas"
      >
        <div class="content-card-header d-flex flex-column flex-sm-row justify-content-between gap-3">
          <div>
            <h2 class="section-title">
              Ofertas asociadas
            </h2>
            <p class="mb-0 mt-1 text-secondary">
              Licitaciones que usan esta actividad.
            </p>
          </div>
        </div>

        <div class="content-card-body">
          <div
            v-if="relatedTenders.length"
            class="table-responsive"
          >
            <table class="table app-table tender-table">
              <caption class="visually-hidden">
                Ofertas asociadas a la actividad
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
                    Presupuesto
                  </th>
                  <th scope="col">
                    Moneda
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
                  v-for="tender in relatedTenders"
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
                      <RouterLink
                        :to="{ name: 'tender-detail', params: { id: tender.id } }"
                      >
                        {{ tender.subject }}
                      </RouterLink>
                    </div>
                  </td>
                  <td data-label="Presupuesto">
                    {{ formatBudget(tender.budget, tender.currency) }}
                  </td>
                  <td data-label="Moneda">
                    {{ tender.currency }}
                  </td>
                  <td data-label="Estado">
                    <TenderStatus :status="tender.status" />
                  </td>
                  <td
                    data-label="Acciones"
                    class="text-end"
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
            <h3 class="h5">
              No hay ofertas asociadas
            </h3>
            <p class="text-secondary mb-0">
              Esta actividad aún no tiene ofertas registradas.
            </p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
