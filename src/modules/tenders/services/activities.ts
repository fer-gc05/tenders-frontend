/**
 * Servicios de actividades para el módulo de licitaciones.
 *
 * Provee funciones para listar el catálogo de actividades y obtener el detalle de una actividad por su identificador.
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

import type { Activity } from '../types/tender'

// Obtiene el catálogo de actividades, opcionalmente filtrado por texto de búsqueda
export async function listActivities(search = ''): Promise<Activity[]> {
  const response = await apiClient.get<{ data: Activity[] }>('/activities', {
    params: search ? { search } : undefined,
  })

  return response.data.data
}

// Obtiene el detalle de una actividad específica por su identificador
export async function getActivity(id: number): Promise<Activity> {
  const response = await apiClient.get<{ data: Activity }>(`/activities/${id}`)

  return response.data.data
}
