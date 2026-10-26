# TenderFront

Frontend del módulo de licitaciones/ofertas. Permite crear, editar, listar, consultar y exportar ofertas con sus documentos asociados, consumiendo la API REST del backend.

## URL de producción

- **Frontend:** https://tenders-dev.duckdns.org/
- **Backend:** https://tenders-api.duckdns.org/api/v1

## Stack tecnológico

- [Vue 3](https://vuejs.org/) con Composition API
- [Vue Router](https://router.vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [Bootstrap 5.3](https://getbootstrap.com/)

## Requisitos

- Node.js `^22.18.0 || >=24.12.0`
- pnpm `9.x`

## Configuración local

1. Clona el repositorio.
2. Copia el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

3. Instala las dependencias:

   ```bash
   pnpm install
   ```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con hot reload |
| `pnpm build` | Type-check y build de producción |
| `pnpm build-only` | Build de producción sin type-check |
| `pnpm type-check` | Verificación de tipos con `vue-tsc` |
| `pnpm lint` | Linter con ESLint |
| `pnpm test` | Ejecuta las pruebas con Vitest |
| `pnpm test:coverage` | Ejecuta las pruebas con cobertura |

## Variables de entorno

| Variable | Descripción | Ejemplo desarrollo | Ejemplo producción |
|----------|-------------|--------------------|--------------------|
| `VITE_API_BASE_URL` | URL base de la API | `/api/v1` | `https://tenders-api.duckdns.org/api/v1` |
| `VITE_API_PROXY_TARGET` | Destino del proxy de Vite en desarrollo | `https://tenders-api.duckdns.org` | No aplica |

## Estructura del proyecto

```
src/
├── api/                    # Cliente HTTP (Axios)
├── assets/                 # Estilos globales
├── layouts/                # Layout principal
├── modules/tenders/        # Módulo de licitaciones
│   ├── components/         # Componentes reutilizables
│   ├── composables/        # Lógica reutilizable (composables)
│   ├── services/           # Llamadas a la API
│   ├── types/              # Tipos de TypeScript
│   ├── utils/              # Utilidades de formateo
│   ├── validation/         # Validaciones de formularios
│   └── views/              # Vistas de páginas
├── router/                 # Configuración de rutas
├── App.vue                 # Componente raíz
└── main.ts                 # Punto de entrada
```

## Despliegue

El despliegue es automático mediante GitHub Actions (`.github/workflows/deploy.yml`):

1. Se ejecuta `lint` y `type-check`.
2. Se construye la aplicación con `VITE_API_BASE_URL` apuntando a la API de producción.
3. Se sincroniza la carpeta `dist/` al VPS mediante `rsync`.
4. Se verifica que el dominio responda con `HTTP 200`.

### Secrets requeridos en GitHub

| Secret | Descripción |
|--------|-------------|
| `VPS_HOST` | Dominio del VPS (`tenders-dev.duckdns.org`) |
| `VPS_USER` | Usuario SSH del VPS |
| `SSH_DEPLOY_KEY` | Llave SSH privada para conexión al VPS |
| `VPS_PATH_FRONT` | Ruta en el VPS donde se sirve el frontend (`/var/www/tenderfront/`) |

### Configuración del servidor (Nginx)

En el VPS se sirve la carpeta `dist/` con Nginx. Un ejemplo de configuración está en `deploy/nginx-tenderfront.conf`.

Puntos clave:

- El `root` debe apuntar a `/var/www/tenderfront`.
- La SPA requiere `try_files $uri $uri/ /index.html;`.
- Los assets con hash deben tener cache largo.
- El certificado SSL se gestiona con Let's Encrypt/Certbot.

## Integración con el backend

El frontend espera que el backend permita CORS desde el dominio de producción. En el `.env` del backend:

```env
CORS_ALLOWED_ORIGIN=https://tenders-dev.duckdns.org
```

## Licencia

Privado. Uso exclusivo del proyecto.
