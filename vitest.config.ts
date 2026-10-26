import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// Configuración de Vitest para ejecutar pruebas unitarias y de componentes Vue
export default defineConfig({
  // Plugin necesario para compilar componentes .vue durante las pruebas
  plugins: [vue()],
  // Alias compartido con la aplicación para resolver importaciones @/
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Simula un navegador para pruebas del DOM
    environment: 'jsdom',
    // Expone describe/it/expect como globales
    globals: true,
    coverage: {
      // Motor de cobertura incluido en Node.js
      provider: 'v8',
      reporter: ['text', 'html'],
      // Archivos incluidos en el reporte de cobertura
      include: [
        'src/modules/tenders/validation/**/*.ts',
        'src/modules/tenders/services/**/*.ts',
        'src/api/**/*.ts',
      ],
      // Umbrales mínimos de cobertura exigidos por el proyecto
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
