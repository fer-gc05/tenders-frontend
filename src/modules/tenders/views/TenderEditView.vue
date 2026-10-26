<script setup lang="ts">
/**
 * Vista de edición de oferta.
 *
 * Permite editar los datos de una oferta existente y gestionar sus documentos asociados (agregar y eliminar).
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { toApiError } from '@/api/api'

import TenderDocuments from '../components/TenderDocuments.vue'
import TenderForm from '../components/TenderForm.vue'
import { useActivities } from '../composables/useActivities'
import { useTenderValidation } from '../composables/useTenderValidation'
import { deleteDocument, getTender, updateTender } from '../services/tenders'
import type {
  DocumentFormValues,
  TenderDocument,
  TenderErrors,
  TenderField,
  TenderFormValues,
} from '../types/tender'

// Identificador de la oferta a editar, recibido como parámetro de ruta
const props = defineProps<{
  id: string
}>()

// Instancia del enrutador para navegar entre vistas
const router = useRouter()

// Valores reactivos del formulario de edición, inicializados vacíos
const values = ref<TenderFormValues>({
  subject: '',
  description: '',
  currency: '',
  budget: '',
  activity_id: null,
  start_date: '',
  start_time: '',
  close_date: '',
  close_time: '',
})

// Instancia del composable de validación para el formulario
const validation = useTenderValidation(values)

// Estado del catálogo de actividades: lista, carga, error y función de recarga
const {
  activities,
  loading: activitiesLoading,
  error: activitiesError,
  loadActivities,
} = useActivities()

// Documentos existentes de la oferta (cargados desde el backend)
const documents = ref<TenderDocument[]>([])

// Documentos nuevos seleccionados por el usuario (aún no enviados al backend)
const newDocuments = ref<DocumentFormValues[]>([])

// Indica si la oferta está cargándose desde el backend
const loading = ref(true)

// Indica si el formulario está enviándose al backend
const submitting = ref(false)

// Mensaje de error si falla la carga de la oferta
const pageError = ref('')

// Mensaje de error si falla el envío de la oferta
const requestError = ref('')

// Mensaje de error si falla la validación de documentos
const documentError = ref('')

// Calcula los errores visibles para mostrar en el formulario
const visibleErrors = computed<TenderErrors>(() => {
  const errors: TenderErrors = {}

  for (const [field, message] of Object.entries(validation.errors.value)) {
    const tenderField = field as TenderField
    if (validation.shouldShowError(tenderField)) {
      errors[tenderField] = message
    }
  }

  return errors
})

// Indica si hay al menos un documento (existente o nuevo)
const hasDocuments = computed(() => documents.value.length + newDocuments.value.length > 0)

// Indica si el formulario es válido y tiene al menos un documento
const canSubmit = computed(() => validation.isValid.value && hasDocuments.value)

// Carga los datos de la oferta desde el backend al iniciar la vista
async function loadTender(): Promise<void> {
  loading.value = true
  pageError.value = ''

  try {
    const tender = await getTender(Number(props.id))

    // Rellena el formulario con los datos de la oferta existente
    values.value = {
      subject: tender.subject,
      description: tender.description,
      currency: tender.currency,
      budget: tender.budget,
      activity_id: tender.activity_id,
      start_date: tender.start_date,
      start_time: tender.start_time.slice(0, 5),
      close_date: tender.close_date,
      close_time: tender.close_time.slice(0, 5),
    }

    // Carga los documentos existentes de la oferta
    documents.value = tender.documents

    // Limpia errores de validación previos
    validation.clearErrors()
  } catch (error) {
    pageError.value = toApiError(error).message
  } finally {
    loading.value = false
  }
}

async function submit(): Promise<void> {
  validation.markAllTouched()
  documentError.value = hasDocuments.value ? '' : 'Registre al menos un documento.'

  if (!validation.isValid.value || !hasDocuments.value || submitting.value) {
    return
  }

  submitting.value = true
  requestError.value = ''

  try {
    await updateTender(Number(props.id), values.value, newDocuments.value)
    await router.push({
      name: 'tender-detail',
      params: { id: props.id },
      query: { updated: '1' },
    })
  } catch (error) {
    const apiError = toApiError(error)

    if (apiError.errors) {
      validation.setServerErrors(apiError.errors)

      if (apiError.errors.documents?.length) {
        documentError.value = 'Revise los documentos relacionados con la oferta.'
      } else {
        requestError.value = apiError.message
      }
    } else {
      requestError.value = apiError.message
    }
  } finally {
    submitting.value = false
  }
}

async function deleteExistingDocument(documentId: number): Promise<void> {
  if (!confirm('¿Eliminar este documento permanentemente?')) {
    return
  }

  try {
    await deleteDocument(Number(props.id), documentId)
    documents.value = documents.value.filter(
      (d) => d.id !== documentId,
    )
  } catch (error) {
    const apiError = toApiError(error)
    pageError.value =
      apiError.message || 'No se pudo eliminar el documento.'
  }
}

function cancel(): void {
  void router.push({ name: 'tender-detail', params: { id: props.id } })
}

onMounted(loadTender)
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <p class="text-secondary mb-1">
          <RouterLink to="/tenders">
            Ofertas
          </RouterLink> /
          <RouterLink :to="{ name: 'tender-detail', params: { id } }">
            Detalle
          </RouterLink> / Edición
        </p>
        <h1 class="page-title">
          Editar oferta
        </h1>
        <p class="page-subtitle">
          Actualiza la información, el cronograma y los documentos relacionados.
        </p>
      </div>
    </header>

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
        Cargando la información de la oferta...
      </p>
    </div>

    <div
      v-else-if="pageError"
      class="content-card error-state"
      role="alert"
    >
      <h2 class="h4">
        No fue posible cargar la oferta
      </h2>
      <p class="text-secondary">
        {{ pageError }}
      </p>
      <button
        type="button"
        class="btn btn-primary"
        @click="loadTender"
      >
        Reintentar
      </button>
    </div>

    <template v-else>
      <div
        v-if="requestError"
        class="alert alert-danger"
        role="alert"
      >
        {{ requestError }}
      </div>

      <TenderForm
        v-model:values="values"
        :activities="activities"
        :activities-loading="activitiesLoading"
        :activities-error="activitiesError"
        :errors="visibleErrors"
        :is-valid="canSubmit"
        :submitting="submitting"
        submit-label="Guardar cambios"
        :show-actions="false"
        @submit="submit"
        @cancel="cancel"
        @touch="validation.touch"
        @retry-activities="loadActivities"
      />

      <div
        v-if="documentError"
        class="alert alert-warning mt-3"
        role="alert"
      >
        {{ documentError }}
      </div>

      <TenderDocuments
        v-model:new-documents="newDocuments"
        :documents="documents"
        @delete-document="deleteExistingDocument"
      />

      <div class="content-card mt-3">
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!canSubmit || submitting || activitiesLoading || Boolean(activitiesError)"
            @click="submit"
          >
            <span
              v-if="submitting"
              class="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            />
            {{ submitting ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
