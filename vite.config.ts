import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Configuración principal de Vite para el entorno de desarrollo y producción
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo (dev, build, test)
  const env = loadEnv(mode, process.cwd(), '')

  // Destino del proxy de desarrollo para las peticiones a /api
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || 'https://tenders-api.duckdns.org'

  return {
    // Plugins de Vue y herramientas de desarrollo
    plugins: [
      vue(),
      vueDevTools(),
    ],
    // Alias para importar módulos con @/ apuntando a ./src
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Proxy de desarrollo: redirige /api al backend y evita problemas de CORS
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
