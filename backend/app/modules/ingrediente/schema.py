from typing import Optional, Annotated
from pydantic import StringConstraints
from sqlmodel import SQLModel

NombreIngredienteValido = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class IngredienteCreate(SQLModel):
    nombre: NombreIngredienteValido


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    activo: bool = True


class IngredienteUpdate(SQLModel):
    nombre: Optional[NombreIngredienteValido] = None