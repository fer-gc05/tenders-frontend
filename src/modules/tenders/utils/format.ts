/**
 * Utilidades de formateo para la interfaz de SUPLOS.
 *
 * Provee funciones para formatear presupuestos, fechas, marcas de tiempo y tamaños de archivo de acuerdo a la configuración regional colombiana.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

// Formatea un valor numérico como moneda colombiana (u otra moneda) con dos decimales
export function formatBudget(value: string, currency: string): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value))
  } catch {
    return `${value} ${currency}`
  }
}

// Convierte una fecha ISO (YYYY-MM-DD) al formato colombiano DD/MM/YYYY
export function formatDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

// Devuelve solo la parte HH:MM de una hora ISO
export function formatTime(value: string): string {
  return value.slice(0, 5)
}

// Convierte una marca de tiempo ISO en formato legible YYYY-MM-DD HH:MM
export function formatTimestamp(value?: string | null): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 16).replace('T', ' ')
}
