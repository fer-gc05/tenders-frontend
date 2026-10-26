/**
 * Punto de entrada de la aplicación frontend.
 *
 * Inicializa la aplicación Vue 3, instala el enrutador y monta el componente raíz en el elemento #app.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Core
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */

// Estilos y scripts de Bootstrap para el diseño base
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Estilos globales de la aplicación
import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

// Crea la aplicación Vue, registra el enrutador y la monta en el elemento #app del HTML
createApp(App).use(router).mount('#app')
