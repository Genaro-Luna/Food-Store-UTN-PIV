from typing import Callable
from sqlmodel import Session
from app.core.database import session_factory as default_session_factory
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.categoria.repository import CategoriaRepository
from app.modules.ingrediente.repository import IngredienteRepository
from app.modules.producto.repository import ProductoRepository
from app.modules.pedidos.repository import PedidoRepository, DetallePedidoRepository


class UnitOfWorkBase:
    def __init__(
        self,
        session_factory: Callable[[], Session] = default_session_factory,
    ):
        self.session_factory = session_factory

    def __enter__(self):
        self.session: Session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()


class UnitOfWork(UnitOfWorkBase):
    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        self.ingredientes = IngredienteRepository(self.session)
        self.productos = ProductoRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        return self


def get_uow() -> UnitOfWork:
    return UnitOfWork()