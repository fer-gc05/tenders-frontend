<script setup lang="ts">
/**
 * Diseño principal de la aplicación.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Layouts
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

// Instancia del enrutador para detectar cambios de ruta
const router = useRouter()

// Tras cada navegación, cierra el menú móvil y actualiza el atributo aria-expanded
onMounted(() => {
  router.afterEach(() => {
    const collapse = document.getElementById('main-navigation')
    const toggler = document.querySelector('.navbar-toggler')

    if (collapse) {
      collapse.classList.remove('show')
    }

    if (toggler) {
      toggler.setAttribute('aria-expanded', 'false')
    }
  })
})
</script>

<template>
  <div class="app-shell">
    <a
      class="skip-link"
      href="#main-content"
    >Ir al contenido principal</a>

    <nav
      class="navbar navbar-expand-lg navbar-light app-navbar"
      aria-label="Navegación principal"
    >
      <div class="container">
        <RouterLink
          class="navbar-brand app-brand"
          to="/tenders"
        >
          Gestión de licitaciones
        </RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-navigation"
          aria-controls="main-navigation"
          aria-expanded="false"
          aria-label="Abrir navegación"
        >
          <span class="navbar-toggler-icon" />
        </button>

        <div
          id="main-navigation"
          class="collapse navbar-collapse"
        >
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                active-class="active"
                to="/tenders"
              >
                Licitaciones
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                active-class="active"
                to="/activities"
              >
                Actividades
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="btn btn-primary btn-sm app-nav-button"
                to="/tenders/new"
              >
                Nueva licitación
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main
      id="main-content"
      class="container py-4 py-lg-5"
    >
      <slot />
    </main>
  </div>
</template>
