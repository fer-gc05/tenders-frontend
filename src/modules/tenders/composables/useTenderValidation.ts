/**
 * Composable de validación de formularios de oferta.
 *
 * Implementa la validación reactiva de campos, seguimiento de campos tocados, intento de envío, errores de servidor y limpieza de estado para los formularios de creación y edición de ofertas.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { computed, ref, watch, type Ref } from 'vue'

import type { TenderErrors, TenderField, TenderFormValues } from '../types/tender'
import { validateTender } from '../validation/tenderValidation'

// Mensajes genéricos mostrados cuando el backend reporta errores por campo
const serverErrorMessages: Record<TenderField, string> = {
  subject: 'El objeto ingresado no es válido.',
  description: 'La descripción ingresada no es válida.',
  currency: 'La moneda seleccionada no es válida.',
  budget: 'El presupuesto ingresado no es válido.',
  activity_id: 'La actividad seleccionada no es válida.',
  start_date: 'La fecha de inicio no es válida.',
  start_time: 'La hora de inicio no es válida.',
  close_date: 'La fecha de cierre no es válida.',
  close_time: 'La hora de cierre no es válida.',
}

// Composable que encapsula toda la lógica de validación del formulario de oferta
export function useTenderValidation(values: Ref<TenderFormValues>) {
  // Campos que el usuario ya ha tocado (para mostrar errores progresivamente)
  const touchedFields = ref<TenderField[]>([])

  // Indica si el usuario intentó enviar el formulario
  const submitAttempted = ref(false)

  // Errores devueltos por el backend, mapeados por campo
  const serverErrors = ref<TenderErrors>({})

  // Errores locales calculados en cada cambio de los valores del formulario
  const localErrors = computed(() => validateTender(values.value))

  // Errores combinados: locales primero y luego los del servidor
  const errors = computed<TenderErrors>(() => ({
    ...localErrors.value,
    ...serverErrors.value,
  }))

  // El formulario es válido si no hay errores combinados
  const isValid = computed(() => Object.keys(errors.value).length === 0)

  // Cuando el usuario modifica cualquier campo, limpia los errores del servidor
  watch(
    values,
    () => {
      serverErrors.value = {}
    },
    { deep: true },
  )

  // Marca un campo como tocado para mostrar su error de validación
  function touch(field: TenderField): void {
    if (!touchedFields.value.includes(field)) {
      touchedFields.value = [...touchedFields.value, field]
    }
  }

  // Determina si un campo debe mostrar su error (tocado o intento de envío)
  function shouldShowError(field: TenderField): boolean {
    return submitAttempted.value || touchedFields.value.includes(field)
  }

  // Marca el intento de envío para mostrar todos los errores locales
  function markAllTouched(): void {
    submitAttempted.value = true
  }

  // Traduce los errores del backend a los mensajes genéricos definidos por campo
  function setServerErrors(apiErrors?: Record<string, string[]>): void {
    const mappedErrors: TenderErrors = {}

    for (const field of Object.keys(serverErrorMessages) as TenderField[]) {
      if (apiErrors?.[field]?.length) {
        mappedErrors[field] = serverErrorMessages[field]
      }
    }

    serverErrors.value = mappedErrors
  }

  // Limpia todos los estados de validación (tocados, intento y errores de servidor)
  function clearErrors(): void {
    touchedFields.value = []
    submitAttempted.value = false
    serverErrors.value = {}
  }

  return {
    errors,
    isValid,
    shouldShowError,
    touch,
    markAllTouched,
    setServerErrors,
    clearErrors,
  }
}
