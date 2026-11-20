from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)


def create_db_and_tables():
    from app.modules.usuarios.model import Usuario  # noqa: F401
    from app.modules.categoria.model import Categoria  # noqa: F401
    from app.modules.producto.model import Producto, ProductoCategoria  # noqa: F401
    from app.modules.ingrediente.model import Ingrediente  # noqa: F401
    from app.modules.pedidos.model import Pedido, DetallePedido  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine, expire_on_commit=False) as session:
        yield session