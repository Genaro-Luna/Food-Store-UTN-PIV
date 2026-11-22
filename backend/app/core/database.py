from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _normalizar_url(url: str) -> str:
    """psycopg2 es el driver instalado: se explicita para no depender del
    driver por defecto que elija SQLAlchemy para "postgresql://"."""
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url.removeprefix("postgresql://")
    return url


DATABASE_URL = _normalizar_url(settings.DATABASE_URL)

# SQLite (solo desarrollo) necesita permitir el uso de la conexión entre hilos.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    """Crea las tablas que falten. Importar los modelos los registra en la metadata."""
    from app.modules.usuarios.models import Usuario  # noqa: F401
    from app.modules.categoria.model import Categoria  # noqa: F401
    from app.modules.producto.model import Producto, ProductoCategoria  # noqa: F401
    from app.modules.pedidos.model import Pedido, DetallePedido  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Sesión que usa el Unit of Work. expire_on_commit=False permite leer los
    objetos después del commit, cuando FastAPI serializa la respuesta."""
    return Session(engine, expire_on_commit=False)
