# TenderFront

Frontend del módulo de licitaciones/ofertas. Permite crear, editar, listar, consultar y exportar ofertas con sus documentos asociados, consumiendo la API REST del backend.

La interfaz está en español; los nombres de archivos, funciones y tipos están en inglés para mantener la convención del código.

## URL de producción

- **Frontend:** https://tenders-dev.duckdns.org/
- **Backend:** https://tenders-api.duckdns.org/api/v1

## Requisitos

- Node.js `^22.18.0 || >=24.12.0`
- pnpm `9.x`

## Instalación

```bash
git clone https://github.com/fer-gc05/tenders-frontend.git
cd tenders-frontend
pnpm install
cp .env.example .env
```

Edita `.env` según el entorno. Los valores por defecto apuntan al backend de desarrollo en `https://tenders-api.duckdns.org`.

## Ejecución

### Servidor de desarrollo

```bash
pnpm dev
```

Levanta Vite en `http://localhost:5173` con proxy de `/api` al backend configurado en `VITE_API_PROXY_TARGET`.

```bash
curl http://localhost:5173
# <title>Ofertas</title>
```

### Build de producción

```bash
pnpm build
```

Ejecuta `type-check` y compila los assets en `dist/`, listos para servir como aplicación estática.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con hot reload |
| `pnpm build` | Type-check y build de producción |
| `pnpm build-only` | Build de producción sin type-check |
| `pnpm type-check` | Verificación de tipos con `vue-tsc` |
| `pnpm lint` | Linter con ESLint |
| `pnpm test` | Ejecuta las pruebas con Vitest |
| `pnpm test:coverage` | Ejecuta las pruebas con cobertura |

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL base de la API. En desarrollo puede ser `/api/v1` si se usa el proxy de Vite; en producción debe ser la URL completa del backend | `/api/v1` |
| `VITE_API_PROXY_TARGET` | Destino del proxy de desarrollo de Vite para `/api` | `https://tenders-api.duckdns.org` |

## Estructura

```
src/
├── api/
│   └── api.ts                 Cliente HTTP (Axios) y normalización de errores
├── assets/
│   ├── base.css               Variables y estilos base
│   └── main.css               Estilos de componentes, tablas, formularios y responsive
├── layouts/
│   └── MainLayout.vue         Navbar, skip-link y cierre del menú móvil
├── modules/tenders/
│   ├── components/            Componentes reutilizables (formulario, documentos, paginación, estado)
│   ├── composables/           Lógica reutilizable (catálogo de actividades, validación)
│   ├── services/              Llamadas a la API de ofertas y actividades
│   ├── types/                 Tipos de TypeScript del dominio
│   ├── utils/                 Utilidades de formateo
│   ├── validation/            Validaciones de ofertas y documentos
│   └── views/                 Vistas de páginas (listado, detalle, creación, edición, actividades)
├── router/
│   └── index.ts               Definición de rutas de la SPA
├── App.vue                    Componente raíz
└── main.ts                    Punto de entrada: Vue, router, Bootstrap
```

El flujo de una vista es: `Router → View → Composable/Service → API → Componente`. Las vistas usan composables para validación y carga de datos; los servicios centralizan el consumo de la API y la construcción de `FormData`.

### Convención de documentación

Las clases, composables, servicios y vistas llevan un encabezado que registra autoría, versión, fecha de creación, fecha de última actualización y espacio de nombres. Cada modificación añade además su entrada en el historial `@change`:

```typescript
/**
 * Cliente HTTP y utilidades de manejo de errores para la API.
 *
 * @author    Fernando Luis Gil Correa
 * @version   1.0.0
 * @since     2026-10-26
 * @updated   2026-10-26
 * @package   App\Modules\Core
 *
 * @change    1.0.0 - 2026-10-26 - Fernando Luis Gil Correa - Implementación inicial.
 */
```

| Etiqueta | Regla |
| --- | --- |
| `@author` | Autoría del código. No cambia. |
| `@version` | Versión semántica (`MAJOR.MINOR.PATCH`). Se incrementa en cada modificación. |
| `@since` | Fecha real de creación del archivo. No cambia. |
| `@updated` | Fecha de la última modificación. En la creación coincide con `@since`. |
| `@package` | Espacio de nombres o módulo al que pertenece el archivo. |
| `@change` | Historial de cambios: `versión - fecha - autor - descripción`. La más reciente primero. |

Además, el código incluye comentarios inline cortos en español que explican qué hace cada sección.

### Manejo de errores

`toApiError` en `src/api/api.ts` normaliza cualquier error (respuesta de Axios, error nativo u otro) en un objeto `ApiError` con `message`, `status` y `errors`:

| Situación | Mensaje |
| --- | --- |
| Error 422 del backend | `Revise los datos ingresados e intente nuevamente.` |
| Otro error de Axios | `No fue posible completar la operación.` o el mensaje del backend |
| Error de red u otro | Mensaje del error o `Ocurrió un error inesperado.` |

Las vistas muestran el mensaje general y, en formularios, mapean los errores de servidor a los campos correspondientes mediante `useTenderValidation`.

## Validación

La validación se divide en dos capas:

### Validación de ofertas

`src/modules/tenders/validation/tenderValidation.ts` valida los campos del formulario de oferta:

| Campo | Regla |
| --- | --- |
| `subject` | Requerido, máximo 150 caracteres, no solo espacios |
| `description` | Requerido, máximo 400 caracteres, no solo espacios |
| `currency` | Requerido, uno de `COP`, `USD`, `EUR` |
| `budget` | Requerido, numérico positivo, máximo 2 decimales |
| `activity_id` | Requerido, numérico |
| `start_date` / `start_time` | Requeridos, fecha/hora válidas |
| `close_date` / `close_time` | Requeridos, fecha/hora válidas; el cierre debe ser posterior al inicio |

### Validación de documentos

`src/modules/tenders/validation/documentValidation.ts` valida los documentos adjuntos:

| Campo | Regla |
| --- | --- |
| `title` | Requerido, máximo 100 caracteres |
| `description` | Requerido, máximo 400 caracteres |
| `document_date` | Opcional, fecha válida |
| `extra_data` | Opcional, máximo 255 caracteres |
| `file` | Requerido, formato PDF o ZIP, máximo 10 MB |

La vista `TenderEditView` exige que la oferta conserve al menos un documento (existentes + nuevos).

## Despliegue

El despliegue es automático mediante GitHub Actions (`.github/workflows/deploy.yml`):

1. Instala dependencias con pnpm.
2. Ejecuta `lint` y `type-check`.
3. Construye la aplicación con `VITE_API_BASE_URL` apuntando a la API de producción.
4. Sincroniza la carpeta `dist/` al VPS mediante `rsync --delete`.
5. Verifica que el dominio responda con `HTTP 200`.

### Secrets requeridos en GitHub

| Secret | Descripción |
| --- | --- |
| `VPS_HOST` | Dominio del VPS (`tenders-dev.duckdns.org`) |
| `VPS_USER` | Usuario SSH del VPS |
| `SSH_DEPLOY_KEY` | Llave SSH privada para conexión al VPS |
| `VPS_PATH_FRONT` | Ruta en el VPS donde se sirve el frontend (`/var/www/tenderfront/`) |

### Configuración del servidor (Nginx)

En el VPS se sirve la carpeta `dist/` con Nginx. Un ejemplo de configuración está en `deploy/nginx-tenderfront.conf`.

Puntos clave:

- El `root` debe apuntar a `/var/www/tenderfront`.
- La SPA requiere `try_files $uri $uri/ /index.html;` para que Vue Router maneje las rutas.
- Los assets con hash deben tener cache largo (`expires 1y`).
- El certificado SSL se gestiona con Let's Encrypt/Certbot.

## CORS

El frontend se consume desde un origen diferente al backend, por lo que el backend debe permitir CORS desde el dominio de producción:

```env
CORS_ALLOWED_ORIGIN=https://tenders-dev.duckdns.org,http://localhost:5173
```

Los headers CORS los emite el backend; el proxy o servidor web no debe añadirlos también, porque un header `Access-Control-Allow-Origin` duplicado hace que el navegador bloquee la respuesta.

## Rutas de la aplicación

| Ruta | Descripción |
| --- | --- |
| `/` | Redirige a `/tenders` |
| `/tenders` | Listado de licitaciones con búsqueda, paginación y exportación Excel |
| `/tenders/new` | Formulario de creación de licitación |
| `/tenders/:id` | Detalle de una licitación |
| `/tenders/:id/edit` | Formulario de edición de licitación |
| `/activities` | Catálogo de actividades |
| `/activities/:id` | Detalle de una actividad y sus ofertas asociadas |
