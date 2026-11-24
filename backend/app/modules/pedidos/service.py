from typing import Optional

from app.core.fechas import ahora_utc, rango_de_hoy_utc
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# Máquina de estados (RN-02): ENTREGADO y CANCELADO son terminales.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(Exception):
    def __init__(self) -> None:
        super().__init__("Un producto no puede repetirse en el mismo pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, disponible: int, pedido: int):
        super().__init__(
            f"Stock insuficiente para '{nombre}': hay {disponible} y se pidieron {pedido}"
        )


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str):
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


class PedidoNoCancelable(Exception):
    def __init__(self, estado: str):
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE (estado actual: {estado})")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """RN-01: todo en una transacción. Si un ítem falla, no se guarda nada,
        tampoco los descuentos de stock de los ítems anteriores."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_activo_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, skip: int, limit: int, estado: Optional[str] = None
    ) -> PedidosPaginados:
        """RN-04: el admin ve todos; un user, solo los suyos."""
        usuario_id = None if usuario.role == "admin" else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                skip=skip, limit=limit, usuario_id=usuario_id, estado=estado
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Solo admin: avanza o cancela desde cualquier estado no terminal."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """El dueño cancela su pedido, solo si está PENDIENTE (RN-04)."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise PedidoNoCancelable(pedido.estado)
            self._transicionar(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            desde, hasta = rango_de_hoy_utc()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.contar_creados_entre(desde, hasta),
                ingresos_entregados=uow.pedidos.sumar_total("ENTREGADO"),
            )

    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_con_items(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(pedido.estado, nuevo_estado)
        if nuevo_estado == "CANCELADO":
            # RN-03: se restituye el stock en la misma transacción que el cambio de estado.
            for item in pedido.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is not None:
                    producto.stock += item.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = ahora_utc()
        uow.pedidos.add(pedido)
