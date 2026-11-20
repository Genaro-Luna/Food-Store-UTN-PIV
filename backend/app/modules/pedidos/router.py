from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.deps import get_current_active_user, require_role
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.usuarios.model import UserPublic
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoUpdate,
    PedidoRead,
    PedidoReadWithDetalles,
)
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    ProductoNoEncontrado,
    EstadoPedidoTerminalError,
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.get("", response_model=list[PedidoRead])
@router.get("/", response_model=list[PedidoRead], include_in_schema=False)
def listar_pedidos(
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return PedidoService(uow).listar()


@router.get("/{pedido_id}", response_model=PedidoReadWithDetalles)
def obtener_pedido(
    pedido_id: int,
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    try:
        with uow:
            return PedidoService(uow).obtener(pedido_id)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=PedidoReadWithDetalles, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PedidoReadWithDetalles, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def crear_pedido(
    data: PedidoCreate,
    _user: Annotated[UserPublic, Depends(require_role(["user", "admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    try:
        with uow:
            return PedidoService(uow).crear(data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{pedido_id}", response_model=PedidoRead)
def actualizar_estado_pedido(
    pedido_id: int,
    data: PedidoUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    try:
        with uow:
            return PedidoService(uow).actualizar_estado(pedido_id, data)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EstadoPedidoTerminalError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pedido(
    pedido_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    try:
        with uow:
            PedidoService(uow).eliminar(pedido_id)
            return Response(status_code=status.HTTP_204_NO_CONTENT)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))