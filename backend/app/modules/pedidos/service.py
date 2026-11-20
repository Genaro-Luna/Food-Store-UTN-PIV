from app.modules.pedidos.model import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoUpdate,
    PedidoRead,
    PedidoReadWithDetalles,
)


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        self.producto_id = producto_id
        super().__init__(f"El producto con id {producto_id} no existe o está inactivo")


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        self.pedido_id = pedido_id
        super().__init__(f"El pedido con id {pedido_id} no existe o fue eliminado")


class EstadoPedidoTerminalError(Exception):
    def __init__(self, estado_actual: str):
        super().__init__(
            f"No se puede modificar un pedido en estado terminal ({estado_actual})"
        )


class PedidoService:
    def __init__(self, uow):
        self.uow = uow

    def listar(self) -> list[PedidoRead]:
        pedidos = self.uow.pedidos.get_activos()
        return [PedidoRead.model_validate(p) for p in pedidos]

    def obtener(self, pedido_id: int) -> PedidoReadWithDetalles:
        pedido = self.uow.pedidos.get_activo_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return PedidoReadWithDetalles.model_validate(pedido)

    def crear(self, data: PedidoCreate) -> PedidoReadWithDetalles:
        pedido = self.uow.pedidos.create(Pedido(estado="PENDIENTE", total=0.0))
        total = 0.0

        for item in data.detalles:
            producto = self.uow.productos.get_activo_by_id(item.producto_id)
            if producto is None:
                raise ProductoNoEncontrado(item.producto_id)

            self.uow.detalles.create(
                DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    precio_unitario=producto.precio_base,
                )
            )
            total += item.cantidad * producto.precio_base

        pedido.total = total
        self.uow.session.add(pedido)
        self.uow.session.flush()
        self.uow.session.refresh(pedido)
        return PedidoReadWithDetalles.model_validate(pedido)

    def actualizar_estado(self, pedido_id: int, data: PedidoUpdate) -> PedidoRead:
        pedido = self.uow.pedidos.get_activo_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)

        if pedido.estado in ("ENTREGADO", "CANCELADO"):
            raise EstadoPedidoTerminalError(pedido.estado)

        pedido.estado = data.estado
        self.uow.session.add(pedido)
        self.uow.session.flush()
        self.uow.session.refresh(pedido)
        return PedidoRead.model_validate(pedido)

    def eliminar(self, pedido_id: int) -> None:
        pedido = self.uow.pedidos.get_activo_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        self.uow.pedidos.soft_delete(pedido)