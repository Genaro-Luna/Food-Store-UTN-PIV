# Frontend SPA - Gestión Full Stack con Zustand, Axios y Autenticación (Unidad 9)

Aplicación web Single Page Application (SPA) desarrollada con **React 19**, **TypeScript** y **Vite**, integrada con un sistema de autenticación segura mediante **cookies HttpOnly**, manejo de estado global de sesión con **Zustand 5**, cliente HTTP centralizado con **Axios e interceptores**, protección de rutas por rol (**RBAC**) y gestión de datos con el ecosistema **TanStack (Query, Form y Table)**.

---

## 🚀 Stack Tecnológico

* **React 19 + TypeScript + Vite**: Construcción de interfaz reactiva con tipado estático estricto (`interfaces`, `types`, genéricos y cero uso de `any` implícito).
* **Zustand 5 (`zustand` + middleware `persist`)**: Gestión del estado global de autenticación (`useAuthStore`) sin necesidad de envolver la aplicación en proveedores (`Providers`), persistiendo únicamente los datos públicos del usuario en `sessionStorage` mediante `partialize`.
* **Axios (`axiosInstance.ts`)**: Cliente HTTP centralizado configurado con `withCredentials: true` para el envío y recepción automática de la cookie `HttpOnly` entre orígenes distintos, e interceptores globales de solicitud y respuesta.
* **TanStack Query v5 (`@tanstack/react-query`)**: Gestión del estado del servidor (*Server State*), caché, sincronización e invalidación automática tras mutaciones CRUD.
* **TanStack Form (`@tanstack/react-form`)**: Gestión reactiva y validación de formularios en las vistas de Login, Registro y modales de alta/edición de entidades.
* **TanStack Table v8 (`@tanstack/react-table`)**: Construcción de tablas interactivas con ordenamiento por columnas y paginación controlada.
* **React Router DOM v7 (`react-router-dom`)**: Navegación declarativa SPA y guardia de rutas protegidas por sesión y por rol (`<ProtectedRoute>`).
* **Tailwind CSS v4 (`@tailwindcss/vite`)**: Estilizado moderno basado en clases de utilidad.

---

## 🏗️ Arquitectura y Decisiones Técnicas

### 1. Separación de Estado Global de Sesión (Zustand) vs. Estado del Servidor (TanStack Query)
Cada herramienta cumple un rol específico sin superponerse:
* **`useAuthStore` (`src/store/authStore.ts`)**: Almacena en memoria y en `sessionStorage` los datos del usuario autenticado (`UsuarioAuth`: `id`, `username`, `full_name`, `email`, `role`, `disabled`), los indicadores de carga (`isChecking`, `isSubmitting`) y las acciones de sesión (`login`, `logout`, `checkSession`). **Nunca almacena el token JWT**, ya que el token viaja protegido en la cookie `HttpOnly` administrada por el navegador y el backend.
* **TanStack Query**: Administra la caché y las mutaciones de las entidades de negocio (`categorias`, `productos`, `ingredientes` y `admin-usuarios`). Al cerrar sesión desde el `Navbar`, se ejecuta `queryClient.clear()` para purgar cualquier dato en caché de la sesión saliente.

### 2. Persistencia con `persist`, `partialize` e Hidratación sin Parpadeos
* **Configuración de `partialize`**: El middleware `persist` serializa en `sessionStorage` exclusivamente el objeto `user` (`partialize: (state) => ({ user: state.user })`), excluyendo banderas transitorias como `isChecking`, `isSubmitting` o mensajes de `error`.
* **Verificación en Segundo Plano (`checkSession`)**: Al recargar la página (`F5`), `sessionStorage` rehidrata de inmediato el nombre y rol del usuario evitando parpadeos en la interfaz, mientras que el `useEffect` de `App.tsx` invoca `GET /api/v1/auth/me`. Si la cookie había expirado en el servidor o la cuenta fue desactivada por un administrador, `checkSession` limpia el store y redirige suavemente a `/login`.

### 3. Cliente HTTP Único e Interceptores (`src/api/axiosInstance.ts`)
* **Instancia Centralizada**: Todas las funciones de `src/api/*.actions.ts` consumen la misma instancia creada con `axios.create()`, la cual define `baseURL`, `timeout: 10000` y `withCredentials: true`.
* **Interceptor de Solicitud**: No manipula ni inyecta encabezados `Authorization: Bearer`, respetando el diseño de seguridad basado en cookies `HttpOnly`.
* **Interceptor de Respuesta y `handleApiError`**:
  1. Si detecta una respuesta `401 Unauthorized` en cualquier endpoint protegido (excluyendo `/auth/token` y `/auth/me`), ejecuta `useAuthStore.setState({ user: null })` para limpiar la sesión vencida y llevar al usuario automáticamente a `/login`.
  2. Traduce los errores de red y extrae el mensaje exacto del campo `detail` de FastAPI (`400`, `401`, `403`, `404`, `409`, `422`), exponiéndolo de forma uniforme a los componentes y formularios.

### 4. Protección de Rutas (`ProtectedRoute.tsx`) e Interfaz Condicional por Rol (RBAC)
* **Guardia de Navegación**: `<ProtectedRoute>` evalúa el estado del `AuthStore`. Si no hay sesión activa, redirige a `/login`; si la ruta exige `allowedRoles={['admin']}` (como `/admin/users`) y el usuario tiene rol `user`, lo redirige a `/unauthorized` (`403 Acceso Denegado`).
* **Adaptación Visual según Rol**:
  * **`Navbar.tsx`**: Muestra el nombre completo del usuario, una insignia con su rol (`admin` o `user`), el enlace a **Usuarios** (solo visible para `admin`) y el botón **Cerrar sesión**.
  * **Páginas CRUD (`CategoriasPage`, `ProductsPage`, `IngredientesPage`)**: Evalúan `user?.role === 'admin'`. Un usuario con rol `user` puede consultar, ordenar y paginar todos los listados, pero no ve los botones de crear, editar ni eliminar (además de contar con la protección `403 Forbidden` en el backend).

---

## 📁 Estructura de Carpetas

```text
frontend/
├── src/
│   ├── api/
│   │   ├── axiosInstance.ts        # Instancia de Axios, withCredentials e interceptores
│   │   ├── auth.actions.ts         # Peticiones de login, registro, logout, /me y admin users
│   │   ├── categorias.actions.ts   # Servicios CRUD de categorías con Axios
│   │   ├── ingredientes.actions.ts # Servicios CRUD de ingredientes con Axios
│   │   └── productos.actions.ts    # Servicios CRUD de productos con Axios
│   ├── components/
│   │   ├── CategoriaList.tsx       # Tabla genérica reutilizable con TanStack Table v8
│   │   ├── CategoriaModal.tsx      # Modal reutilizable para formularios de alta/edición
│   │   ├── Navbar.tsx              # Barra de navegación con perfil, rol y cierre de sesión
│   │   ├── ProtectedRoute.tsx      # Guardia de rutas por autenticación y por rol
│   │   └── UiStates.tsx            # Componentes de estado (LoadingState, EmptyState, ErrorState)
│   ├── pages/
│   │   ├── LoginPage.tsx           # Inicio de sesión con TanStack Form
│   │   ├── RegisterPage.tsx        # Registro de nuevos usuarios con TanStack Form
│   │   ├── CategoriasPage.tsx      # Gestión de categorías con interfaz condicional por rol
│   │   ├── ProductsPage.tsx        # Gestión de productos con interfaz condicional por rol
│   │   ├── IngredientesPage.tsx    # Gestión de ingredientes con interfaz condicional por rol
│   │   ├── AdminUsersPage.tsx      # Panel exclusivo admin para activar/desactivar usuarios
│   │   └── UnauthorizedPage.tsx    # Vista 403 de acceso denegado por permisos insuficientes
│   ├── store/
│   │   └── authStore.ts            # Store global de Zustand con middleware persist
│   ├── types/
│   │   ├── auth.types.ts           # Tipos UsuarioAuth, Role, LoginCredentials y RegisterFormValues
│   │   ├── categorias.ts           # Interfaces de Categoría
│   │   ├── ingrediente.ts          # Interfaces de Ingrediente
│   │   └── producto.ts             # Interfaces de Producto
│   ├── App.tsx                     # Configuración de rutas y verificación inicial checkSession()
│   ├── index.css                   # Importación de Tailwind CSS v4
│   └── main.tsx                    # Punto de montaje con QueryClientProvider y BrowserRouter
├── vite.config.ts
└── package.json
```


## Comandos para la instalación de dependencias y ejecución del entorno
# Instalar dependencias
cd frontend
pnpm install

# Iniciar els ervicio
pnpm dev


## Instalación de paquetes individualmente
# Núcleo de React y Vite (sin sobrescribir archivos existentes)
pnpm add react react-dom
pnpm add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom

# Enrutado, Estado del Servidor, Formularios y Tablas
pnpm add react-router-dom @tanstack/react-query @tanstack/react-form @tanstack/react-table@8

# Cliente HTTP con Interceptores y Estado Global (Unidad 9)
pnpm add axios zustand