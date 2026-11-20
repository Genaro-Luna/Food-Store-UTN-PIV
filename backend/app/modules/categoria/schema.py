from typing import Optional, Annotated
from pydantic import StringConstraints
from sqlmodel import SQLModel

NombreValido = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class CategoriaCreate(SQLModel):
    nombre: NombreValido
    descripcion: str = ""


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool = True


class CategoriaUpdate(SQLModel):
    nombre: Optional[NombreValido] = None
    descripcion: Optional[str] = None