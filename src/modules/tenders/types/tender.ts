/**
 * Definición de tipos y interfaces del dominio de licitaciones.
 *
 * Incluye tipos de moneda, estados de oferta, valores del formulario, errores, actividades, documentos, ofertas, detalles, páginas de resultados, filtros y valores de formulario de documento.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

// Monedas soportadas por el formulario de oferta
export type Currency = 'COP' | 'USD' | 'EUR'

// Estados posibles de una oferta en el sistema
export type TenderStatus = 'draft' | 'published' | 'closed'

// Valores que el usuario ingresa en el formulario de oferta
export interface TenderFormValues {
  subject: string
  description: string
  currency: Currency | ''
  budget: string
  activity_id: number | null
  start_date: string
  start_time: string
  close_date: string
  close_time: string
}

// Nombre de cada campo del formulario de oferta
export type TenderField = keyof TenderFormValues

// Mapa de errores de validación indexado por campo
export type TenderErrors = Partial<Record<TenderField, string>>

// Actividad del catálogo SC (Segmento, Familia, Clase, Producto)
export interface Activity {
  id: number
  segment_code: number
  segment_name: string
  family_code: number
  family_name: string
  class_code: number
  class_name: string
  product_code: string
  product_name: string
  created_at?: string
  updated_at?: string
}

// Documento adjunto a una oferta, ya sea nuevo o existente
export interface TenderDocument {
  id: number
  tender_id: number
  title: string
  description?: string
  extension?: string
  size?: number | null
  download_url: string
  document_date?: string | null
  extra_data?: string | null
  created_at?: string
  updated_at?: string
}

// Oferta resumida tal como se muestra en listados
export interface Tender {
  id: number
  consecutive_code: string
  subject: string
  description: string
  currency: Currency
  budget: string
  activity_id: number
  start_date: string
  start_time: string
  close_date: string
  close_time: string
  status: TenderStatus
  created_at: string
  updated_at: string
}

// Oferta completa con actividad y documentos incluidos
export interface TenderDetail extends Tender {
  activity: Activity | null
  documents: TenderDocument[]
}

// Respuesta paginada del backend para listados de ofertas
export interface TenderPage {
  data: Tender[]
  meta: {
    total: number
    current_page: number
    per_page: number
    last_page: number
  }
}

// Filtros disponibles para el listado de ofertas
export interface TenderFilters {
  search: string
  page: number
  per_page: number
  activity_id?: number
}

// Valores que el usuario ingresa para cada documento nuevo
export interface DocumentFormValues {
  title: string
  description: string
  document_date: string
  extra_data: string
  file: File | null
}
