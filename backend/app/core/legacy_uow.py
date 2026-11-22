"""TEMPORAL. Unit of Work que sigue usando el módulo pedidos hasta que se
reescriba en feature/backend-pedidos. Ahí se borra este archivo."""

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
from app.modules.productos.repository import ProductoRepository


class LegacyUnitOfWork(UnitOfWork):
    def __enter__(self):
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        return self


def get_uow() -> LegacyUnitOfWork:
    return LegacyUnitOfWork()
