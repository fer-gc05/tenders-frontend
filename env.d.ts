/// <reference types="vite/client" />

// Variables de entorno disponibles en tiempo de compilación a través de import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

// Extensión de ImportMeta para acceder a las variables de entorno tipadas
interface ImportMeta {
  readonly env: ImportMetaEnv
}
