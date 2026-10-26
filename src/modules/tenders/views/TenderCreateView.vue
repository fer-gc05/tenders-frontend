<script setup lang="ts">
/**
 * Vista de creación de oferta.
 *
 * Permite crear una nueva oferta con su información básica, cronograma y documentos opcionales.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { toApiError } from '@/api/api'

import TenderDocuments from '../components/TenderDocuments.vue'
import TenderForm from '../components/TenderForm.vue'
import { useActivities } from '../composables/useActivities'
import { useTenderValidation } from '../composables/useTenderValidation'
import { createTender } from '../services/tenders'
import type {
  DocumentFormValues,
  TenderErrors,
  TenderField,
  TenderFormValues,
} from '../types/tender'

// Instancia del enrutador para navegar entre vistas
const router = useRouter()

// Valores reactivos del formulario de creación, inicializados vacíos
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

// Documentos nuevos seleccionados por el usuario (aún no enviados al backend)
const newDocuments = ref<DocumentFormValues[]>([])

// Indica si el formulario está enviándose al backend
const submitting = ref(false)

// Mensaje de error de la API, si ocurre uno al crear la oferta
const requestError = ref('')

// Calcula los errores visibles para mostrar en el formulario
// Solo muestra los errores de campos que el usuario ha tocado o que el servidor devolvió
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

// Maneja el envío del formulario de creación de oferta
async function submit(): Promise<void> {
  // Marca todos los campos como tocados para mostrar errores de validación
  validation.markAllTouched()

  // Si el formulario no es válido o ya se está enviando, no hacer nada
  if (!validation.isValid.value || submitting.value) {
    return
  }

  submitting.value = true
  requestError.value = ''

  try {
    // Envía los datos del formulario y documentos al backend
    const tender = await createTender(values.value, newDocuments.value)

    // Redirige a la vista de detalle de la oferta creada
    await router.push({
      name: 'tender-detail',
      params: { id: tender.id },
      query: { created: '1' },
    })
  } catch (error) {
    const apiError = toApiError(error)

    if (apiError.errors) {
      validation.setServerErrors(apiError.errors)
    } else {
      requestError.value = apiError.message
    }
  } finally {
    submitting.value = false
  }
}

function cancel(): void {
  void router.push({ name: 'tenders' })
}
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <p class="text-secondary mb-1">
          <RouterLink to="/tenders">
            Ofertas
          </RouterLink> / Creación
        </p>
        <h1 class="page-title">
          Crear oferta
        </h1>
        <p class="page-subtitle">
          Registra la información básica y el cronograma de la nueva oferta.
        </p>
      </div>
    </header>

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
      :is-valid="validation.isValid.value"
      :submitting="submitting"
      submit-label="Guardar licitación"
      @submit="submit"
      @cancel="cancel"
      @touch="validation.touch"
      @retry-activities="loadActivities"
    />

    <TenderDocuments
      v-model:new-documents="newDocuments"
      :documents="[]"
      :required="false"
    />
  </div>
</template>
