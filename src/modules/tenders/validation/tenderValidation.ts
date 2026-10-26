/**
 * Reglas de validación para formularios de oferta.
 *
 * Implementa validaciones de objeto, descripción, moneda, presupuesto (número positivo con máximo dos decimales), actividad, fecha de inicio, hora de inicio, fecha de cierre, hora de cierre y validación cruzada de cierre posterior a inicio.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import type {
  TenderErrors,
  TenderField,
  TenderFormValues,
} from '../types/tender'

export type {
  TenderErrors,
  TenderField,
  TenderFormValues,
} from '../types/tender'

const currencies = ['COP', 'USD', 'EUR'] as const

// Valida que una cadena tenga formato de fecha YYYY-MM-DD y sea una fecha real
// (por ejemplo, rechaza el 31 de febrero)
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Valida que una cadena tenga formato de hora HH:mm en formato 24 horas
function isValidTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
}

// Agrega un mensaje de error a un campo solo si aún no tiene uno asignado
// Evita sobrescribir el primer error encontrado de cada campo
function addError(
  errors: TenderErrors,
  field: TenderField,
  message: string,
): void {
  if (!errors[field]) {
    errors[field] = message
  }
}

export function validateTender(values: TenderFormValues): TenderErrors {
  const errors: TenderErrors = {}
  const subject = values.subject.trim()
  const description = values.description.trim()
  const budget = values.budget.trim()

  // Validación del objeto: obligatorio, no solo espacios, máximo 150 caracteres
  if (!subject) {
    addError(errors, 'subject', 'El objeto es obligatorio.')
  } else if (values.subject.length > 150) {
    addError(errors, 'subject', 'El objeto no puede superar 150 caracteres.')
  }

  // Validación de la descripción: obligatoria, no solo espacios, máximo 400 caracteres
  if (!description) {
    addError(errors, 'description', 'La descripción es obligatoria.')
  } else if (values.description.length > 400) {
    addError(
      errors,
      'description',
      'La descripción no puede superar 400 caracteres.',
    )
  }

  // Validación de moneda: debe ser una de las tres permitidas (COP, USD, EUR)
  if (!values.currency) {
    addError(errors, 'currency', 'Seleccione una moneda.')
  } else if (!currencies.includes(values.currency)) {
    addError(errors, 'currency', 'La moneda seleccionada no es válida.')
  }

  // Validación de presupuesto: obligatorio, solo números y punto decimal,
  // máximo dos decimales y mayor que cero
  if (!budget) {
    addError(errors, 'budget', 'El presupuesto es obligatorio.')
  } else if (!/^\d+(?:\.\d{1,2})?$/.test(budget)) {
    addError(
      errors,
      'budget',
      'El presupuesto solo puede contener números y hasta dos decimales.',
    )
  } else if (Number(budget) <= 0) {
    addError(errors, 'budget', 'El presupuesto debe ser mayor que cero.')
  }

  // Validación de actividad: debe ser un número entero mayor a cero
  if (!Number.isInteger(values.activity_id) || (values.activity_id ?? 0) <= 0) {
    addError(errors, 'activity_id', 'Seleccione una actividad válida.')
  }

  // Validación de fecha de inicio: obligatoria y formato válido
  if (!values.start_date) {
    addError(errors, 'start_date', 'La fecha de inicio es obligatoria.')
  } else if (!isValidDate(values.start_date)) {
    addError(errors, 'start_date', 'La fecha de inicio no es válida.')
  }

  // Validación de hora de inicio: obligatoria y formato HH:mm válido
  if (!values.start_time) {
    addError(errors, 'start_time', 'La hora de inicio es obligatoria.')
  } else if (!isValidTime(values.start_time)) {
    addError(errors, 'start_time', 'La hora de inicio no es válida.')
  }

  // Validación de fecha de cierre: obligatoria y formato válido
  if (!values.close_date) {
    addError(errors, 'close_date', 'La fecha de cierre es obligatoria.')
  } else if (!isValidDate(values.close_date)) {
    addError(errors, 'close_date', 'La fecha de cierre no es válida.')
  }

  // Validación de hora de cierre: obligatoria y formato HH:mm válido
  if (!values.close_time) {
    addError(errors, 'close_time', 'La hora de cierre es obligatoria.')
  } else if (!isValidTime(values.close_time)) {
    addError(errors, 'close_time', 'La hora de cierre no es válida.')
  }

  // Validación cruzada: la fecha de cierre no puede ser anterior a la fecha de inicio
  const datesAreValid =
    isValidDate(values.start_date) && isValidDate(values.close_date)
  const timesAreValid =
    isValidTime(values.start_time) && isValidTime(values.close_time)

  if (datesAreValid && values.close_date < values.start_date) {
    addError(
      errors,
      'close_date',
      'La fecha de cierre no puede ser anterior a la fecha de inicio.',
    )
  } else if (
    datesAreValid &&
    timesAreValid &&
    values.close_date === values.start_date &&
    values.close_time <= values.start_time
  ) {
    // Si las fechas son iguales, la hora de cierre debe ser posterior a la hora de inicio
    addError(
      errors,
      'close_time',
      'La hora de cierre debe ser posterior a la hora de inicio.',
    )
  }

  return errors
}

export function isTenderValid(values: TenderFormValues): boolean {
  return Object.keys(validateTender(values)).length === 0
}
