# Backend API REST - Gestión de Inventario, Pedidos y Autenticación (Unidad 9)

API REST desarrollada con **FastAPI**, **SQLModel** y **PostgreSQL** para la gestión integral de categorías, productos, ingredientes, pedidos y usuarios, incorporando autenticación mediante **JWT en cookies HttpOnly**, autorización basada en roles (**RBAC**) y **borrado lógico** en todas las entidades. Corresponde al Trabajo Práctico Integrador de la Unidad 9 de **Programación IV (UTN)**.

---

## Tecnologías Utilizadas

* **Python 3.14 + FastAPI**: Framework de alto rendimiento para la exposición de endpoints REST, inyección de dependencias y documentación interactiva automática en `/docs`.
* **PostgreSQL + SQLModel (SQLAlchemy)**: Motor de base de datos relacional y ORM para el mapeo objeto-relacional y manejo de transacciones.
* **Pydantic & Pydantic Settings**: Validación estricta de esquemas de entrada/salida y lectura segura de variables de entorno (`.env`) bajo el principio *fail-fast*.
* **Seguridad Criptográfica (`bcrypt` + `python-jose 3.5.0`)**: Hashing lento de contraseñas con sal aleatoria (factor de costo 12) y firma/validación de JSON Web Tokens (`HS256`).

---

## Decisiones Arquitectónicas y de Seguridad Tomadas

### 1. Arquitectura en Capas y Patrón Unit of Work (`app/core/unit_of_work.py`)
El código se organiza en cinco capas con responsabilidades aisladas, donde cada capa conoce únicamente a la inmediata inferior:
$$\text{Router (HTTP)} \rightarrow \text{Service (Reglas de Negocio)} \rightarrow \text{Unit of Work (Transacción)} \rightarrow \text{Repository (Consultas)} \rightarrow \text{Model (Tablas)}$$

* **Patrón Repository (`BaseRepository` y repositorios por entidad)**: `app/core/repository.py` encapsula las operaciones CRUD genéricas (`create`, `get_by_id`, `get_all`), mientras que el `repository.py` de cada módulo implementa las consultas específicas de dominio (`get_activos`, `get_by_username`, `soft_delete`).
* **Transacciones Atómicas (`UnitOfWork`)**: Agrupa todas las operaciones de una petición dentro de una única sesión de base de datos, ejecutando `commit()` automáticamente al finalizar el bloque `with uow:` sin errores, o `rollback()` si ocurre cualquier excepción, evitando escrituras parciales.
* **Prevención de `DetachedInstanceError` (`expire_on_commit=False`)**: La sesión se instancia con `expire_on_commit=False` porque FastAPI serializa los esquemas de salida (`response_model`) después de cerrar el bloque `with uow:`. Esto evita errores 500 al leer los atributos de las instancias confirmadas.

### 2. Defensa en Profundidad y Gestión Segura del Entorno (`app/core/config.py`)
* **Principio *Fail-Fast***: Los secretos críticos (`POSTGRES_PASSWORD` y `SECRET_KEY` con un mínimo de 32 caracteres) no tienen valores por defecto en el código fuente. Si el archivo `.env` no los provee, la aplicación falla al iniciar en lugar de arrancar con credenciales inseguras.
* **Protección de Credenciales en Memoria**: `DATABASE_URL` se declara como `@property` estándar de Python y no como `@computed_field`, impidiendo que la contraseña de PostgreSQL aparezca expuesta en volcados accidentales de configuración (`settings.model_dump()`).

### 3. Autenticación con JWT en Cookies `HttpOnly` y CORS (`app/core/security.py` y `deps.py`)
* **Mitigación de XSS (Cross-Site Scripting)**: En lugar de devolver el token en el cuerpo JSON para que el cliente lo guarde en `localStorage`, el endpoint `POST /api/v1/auth/token` emite el JWT dentro de una cookie con el atributo `HttpOnly`. Esto impide que cualquier script inyectado en el navegador pueda leer o exfiltrar el token mediante JavaScript (`document.cookie`).
* **Mitigación de CSRF y Transporte Cross-Origin**: La cookie se configura con `samesite="lax"` y tiempo de expiración acotado (`ACCESS_TOKEN_EXPIRE_MINUTES`). En `app/main.py`, `CORSMiddleware` declara explícitamente el origen del frontend (`http://localhost:5173`) y habilita `allow_credentials=True`.
* **Lectura Exclusiva desde Cookie (`OAuth2PasswordBearerWithCookie`)**: Se extiende `OAuth2PasswordBearer` para extraer el JWT únicamente de `request.cookies.get("access_token")`, rechazando con `401 Unauthorized` cualquier intento de autenticación mediante el encabezado `Authorization: Bearer`.

### 4. Autorización por Roles (RBAC) y Revocación en Tiempo Real
La seguridad de cada petición se evalúa encadenando tres dependencias en `app/core/deps.py`:
1. **`get_current_user`**: Decodifica el JWT, verifica su firma criptográfica, fecha de expiración (`exp`) y tipo (`"type": "access"`), y recupera al usuario desde PostgreSQL (responde `401` si es inválido).
2. **`get_current_active_user`**: Comprueba en la base de datos en cada petición que el usuario no tenga `disabled = True`. Si un administrador desactiva una cuenta, su acceso se corta en el acto respondiendo `400 Bad Request («Cuenta de usuario desactivada»)` aunque su JWT aún no haya expirado.
3. **`require_role(allowed_roles)`**: Fábrica de dependencias que verifica el rol del usuario autenticado y responde `403 Forbidden` si no posee permisos suficientes:
   * **Categorías, Productos e Ingredientes**: Lectura (`GET`) habilitada para cualquier usuario autenticado (`user` o `admin`); escritura (`POST`, `PUT`, `PATCH`, `DELETE`) restringida exclusivamente al rol `admin`.
   * **Pedidos**: Creación (`POST`) y lectura (`GET`) habilitadas para `user` y `admin`; cambio de estado (`PUT`) y baja (`DELETE`) exclusivos para `admin`.

### 5. Borrado Lógico (*Soft Delete*), Reactivación e Integridad Referencial
* **Conservación Histórica**: Ningún modelo ejecuta borrados físicos (`DELETE FROM`). `Categoria`, `Producto`, `Ingrediente` y `Pedido` utilizan el campo booleano `activo: bool = True` (además de `deleted_at` en `Pedido`), mientras que `Usuario` emplea el campo `disabled: bool = False` gestionado desde los endpoints `/admin/usuarios/{id}/activar` y `/desactivar`.
* **Reactivación Inteligente**: Si un administrador intenta crear una categoría, producto o ingrediente cuyo nombre coincide con un registro dado de baja lógicamente (`activo == False`), el servicio lo reactiva (`activo = True`) y actualiza sus atributos en lugar de duplicar filas.
* **Protección de Relaciones**: No se permite desactivar una categoría si posee productos **activos** asociados (`409 Conflict`). Asimismo, el modelo `Producto` persiste listas de imágenes mediante `Column(JSON)` de SQLAlchemy y optimiza la carga de su relación muchos a muchos (`ProductoCategoria`) mediante `selectinload(Producto.categorias)` para evitar el problema de consultas $N+1$.

---

## Estructura del Proyecto

```text
backend/
├── app/
│   ├── main.py                  # Punto de entrada, lifespan (tablas + seed) y CORS
│   ├── core/
│   │   ├── config.py            # Variables de entorno con pydantic-settings
│   │   ├── database.py          # Motor SQLModel / PostgreSQL y creación de tablas
│   │   ├── deps.py              # Dependencias OAuth2 con Cookie, usuario activo y RBAC
│   │   ├── repository.py        # BaseRepository[T] genérico
│   │   ├── security.py          # Hashing bcrypt y emisión/validación de JWT
│   │   └── unit_of_work.py      # Patrón Unit of Work transaccional
│   ├── db/
│   │   └── seed.py              # Carga inicial de usuarios (admin y juan)
│   └── modules/
│       ├── usuarios/            # model.py, repository.py, service.py, router.py
│       ├── categoria/           # model.py, schema.py, repository.py, service.py, router.py
│       ├── producto/            # model.py, schema.py, repository.py, service.py, router.py
│       ├── ingrediente/         # model.py, schema.py, repository.py, service.py, router.py
│       └── pedidos/             # model.py, schemas.py, repository.py, service.py, router.py
├── .env.example                 # Plantilla de variables de entorno
├── requirements.txt             # Dependencias del proyecto
├── pedidos.http                 # Pruebas de endpoints de pedidos
└── test_endpoints.http          # Pruebas generales de la API
```
# Crear y activar el entorno virtual
cd backend
python -m venv .venv

# En Linux / macOS (Bash / Zsh):
source .venv/bin/activate
# En Linux (Fish shell):
source .venv/bin/activate.fish
# En Windows:
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar las variables de entorno
cp .env.example .env

# Desde la raíz de backend
uvicorn app.main:app --reload