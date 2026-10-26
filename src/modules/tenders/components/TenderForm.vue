<script setup lang="ts">
/**
 * Componente de formulario de oferta (información básica y cronograma).
 *
 * Renderiza los campos obligatorios de creación y edición de ofertas, gestiona contadores de caracteres, selectores de moneda y actividad, y validaciones cruzadas de fechas y horas.
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

import type {
  Activity,
  Currency,
  TenderErrors,
  TenderField,
  TenderFormValues,
} from '../types/tender'

interface Props {
  values: TenderFormValues
  activities: Activity[]
  errors: TenderErrors
  isValid: boolean
  activitiesLoading?: boolean
  activitiesError?: string
  submitting?: boolean
  submitLabel?: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activitiesLoading: false,
  activitiesError: '',
  submitting: false,
  submitLabel: 'Guardar oferta',
  showActions: true,
})

const emit = defineEmits<{
  'update:values': [value: TenderFormValues]
  submit: []
  cancel: []
  touch: [field: TenderField]
  'retry-activities': []
}>()

// Actualiza un campo del formulario y emite el nuevo valor completo al padre
function updateField<K extends TenderField>(
  field: K,
  value: TenderFormValues[K],
): void {
  emit('update:values', {
    ...props.values,
    [field]: value,
  })
}

// Computed vinculado al campo "objeto" del formulario
const subject = computed({
  get: () => props.values.subject,
  set: (value: string) => updateField('subject', value),
})

// Computed vinculado al campo "descripción" del formulario
const description = computed({
  get: () => props.values.description,
  set: (value: string) => updateField('description', value),
})

// Computed vinculado al campo "moneda" del formulario
const currency = computed({
  get: () => props.values.currency,
  set: (value: Currency | '') => updateField('currency', value),
})

// Computed vinculado al campo "presupuesto" del formulario
const budget = computed({
  get: () => props.values.budget,
  set: (value: string) => updateField('budget', value),
})

// Computed vinculado al campo "actividad" del formulario
const activityId = computed({
  get: () => props.values.activity_id,
  set: (value: number | null) => updateField('activity_id', value),
})

// Computed vinculado al campo "fecha de inicio" del formulario
const startDate = computed({
  get: () => props.values.start_date,
  set: (value: string) => updateField('start_date', value),
})

// Computed vinculado al campo "hora de inicio" del formulario
const startTime = computed({
  get: () => props.values.start_time,
  set: (value: string) => updateField('start_time', value),
})

// Computed vinculado al campo "fecha de cierre" del formulario
const closeDate = computed({
  get: () => props.values.close_date,
  set: (value: string) => updateField('close_date', value),
})

// Computed vinculado al campo "hora de cierre" del formulario
const closeTime = computed({
  get: () => props.values.close_time,
  set: (value: string) => updateField('close_time', value),
})

// Contador de caracteres del objeto
const subjectCount = computed(() => props.values.subject.length)

// Contador de caracteres de la descripción
const descriptionCount = computed(() => props.values.description.length)

// Indica si el selector de actividad debe estar deshabilitado
// Se deshabilita si está cargando, hay error o no hay actividades disponibles
const activityDisabled = computed(
  () =>
    props.activitiesLoading ||
    Boolean(props.activitiesError) ||
    props.activities.length === 0,
)

// Devuelve el ID del elemento HTML de descripción de error para un campo,
// o el ID del hint si no hay error
function describedBy(field: TenderField, hintId: string): string {
  return props.errors[field]
    ? `${hintId} tender-${field}-error`
    : hintId
}

// Emite el evento de envío del formulario al padre
function submitForm(): void {
  emit('submit')
}
</script>

<template>
  <form
    novalidate
    @submit.prevent="submitForm"
  >
    <section
      class="content-card"
      aria-labelledby="basic-information-heading"
    >
      <div class="content-card-header">
        <h2
          id="basic-information-heading"
          class="section-title"
        >
          <span
            class="form-section-number"
            aria-hidden="true"
          >1</span>
          Información básica
        </h2>
      </div>

      <div class="content-card-body">
        <div class="row g-3">
          <div class="col-12">
            <label
              for="tender-subject"
              class="form-label"
            >Objeto <span aria-hidden="true">*</span></label>
            <input
              id="tender-subject"
              v-model="subject"
              class="form-control"
              :class="{ 'is-invalid': errors.subject }"
              type="text"
              maxlength="150"
              autocomplete="off"
              required
              :aria-invalid="Boolean(errors.subject)"
              :aria-describedby="describedBy('subject', 'tender-subject-hint')"
              @blur="emit('touch', 'subject')"
            >
            <div
              id="tender-subject-hint"
              class="form-text d-flex justify-content-between gap-3"
            >
              <span>Describe de forma clara el objeto de la oferta.</span>
              <span
                class="character-count"
                :class="{ 'is-near-limit': subjectCount >= 135 }"
              >{{ subjectCount }}/150</span>
            </div>
            <div
              v-if="errors.subject"
              id="tender-subject-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.subject }}
            </div>
          </div>

          <div class="col-12">
            <label
              for="tender-description"
              class="form-label"
            >Descripción / alcance <span aria-hidden="true">*</span></label>
            <textarea
              id="tender-description"
              v-model="description"
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
              rows="4"
              maxlength="400"
              required
              :aria-invalid="Boolean(errors.description)"
              :aria-describedby="describedBy('description', 'tender-description-hint')"
              @blur="emit('touch', 'description')"
            />
            <div
              id="tender-description-hint"
              class="form-text d-flex justify-content-between gap-3"
            >
              <span>Incluye el alcance y las condiciones principales.</span>
              <span
                class="character-count"
                :class="{ 'is-near-limit': descriptionCount >= 360 }"
              >{{ descriptionCount }}/400</span>
            </div>
            <div
              v-if="errors.description"
              id="tender-description-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.description }}
            </div>
          </div>

          <div class="col-md-4">
            <label
              for="tender-currency"
              class="form-label"
            >Moneda <span aria-hidden="true">*</span></label>
            <select
              id="tender-currency"
              v-model="currency"
              class="form-select"
              :class="{ 'is-invalid': errors.currency }"
              required
              :aria-invalid="Boolean(errors.currency)"
              :aria-describedby="errors.currency ? 'tender-currency-error' : undefined"
              @blur="emit('touch', 'currency')"
            >
              <option value="">
                Seleccione una moneda
              </option>
              <option value="COP">
                COP
              </option>
              <option value="USD">
                USD
              </option>
              <option value="EUR">
                EUR
              </option>
            </select>
            <div
              v-if="errors.currency"
              id="tender-currency-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.currency }}
            </div>
          </div>

          <div class="col-md-4">
            <label
              for="tender-budget"
              class="form-label"
            >Presupuesto <span aria-hidden="true">*</span></label>
            <input
              id="tender-budget"
              v-model="budget"
              class="form-control"
              :class="{ 'is-invalid': errors.budget }"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
              required
              :aria-invalid="Boolean(errors.budget)"
              :aria-describedby="describedBy('budget', 'tender-budget-hint')"
              @blur="emit('touch', 'budget')"
            >
            <div
              id="tender-budget-hint"
              class="form-text"
            >
              Use punto decimal y máximo dos decimales.
            </div>
            <div
              v-if="errors.budget"
              id="tender-budget-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.budget }}
            </div>
          </div>

          <div class="col-md-4">
            <label
              for="tender-activity"
              class="form-label"
            >Actividad <span aria-hidden="true">*</span></label>
            <select
              id="tender-activity"
              v-model.number="activityId"
              class="form-select"
              :class="{ 'is-invalid': errors.activity_id }"
              :disabled="activityDisabled"
              required
              :aria-invalid="Boolean(errors.activity_id)"
              :aria-describedby="errors.activity_id ? 'tender-activity-error' : undefined"
              @blur="emit('touch', 'activity_id')"
            >
              <option :value="null">
                {{ activitiesLoading ? 'Cargando actividades...' : 'Seleccione una actividad' }}
              </option>
              <option
                v-for="activity in activities"
                :key="activity.id"
                :value="activity.id"
              >
                {{ activity.product_code }} — {{ activity.product_name }}
              </option>
            </select>
            <div
              v-if="errors.activity_id"
              id="tender-activity-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.activity_id }}
            </div>
            <div
              v-if="activitiesError"
              class="alert alert-danger mt-2 mb-0 p-2"
              role="alert"
            >
              {{ activitiesError }}
              <button
                type="button"
                class="btn btn-link btn-sm p-0 ms-1"
                @click="emit('retry-activities')"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="content-card"
      aria-labelledby="schedule-heading"
    >
      <div class="content-card-header">
        <h2
          id="schedule-heading"
          class="section-title"
        >
          <span
            class="form-section-number"
            aria-hidden="true"
          >2</span>
          Cronograma
        </h2>
      </div>

      <div class="content-card-body">
        <div class="row g-3">
          <div class="col-md-6 col-xl-3">
            <label
              for="tender-start-date"
              class="form-label"
            >Fecha de inicio <span aria-hidden="true">*</span></label>
            <input
              id="tender-start-date"
              v-model="startDate"
              class="form-control"
              :class="{ 'is-invalid': errors.start_date }"
              type="date"
              required
              :aria-invalid="Boolean(errors.start_date)"
              :aria-describedby="errors.start_date ? 'tender-start-date-error' : undefined"
              @blur="emit('touch', 'start_date')"
            >
            <div
              v-if="errors.start_date"
              id="tender-start-date-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.start_date }}
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <label
              for="tender-start-time"
              class="form-label"
            >Hora de inicio <span aria-hidden="true">*</span></label>
            <input
              id="tender-start-time"
              v-model="startTime"
              class="form-control"
              :class="{ 'is-invalid': errors.start_time }"
              type="time"
              step="60"
              required
              :aria-invalid="Boolean(errors.start_time)"
              :aria-describedby="errors.start_time ? 'tender-start-time-error' : undefined"
              @blur="emit('touch', 'start_time')"
            >
            <div
              v-if="errors.start_time"
              id="tender-start-time-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.start_time }}
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <label
              for="tender-close-date"
              class="form-label"
            >Fecha de cierre <span aria-hidden="true">*</span></label>
            <input
              id="tender-close-date"
              v-model="closeDate"
              class="form-control"
              :class="{ 'is-invalid': errors.close_date }"
              type="date"
              :min="startDate || undefined"
              required
              :aria-invalid="Boolean(errors.close_date)"
              :aria-describedby="errors.close_date ? 'tender-close-date-error' : undefined"
              @blur="emit('touch', 'close_date')"
            >
            <div
              v-if="errors.close_date"
              id="tender-close-date-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.close_date }}
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <label
              for="tender-close-time"
              class="form-label"
            >Hora de cierre <span aria-hidden="true">*</span></label>
            <input
              id="tender-close-time"
              v-model="closeTime"
              class="form-control"
              :class="{ 'is-invalid': errors.close_time }"
              type="time"
              step="60"
              required
              :aria-invalid="Boolean(errors.close_time)"
              :aria-describedby="errors.close_time ? 'tender-close-time-error' : undefined"
              @blur="emit('touch', 'close_time')"
            >
            <div
              v-if="errors.close_time"
              id="tender-close-time-error"
              class="invalid-feedback d-block"
              role="alert"
            >
              {{ errors.close_time }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showActions"
        class="form-actions"
      >
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
        <button
          data-testid="submit-tender"
          type="submit"
          class="btn btn-primary"
          :disabled="!isValid || submitting || activityDisabled"
        >
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
          {{ submitting ? 'Guardando...' : submitLabel }}
        </button>
      </div>
    </section>
  </form>
</template>
