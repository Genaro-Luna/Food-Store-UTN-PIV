from typing import Annotated
from fastapi import APIRouter, Depends, status
from app.core.deps import get_current_active_user, require_role
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.usuarios.model import UserPublic
from app.modules.ingrediente.schema import (
    IngredienteCreate,
    IngredienteRead,
    IngredienteUpdate,
)
from app.modules.ingrediente.service import IngredienteService

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def crear(
    ingrediente: IngredienteCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return IngredienteService(uow).crear(ingrediente)


@router.get("", response_model=list[IngredienteRead])
@router.get("/", response_model=list[IngredienteRead], include_in_schema=False)
def listar(
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return IngredienteService(uow).listar()


@router.get("/{ingrediente_id}", response_model=IngredienteRead)
def obtener(
    ingrediente_id: int,
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return IngredienteService(uow).obtener(ingrediente_id)


@router.put("/{ingrediente_id}", response_model=IngredienteRead)
@router.patch("/{ingrediente_id}", response_model=IngredienteRead, include_in_schema=False)
def actualizar(
    ingrediente_id: int,
    ingrediente: IngredienteUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return IngredienteService(uow).actualizar(ingrediente_id, ingrediente)


@router.delete("/{ingrediente_id}")
def eliminar(
    ingrediente_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        IngredienteService(uow).eliminar(ingrediente_id)
        return {"ok": True, "mensaje": "Ingrediente eliminado"}