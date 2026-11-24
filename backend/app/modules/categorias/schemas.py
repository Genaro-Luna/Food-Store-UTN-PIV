from typing import Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel


def _limpiar_nombre(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    limpio = v.strip()
    if len(limpio) < 2:
        raise ValueError("El nombre debe tener entre 2 y 100 caracteres")
    return limpio


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        return _limpiar_nombre(v)


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: Optional[str]) -> Optional[str]:
        return _limpiar_nombre(v)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    activo: bool
