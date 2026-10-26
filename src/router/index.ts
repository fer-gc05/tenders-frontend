/**
 * Definición de rutas de la aplicación frontend.
 *
 * Configura las rutas principales para licitaciones y actividades, con redirección de ruta desconocida al listado de licitaciones.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Core
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { createRouter, createWebHistory } from 'vue-router'

// Configuración del enrutador con historial HTML5 y carga diferida de vistas
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirige la raíz al listado de licitaciones
    {
      path: '/',
      redirect: '/tenders',
    },
    // Listado de licitaciones
    {
      path: '/tenders',
      name: 'tenders',
      component: () => import('@/modules/tenders/views/TenderListView.vue'),
    },
    // Formulario de creación de licitación
    {
      path: '/tenders/new',
      name: 'tender-create',
      component: () => import('@/modules/tenders/views/TenderCreateView.vue'),
    },
    // Detalle de una licitación existente; el parámetro :id debe ser numérico
    {
      path: '/tenders/:id(\\d+)',
      name: 'tender-detail',
      component: () => import('@/modules/tenders/views/TenderDetailView.vue'),
      props: true,
    },
    // Formulario de edición de licitación existente
    {
      path: '/tenders/:id(\\d+)/edit',
      name: 'tender-edit',
      component: () => import('@/modules/tenders/views/TenderEditView.vue'),
      props: true,
    },
    // Listado de actividades
    {
      path: '/activities',
      name: 'activities',
      component: () => import('@/modules/tenders/views/ActivityListView.vue'),
    },
    // Detalle de una actividad existente
    {
      path: '/activities/:id(\\d+)',
      name: 'activity-detail',
      component: () => import('@/modules/tenders/views/ActivityDetailView.vue'),
      props: true,
    },
    // Cualquier ruta desconocida redirige al listado de licitaciones
    {
      path: '/:pathMatch(.*)*',
      redirect: '/tenders',
    },
  ],
})

export default router
