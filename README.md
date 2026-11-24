# Food Store

Tienda de comidas con catálogo público, carrito, pedidos con control de stock y panel de administración.
Trabajo Práctico Integrador de **Programación IV** — Tecnicatura Universitaria en Programación (UTN).

- **Repositorio:** https://github.com/Genaro-Luna/Food-Store-UTN-PIV
- **Video de demostración:** _(pegar acá el link público del video)_
- **Autor:** Genaro Luna

| Parte | Tecnologías |
| --- | --- |
| Backend (`backend/`) | Python, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly |
| Frontend (`frontend/`) | React 19 + TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query/Form/Table, Zustand, React Router, Axios |

---

## Requisitos

| Herramienta | Versión |
| --- | --- |
| Python | 3.11 a 3.13 (probado con 3.13) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |
| Git | cualquiera reciente |

---

## Instalación y ejecución

Los comandos se muestran para Linux/macOS; en Windows (PowerShell) se indica la variante cuando cambia. En algunas distribuciones Linux el intérprete se llama `python3`.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Genaro-Luna/Food-Store-UTN-PIV.git
cd Food-Store-UTN-PIV
```

### 2. Crear la base de datos

Con PostgreSQL en ejecución:

```bash
createdb -U postgres foodstore_db
```

(También se puede crear desde pgAdmin con el nombre `foodstore_db`.)

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env               # Windows: Copy-Item .env.example .env
```

Editar `backend/.env` y completar al menos la contraseña de PostgreSQL en `DATABASE_URL` y una `SECRET_KEY` propia (ver [Variables de entorno](#variables-de-entorno)). Después:

```bash
python -m app.db.seed              # crea las tablas, los usuarios, las categorías y los productos
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación interactiva (todos los endpoints): http://localhost:8000/docs y http://localhost:8000/redoc

El seed es idempotente: se puede ejecutar varias veces sin duplicar datos.

### 4. Frontend

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
cp .env.example .env               # Windows: Copy-Item .env.example .env
pnpm install
pnpm build                         # compila y verifica los tipos
pnpm dev
```

Abrir http://localhost:5173. El frontend debe correr en el puerto **5173**: es el origen que el backend acepta por CORS (`FRONTEND_ORIGIN`). Si el puerto está ocupado, Vite se detiene en lugar de usar otro.

---

## Usuarios del seed

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `Admin1234!` |
| Cliente | `juan` | `Juan1234!` |

También se puede registrar un cliente nuevo desde `/register`.

---

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:tu_password@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar los JWT (mínimo 32 caracteres) | una cadena aleatoria larga |
| `ALGORITHM` | Algoritmo de firma del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |

Para generar una `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

### `frontend/.env`

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

---

## Funcionalidades

**Cliente**
- Catálogo público con búsqueda, filtro por categoría y paginación en el servidor.
- Carrito que persiste al recargar la página.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- «Mis pedidos» con el detalle de cada pedido y cancelación mientras está pendiente.

**Administrador** (`/admin`)
- Resumen: pedidos por estado, pedidos del día e ingresos de los entregados.
- Pedidos: filtro por estado y cambio de estado según la máquina de estados.
- ABM de productos (con stock y disponibilidad) y de categorías.
- Usuarios: activar y desactivar cuentas.

**Reglas de negocio principales**
- No se puede pedir más que el stock disponible; el stock se descuenta al crear el pedido y se restituye al cancelarlo, en la misma transacción.
- Estados: `PENDIENTE → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → ENTREGADO | CANCELADO`; `ENTREGADO` y `CANCELADO` son finales.
- El cliente solo puede cancelar sus pedidos en `PENDIENTE`; el administrador avanza o cancela cualquiera.
- Cada línea del pedido guarda una copia del nombre y del precio del producto; el total no cambia aunque después cambie el catálogo.
- Las bajas son lógicas: categorías y productos se marcan inactivos, los usuarios se desactivan y los pedidos no se borran.

---

## Arquitectura

**Backend** — módulos por dominio (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con capas Router → Service → Unit of Work → Repository → Model. Los Services abren el Unit of Work (`with`), que hace commit o rollback al salir; los Routers solo traducen HTTP. La sesión viaja en una cookie HttpOnly (`access_token`) y los permisos se validan con `get_current_user`, `get_current_active_user` y `require_role`.

**Frontend** — organizado por features que espejan los módulos del backend (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`), cada una con `pages`, `components`, `hooks`, `api` y `types`. TanStack Query maneja los datos del servidor; Zustand, la sesión (`authStore`) y el carrito (`cartStore`), ambos con `persist`. Lo transversal está en `shared/` (cliente HTTP, componentes de UI y layout).

```text
Food-Store-UTN-PIV/
├── backend/
│   ├── app/
│   │   ├── core/              # configuración, base de datos, seguridad, dependencias, Unit of Work base
│   │   ├── db/seed.py         # datos iniciales
│   │   ├── modules/           # auth, usuarios, categorias, productos, pedidos
│   │   └── main.py
│   ├── .env.example
│   ├── requirements.txt
│   └── test_endpoints.http    # pruebas manuales de todos los endpoints
└── frontend/
    ├── src/
    │   ├── features/          # auth, usuarios, categorias, productos, pedidos
    │   ├── shared/            # api, ui, components, layout, hooks, utils
    │   ├── store/             # authStore, cartStore, tema y notificaciones
    │   └── routes/            # AppRouter y ProtectedRoute
    ├── .env.example
    └── package.json
```

---

## Problemas frecuentes

- **`password authentication failed`**: la contraseña de `DATABASE_URL` no coincide con la del usuario de PostgreSQL.
- **Linux: `createdb` responde `Peer authentication failed`**: crear la base como el usuario del sistema `postgres` (`sudo -u postgres createdb foodstore_db`). Si ese usuario todavía no tiene contraseña, asignarle la que va en `DATABASE_URL`: `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu_password';"`.
- **El login funciona pero el frontend dice que no hay sesión / error de CORS**: el frontend tiene que abrirse en `http://localhost:5173` (no `127.0.0.1`) y `FRONTEND_ORIGIN` debe tener ese mismo valor.
- **Windows: «la ejecución de scripts está deshabilitada» al activar el venv**: ejecutar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` en PowerShell y volver a activarlo.
- **Volver a los datos iniciales**: borrar y recrear la base (`dropdb -U postgres foodstore_db` y `createdb -U postgres foodstore_db`) y ejecutar de nuevo `python -m app.db.seed`.
