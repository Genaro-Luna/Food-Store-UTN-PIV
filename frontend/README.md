# Food Store · Frontend (Unidad 10: arquitectura por features y rutas protegidas)

SPA en **React 19 + TypeScript + Vite** que consume la API REST del backend de la Unidad 9 (FastAPI + JWT en cookie `HttpOnly` + roles `user` y `admin`). El backend se reutiliza sin cambios.

En la Unidad 10 el frontend se refactorizó a una **arquitectura de módulos por feature**. Cada dominio (auth, categorías, productos e ingredientes) agrupa sus componentes, hooks, tipos y páginas en una carpeta propia. Además, las rutas se protegen por sesión y por rol con `ProtectedRoute` y `<Outlet />`, y se incorporó un estado global de interfaz (tema oscuro y notificaciones).

---

## Stack

| Tecnología | Uso en el proyecto |
|---|---|
| React 19 + TypeScript + Vite | Interfaz y tipado estricto |
| React Router 7 | Navegación, rutas anidadas y `<Outlet />` |
| Zustand 5 | Store de sesión (`authStore`) y stores de interfaz (`themeStore` con `persist`, `notificationStore`) |
| TanStack Query 5 | Estado del servidor: caché, mutaciones e invalidación, encapsulados en custom hooks |
| TanStack Form | Formularios y validación |
| TanStack Table 8 | Tablas con ordenamiento y paginación |
| Axios | Cliente HTTP con `withCredentials: true` e interceptores de 401 y 403 |
| Tailwind CSS 4 | Estilos y modo oscuro por clase (`dark:`) |

---

## Instalación y ejecución

**Requisitos:** Node.js en versión LTS (se recomienda 22), pnpm y el backend de la Unidad 9 corriendo en `http://localhost:8000`.

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

- El puerto está fijado en **5173** con `strictPort`, porque es el único origen que el CORS del backend acepta. Si el puerto está ocupado, Vite se detiene con un error en lugar de usar otro.
- La URL de la API se puede cambiar con la variable `VITE_API_URL` en un archivo `.env`. Por defecto es `http://localhost:8000`.
- `pnpm build` ejecuta `tsc` y genera el build de producción.

**Usuarios de prueba** (los crea el seed del backend):

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `juan` | `Juan1234!` | user |

---

## Estructura de features

```text
src/
├── features/
│   ├── auth/
│   │   ├── api/auth.api.ts             # login, registro, logout, /me y administración de usuarios
│   │   ├── components/RoleBadge.tsx    # insignia de rol (Navbar y tabla de usuarios)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts              # sesión: lectura del store, login, logout y registro
│   │   │   └── useAdminUsers.ts        # listado y activación/desactivación de usuarios
│   │   ├── pages/                      # LoginPage, RegisterPage, AdminUsersPage
│   │   ├── store/authStore.ts          # store de sesión SIN persist
│   │   ├── types/auth.types.ts
│   │   └── index.ts                    # barrel
│   ├── categories/
│   │   ├── api/categories.api.ts
│   │   ├── components/CategoryFormModal.tsx
│   │   ├── hooks/useCategories.ts
│   │   ├── pages/CategoriesPage.tsx
│   │   ├── types/categoria.types.ts
│   │   └── index.ts
│   ├── products/                       # misma estructura (useProducts, ProductFormModal…)
│   └── ingredients/                    # misma estructura (useIngredients, IngredientFormModal…)
├── shared/
│   ├── api/
│   │   ├── api.ts                      # instancia de Axios (withCredentials) y handleApiError
│   │   └── setupInterceptors.ts        # interceptor de 401 y 403, se importa una vez en main.tsx
│   ├── components/                     # Navbar, UnauthorizedPage, Toast, DataTable, Modal, UiStates
│   ├── hooks/useNotifyError.ts         # onError común de las mutaciones
│   └── styles/form.ts                  # clases de formularios y botones (con variantes dark:)
├── store/
│   ├── themeStore.ts                   # darkMode + toggleTheme, persist ('theme-storage')
│   └── notificationStore.ts            # mensaje, tipo y visibilidad del Toast
├── routes/
│   ├── AppRouter.tsx                   # declaración de todas las rutas
│   └── ProtectedRoute.tsx              # guardia por sesión y rol con <Outlet />
├── App.tsx                             # checkAuth + <AppRouter /> + <Toast />
└── main.tsx                            # providers e import de setupInterceptors
```

### Responsabilidad de cada carpeta dentro de una feature

| Carpeta | Responsabilidad | ¿Usa Axios o TanStack Query? |
|---|---|---|
| `api/` | Funciones que llaman a los endpoints | Axios |
| `hooks/` | `useQuery` / `useMutation`, invalidación de caché y notificaciones | TanStack Query |
| `components/` | Piezas de interfaz de la feature (por ejemplo, el formulario modal) | No |
| `pages/` | Pantallas: tabla, botones y estado de la interfaz | **No** |
| `types/` | Interfaces del dominio | No |
| `index.ts` | API pública de la feature | — |

### Reglas de arquitectura aplicadas

- **Barrels (RA-01, RA-03).** Cada feature expone su API pública en `index.ts`, y el resto de la aplicación importa **solo** desde ahí. Ejemplos:
  ```ts
  import { useAuth } from '@/features/auth';                   // ✔️
  import type { Categoria } from '@/features/categories';      // ✔️ products usa el tipo Categoria
  import { useAuthStore } from '@/features/auth/store/authStore'; // ❌ subcarpeta interna de otra feature
  ```
  Dentro de una misma feature se usan imports relativos cortos (`../hooks/useCategories`).
- **Lo compartido va en `shared/` o `store/` (RA-02).** Por ejemplo, `DataTable` y `Modal` los usan las cuatro features.
- **Alias `@/` (RA-08).** Está configurado en `vite.config.ts` (`resolve.alias`) y en `tsconfig.app.json` (`paths`), y apunta a `src/`.
- **`App.tsx` sin lógica de negocio (RA-04).** Solo tiene un `useEffect` que llama a `checkAuth` y monta `<AppRouter />` y `<Toast />`.

---

## Rutas y protección

| Ruta | Acceso |
|---|---|
| `/login`, `/register`, `/unauthorized` | Públicas: no pasan por `ProtectedRoute` |
| `/categorias`, `/productos`, `/ingredientes` | Cualquier usuario autenticado |
| `/admin/users` | Solo `admin` (`ProtectedRoute allowedRoles={['admin']}`) |
| `/categories`, `/products`, `/ingredients` | Alias que redirigen a las rutas en español |

Las rutas protegidas se declaran como **hijas** de una ruta sin `path` cuyo elemento es `ProtectedRoute`. Si los controles pasan, la página hija se dibuja en `<Outlet />`:

```tsx
<Route element={<ProtectedRoute />}>
    <Route path="/categorias" element={<CategoriesPage />} />
    ...
</Route>
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="/admin/users" element={<AdminUsersPage />} />
</Route>
```

| Estado de sesión | Rol | Resultado |
|---|---|---|
| Verificando (`status: 'checking'`) | — | Indicador de carga, sin redirigir |
| Sin sesión | — | Redirige a `/login` |
| Autenticado | `user` en una ruta de `admin` | Redirige a `/unauthorized` |
| Autenticado | Rol permitido | Muestra la página |

`ProtectedRoute` organiza la navegación, pero **no reemplaza la validación del backend**: cada petición sigue validándose en el servidor con 401 y 403.

### Manejo de 401 y 403 (`shared/api/setupInterceptors.ts`)

- **401** (sesión vencida o revocada, salvo en `/auth/token` y `/auth/me`): limpia la sesión con `clearSession()` y `ProtectedRoute` lleva al login.
- **403** (sesión válida sin permisos): muestra la notificación «Acceso denegado» **sin cerrar la sesión ni redirigir**. Para no duplicar el aviso, el `onError` de las mutaciones (`useNotifyError`) ignora los 403.

`api.ts` no importa ningún store. Los interceptores, que sí dependen del estado global, viven en un archivo aparte. Así se evita la dependencia circular `api → authStore → api`.

---

## Custom hooks por feature

| Hook | Encapsula |
|---|---|
| `useCategories` | `useQuery` de `GET /categorias` y `useMutation` de `POST`, `PUT` y `DELETE` |
| `useProducts` | Lo mismo sobre `/productos` |
| `useIngredients` | Lo mismo sobre `/ingredientes` |
| `useAuth` | Lectura del store de sesión, login, logout (con `queryClient.clear()`) y registro |
| `useAdminUsers` | Listado de usuarios y activación/desactivación |

Los hooks de las features del catálogo devuelven los datos, los estados de carga y error, y las acciones `crear`, `actualizar` y `eliminar`. También informan cada alta, edición, baja y error con el `Toast`. Las páginas no importan Axios ni TanStack Query.

---

## Estado global

| Store | Persistencia | Contenido |
|---|---|---|
| `features/auth/store/authStore.ts` | **No** (RA-09) | `user`, `status` (`checking`, `authenticated`, `unauthenticated`), `error` y las acciones `login`, `logout`, `checkAuth`, `clearSession` |
| `store/themeStore.ts` | `persist` en `localStorage` (`theme-storage`) | `darkMode`, `toggleTheme` |
| `store/notificationStore.ts` | No | `message`, `type`, `visible`, `showNotification`, `hideNotification` |

- **La sesión no se guarda en el navegador.** El JWT viaja en la cookie `HttpOnly`, que JavaScript no puede leer. Al cargar la app, `checkAuth()` consulta `GET /api/v1/auth/me`, y mientras tanto el estado `checking` cubre la espera.
- **Modo oscuro.** El botón del Navbar alterna la clase `dark` en `<html>`, que Tailwind 4 lee mediante `@custom-variant dark` en `index.css`. Al recargar, `onRehydrateStorage` vuelve a aplicar la preferencia guardada.
- **Toast.** Se monta una sola vez en `App.tsx` y se oculta solo a los 3 segundos. El campo `id` del store reinicia el temporizador aunque se repita el mismo mensaje.
