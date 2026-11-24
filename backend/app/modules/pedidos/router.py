from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]
AdminActual = Annotated[UserPublic, Depends(require_role(["admin"]))]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServicioPedidos = Annotated[PedidoService, Depends(get_pedido_service)]


def _error(codigo: int, e: Exception) -> HTTPException:
    return HTTPException(status_code=codigo, detail=str(e))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: UsuarioActual, service: ServicioPedidos):
    try:
        return service.crear(data, usuario_id=usuario.id)
    except ProductoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as e:
        raise _error(status.HTTP_400_BAD_REQUEST, e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActual,
    service: ServicioPedidos,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
):
    return service.listar(usuario, skip, limit, estado)


# Declarada antes de /{pedido_id}: si no, FastAPI intentaría leer "resumen" como id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminActual, service: ServicioPedidos):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: UsuarioActual, service: ServicioPedidos):
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except PedidoAjeno as e:
        raise _error(status.HTTP_403_FORBIDDEN, e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, _admin: AdminActual, service: ServicioPedidos
):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except TransicionInvalida as e:
        raise _error(status.HTTP_400_BAD_REQUEST, e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: UsuarioActual, service: ServicioPedidos):
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except PedidoAjeno as e:
        raise _error(status.HTTP_403_FORBIDDEN, e)
    except (PedidoNoCancelable, TransicionInvalida) as e:
        raise _error(status.HTTP_400_BAD_REQUEST, e)
