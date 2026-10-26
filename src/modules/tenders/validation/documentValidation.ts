/**
 * Reglas de validación para formularios de documentos de oferta.
 *
 * Define validaciones de título, descripción, fecha, datos extra y archivo (PDF o ZIP, máximo 10 MB) para documentos asociados a una oferta.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import type { DocumentFormValues } from '../types/tender'

export type { DocumentFormValues } from '../types/tender'

export type DocumentField = keyof Omit<DocumentFormValues, 'file'> | 'file'

export type DocumentErrors = Partial<Record<DocumentField, string>>

const maximumFileSize = 10 * 1024 * 1024

// Valida que una cadena tenga formato de fecha YYYY-MM-DD y sea una fecha real
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Valida que un archivo sea PDF o ZIP basándose en su extensión y su tipo MIME
function isAllowedFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['pdf', 'zip']
  const allowedTypes = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
  ]

  return allowedExtensions.includes(extension ?? '') || allowedTypes.includes(file.type)
}

export function validateDocument(values: DocumentFormValues): DocumentErrors {
  const errors: DocumentErrors = {}

  // Validación del título: obligatorio y máximo 100 caracteres
  if (!values.title.trim()) {
    errors.title = 'El título del documento es obligatorio.'
  } else if (values.title.length > 100) {
    errors.title = 'El título no puede superar 100 caracteres.'
  }

  // Validación de la descripción: obligatoria y máximo 400 caracteres
  if (!values.description.trim()) {
    errors.description = 'La descripción del documento es obligatoria.'
  } else if (values.description.length > 400) {
    errors.description = 'La descripción no puede superar 400 caracteres.'
  }

  // Validación de fecha: opcional, pero si se envía debe ser una fecha válida
  if (values.document_date && !isValidDate(values.document_date)) {
    errors.document_date = 'La fecha del documento no es válida.'
  }

  // Validación de datos extra: opcional, máximo 255 caracteres
  if (values.extra_data.length > 255) {
    errors.extra_data = 'Los datos extra no pueden superar 255 caracteres.'
  }

  // Validación del archivo: obligatorio, máximo 10 MB y debe ser PDF o ZIP
  if (!values.file) {
    errors.file = 'Seleccione un archivo PDF o ZIP.'
  } else if (values.file.size > maximumFileSize) {
    errors.file = 'El archivo no puede superar 10 MB.'
  } else if (!isAllowedFile(values.file)) {
    errors.file = 'El archivo debe ser PDF o ZIP.'
  }

  return errors
}

export function isDocumentValid(values: DocumentFormValues): boolean {
  return Object.keys(validateDocument(values)).length === 0
}
