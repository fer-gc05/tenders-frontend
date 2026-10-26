/**
 * Composable para la gestión del catálogo de actividades.
 *
 * Encapsula la carga de actividades desde la API, el estado de carga, errores y reintento de consulta.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Tenders
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { onMounted, ref } from 'vue'

import { toApiError } from '@/api/api'

import { listActivities } from '../services/activities'
import type { Activity } from '../types/tender'

export function useActivities() {
  // Lista de actividades disponibles para seleccionar en el formulario
  const activities = ref<Activity[]>([])

  // Indica si el catálogo de actividades está cargando
  const loading = ref(false)

  // Mensaje de error si falla la carga del catálogo
  const error = ref('')

  // Carga el catálogo de actividades desde el backend
  async function loadActivities(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      activities.value = await listActivities()
    } catch (requestError) {
      error.value = toApiError(requestError).message
    } finally {
      loading.value = false
    }
  }

  // Carga las actividades automáticamente al usar el composable en un componente montado
  onMounted(loadActivities)

  return {
    activities,
    loading,
    error,
    loadActivities,
  }
}
