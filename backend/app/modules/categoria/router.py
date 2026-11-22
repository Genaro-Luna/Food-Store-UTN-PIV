from typing import Annotated
from fastapi import APIRouter, Depends, status
from app.core.deps import get_current_active_user, require_role
from app.core.legacy_uow import LegacyUnitOfWork as UnitOfWork, get_uow  # temporal
from app.modules.usuarios.schemas import UserPublic
from app.modules.categoria.schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categoria.service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def crear(
    categoria: CategoriaCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return CategoriaService(uow).crear(categoria)


@router.get("", response_model=list[CategoriaRead])
@router.get("/", response_model=list[CategoriaRead], include_in_schema=False)
def listar(
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return CategoriaService(uow).listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(
    categoria_id: int,
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return CategoriaService(uow).obtener(categoria_id)


@router.put("/{categoria_id}", response_model=CategoriaRead)
@router.patch("/{categoria_id}", response_model=CategoriaRead, include_in_schema=False)
def actualizar(
    categoria_id: int,
    categoria: CategoriaUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return CategoriaService(uow).actualizar(categoria_id, categoria)


@router.delete("/{categoria_id}")
def eliminar(
    categoria_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        CategoriaService(uow).eliminar(categoria_id)
        return {"ok": True, "mensaje": "Categoría eliminada"}