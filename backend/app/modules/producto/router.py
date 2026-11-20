from typing import Annotated
from fastapi import APIRouter, Depends, status
from app.core.deps import get_current_active_user, require_role
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.usuarios.model import UserPublic
from app.modules.producto.schema import (
    ProductoCreate,
    ProductoRead,
    ProductoUpdate,
    ProductoReadFull,
)
from app.modules.producto.service import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def crear(
    producto: ProductoCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return ProductoService(uow).crear(producto)


@router.get("", response_model=list[ProductoRead])
@router.get("/", response_model=list[ProductoRead], include_in_schema=False)
def listar(
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return ProductoService(uow).listar()


@router.get("/{producto_id}", response_model=ProductoReadFull)
def obtener(
    producto_id: int,
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return ProductoService(uow).obtener(producto_id)


@router.put("/{producto_id}", response_model=ProductoRead)
@router.patch("/{producto_id}", response_model=ProductoRead, include_in_schema=False)
def actualizar(
    producto_id: int,
    producto: ProductoUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return ProductoService(uow).actualizar(producto_id, producto)


@router.post("/{producto_id}/categorias/{categoria_id}")
def asociar_categoria(
    producto_id: int,
    categoria_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return ProductoService(uow).vincular_categoria(producto_id, categoria_id)


@router.delete("/{producto_id}")
def eliminar(
    producto_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        ProductoService(uow).eliminar(producto_id)
        return {"ok": True, "mensaje": "Producto Eliminado"}