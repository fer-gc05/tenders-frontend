/**
 * Cliente HTTP y utilidades de manejo de errores para la API.
 *
 * Configura la instancia de Axios con la URL base definida en VITE_API_BASE_URL y proporciona la función toApiError para normalizar respuestas de error de la API.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Core
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import axios, { type AxiosError } from 'axios'

// Formato esperado del cuerpo de error devuelto por el backend
interface ApiErrorPayload {
  error?: string
  errors?: Record<string, string[]>
}

// Error normalizado usado por toda la aplicación para mostrar mensajes al usuario
export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// Instancia compartida de Axios con la URL base de la API y aceptación de JSON
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

// Normaliza cualquier error (Axios, Error nativo u otro) en un ApiError consistente
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const requestError = error as AxiosError<ApiErrorPayload>
    const payload = requestError.response?.data
    const validationErrors = payload?.errors

    return {
      message:
        payload?.error ??
        (requestError.response?.status === 422
          ? 'Revise los datos ingresados e intente nuevamente.'
          : 'No fue posible completar la operación.'),
      status: requestError.response?.status,
      errors: validationErrors,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'Ocurrió un error inesperado.' }
}
