"""TEMPORAL. Unit of Work con todos los repositorios, que siguen usando los
módulos categoria, producto y pedidos (y el seed) hasta que se reescriban en
feature/backend-catalogo y feature/backend-pedidos. Ahí se borra este archivo."""

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.categoria.repository import CategoriaRepository
from app.modules.producto.repository import ProductoRepository
from app.modules.pedidos.repository import PedidoRepository, DetallePedidoRepository


class LegacyUnitOfWork(UnitOfWork):
    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        return self


def get_uow() -> LegacyUnitOfWork:
    return LegacyUnitOfWork()
