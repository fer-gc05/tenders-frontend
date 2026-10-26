/**
 * Servicios de ofertas (licitaciones) para el módulo de licitaciones.
 *
 * Provee funciones para listar, obtener, crear, actualizar, eliminar documentos y exportar a Excel las ofertas registradas en el sistema.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { apiClient } from '@/api/api'

import type {
  DocumentFormValues,
  Tender,
  TenderDetail,
  TenderFilters,
  TenderFormValues,
  TenderPage,
} from '../types/tender'

interface TenderPayload {
  subject: string
  description: string
  currency: string
  budget: string
  activity_id: number
  start_date: string
  start_time: string
  close_date: string
  close_time: string
}

interface ExportResult {
  blob: Blob
  filename: string
}

/**
 * Construye el objeto de payload para enviar a la API en la creación o edición de una oferta.
 *
 * @param values - Valores del formulario de oferta ya validados.
 * @returns Objeto con los campos esperados por el backend: subject, description, currency, budget, activity_id, start_date, start_time, close_date, close_time.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.1
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.1 - 2026-10-26 - Fernando Luis Gil Correa - Se agregan comentarios de documentación interna.
 */
function buildPayload(values: TenderFormValues): TenderPayload {
  return {
    subject: values.subject.trim(), // Se elimina espacios sobrantes antes de enviar
    description: values.description.trim(), // Se elimina espacios sobrantes antes de enviar
    currency: values.currency,
    budget: values.budget.trim(), // Se elimina espacios sobrantes antes de enviar
    activity_id: values.activity_id as number, // Se castea a número porque el backend espera integer
    start_date: values.start_date,
    start_time: values.start_time,
    close_date: values.close_date,
    close_time: values.close_time,
  }
}

/**
 * Anexa los metadatos de un documento al FormData para enviarlos junto al archivo.
 *
 * El backend espera los metadatos como arreglos paralelos: document_titles[], document_descriptions[],
 * document_dates[] y document_extras[], donde cada índice corresponde al mismo archivo en documents[].
 *
 * @param form - Instancia de FormData donde se agregarán los metadatos.
 * @param document - Objeto con los metadatos del documento (título, descripción, fecha, extra).
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.1
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.1 - 2026-10-26 - Fernando Luis Gil Correa - Se agregan comentarios de documentación interna.
 */
function appendDocumentMetadata(form: FormData, document: DocumentFormValues): void {
  form.append('document_titles[]', document.title.trim())
  form.append('document_descriptions[]', document.description.trim())
  form.append('document_dates[]', document.document_date)
  form.append('document_extras[]', document.extra_data.trim())
}

/**
 * Obtiene el listado paginado de ofertas desde la API.
 *
 * Aplica los filtros de búsqueda (search), página actual y cantidad por página.
 * Opcionalmente filtra por activity_id cuando se proporciona.
 *
 * @param filters - Filtros de búsqueda: search, page, per_page y opcionalmente activity_id.
 * @returns Objeto con los datos paginados y metadatos de paginación.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.1
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.1 - 2026-10-26 - Fernando Luis Gil Correa - Se agregan comentarios de documentación interna.
 */
export async function listTenders(filters: TenderFilters): Promise<TenderPage> {
  const params: Record<string, string | number> = {
    search: filters.search,
    page: filters.page,
    per_page: filters.per_page,
  }

  if (filters.activity_id !== undefined) {
    params.activity_id = filters.activity_id
  }

  const response = await apiClient.get<TenderPage>('/tenders', { params })

  return response.data
}

/**
 * Obtiene el detalle de una oferta por su identificador.
 *
 * @param id - Identificador numérico de la oferta.
 * @returns Objeto con el detalle completo de la oferta, incluyendo actividad y documentos.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.1
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.1 - 2026-10-26 - Fernando Luis Gil Correa - Se agregan comentarios de documentación interna.
 */
export async function getTender(id: number): Promise<TenderDetail> {
  // Llama al endpoint GET /api/v1/tenders/{id} para obtener una oferta específica
  const response = await apiClient.get<{ data: TenderDetail }>(`/tenders/${id}`)

  return response.data.data
}

/**
 * Crea una nueva oferta enviando los datos del formulario y los documentos como multipart/form-data.
 *
 * Los documentos nuevos se envían en el campo documents[] junto con sus metadatos en arreglos paralelos
 * (document_titles[], document_descriptions[], document_dates[], document_extras[]).
 *
 * @param values - Valores del formulario de oferta.
 * @param documents - Arreglo de documentos nuevos a adjuntar (opcional).
 * @returns La oferta creada con su consecutivo generado por el backend.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.1
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.1 - 2026-10-26 - Fernando Luis Gil Correa - Se agregan comentarios de documentación interna.
 */
export async function createTender(
  values: TenderFormValues,
  documents: DocumentFormValues[] = [],
): Promise<Tender> {
  const form = new FormData()
  const payload = buildPayload(values)

  // Agrega los campos del formulario al FormData para envío multipart
  form.append('subject', payload.subject)
  form.append('description', payload.description)
  form.append('currency', payload.currency)
  form.append('budget', payload.budget)
  form.append('activity_id', String(payload.activity_id))
  form.append('start_date', payload.start_date)
  form.append('start_time', payload.start_time)
  form.append('close_date', payload.close_date)
  form.append('close_time', payload.close_time)

  for (const document of documents) {
    if (!document.file) {
      continue // Se salta documentos sin archivo seleccionado
    }

    form.append('documents[]', document.file, document.file.name)
    appendDocumentMetadata(form, document)
  }

  // Envía la oferta completa (campos + archivos) al endpoint POST /api/v1/tenders
  const response = await apiClient.post<{ data: Tender }>('/tenders', form)

  return response.data.data
}

/**
 * Actualiza una oferta existente enviando los datos del formulario y los documentos nuevos como multipart/form-data.
 *
 * El backend usa el mismo endpoint POST para crear y editar. Los documentos existentes no se envían aquí;
 * solo los documentos nuevos que el usuario agregó en el formulario de edición.
 *
 * @param id - Identificador de la oferta a actualizar.
 * @param values - Valores actualizados del formulario.
 * @param documents - Documentos nuevos a adjuntar en la edición.
 * @returns La oferta actualizada con sus documentos.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.1
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.1 - 2026-10-26 - Fernando Luis Gil Correa - Se agregan comentarios de documentación interna.
 */
export async function updateTender(
  id: number,
  values: TenderFormValues,
  documents: DocumentFormValues[],
): Promise<TenderDetail> {
  const form = new FormData()
  const payload = buildPayload(values)

  // Agrega los campos actualizados al FormData para envío multipart
  form.append('subject', payload.subject)
  form.append('description', payload.description)
  form.append('currency', payload.currency)
  form.append('budget', payload.budget)
  form.append('activity_id', String(payload.activity_id))
  form.append('start_date', payload.start_date)
  form.append('start_time', payload.start_time)
  form.append('close_date', payload.close_date)
  form.append('close_time', payload.close_time)

  for (const document of documents) {
    if (!document.file) {
      continue
    }

    form.append('documents[]', document.file, document.file.name)
    appendDocumentMetadata(form, document)
  }

  // Envía la oferta actualizada (campos + archivos nuevos) al endpoint POST /api/v1/tenders/{id}
  const response = await apiClient.post<{ data: TenderDetail }>(
    `/tenders/${id}`,
    form,
  )

  return response.data.data
}

export async function deleteDocument(
  tenderId: number,
  documentId: number,
): Promise<void> {
  await apiClient.delete(`/tenders/${tenderId}/documents/${documentId}`)
}

export async function exportTenders(filters: TenderFilters): Promise<ExportResult> {
  const response = await apiClient.get<Blob>('/tenders/export', {
    params: { search: filters.search },
    responseType: 'blob',
  })
  const disposition = response.headers['content-disposition']
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/i)
  const filename = filenameMatch?.[1] ?? 'licitaciones.xlsx'

  return { blob: response.data, filename }
}

export function resolveDownloadUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

  if (path.startsWith('/api/')) {
    const apiOrigin = baseUrl.match(/^(https?:\/\/[^/]+)/i)?.[1]
    return apiOrigin ? `${apiOrigin}${path}` : path
  }

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
