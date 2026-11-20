from typing import Optional, List, Annotated
from pydantic import StringConstraints
from sqlmodel import SQLModel, Field
from app.modules.categoria.schema import CategoriaRead

NombreProductoValido = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)
]


class ProductoCreate(SQLModel):
    nombre: NombreProductoValido
    descripcion: str = ""
    precio_base: float = Field(ge=0)
    disponible: bool = True
    imagen_url: List[str] = []


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    precio_base: float
    disponible: bool
    activo: bool = True
    imagen_url: List[str] = []


class ProductoUpdate(SQLModel):
    nombre: Optional[NombreProductoValido] = None
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    imagen_url: Optional[List[str]] = None


class ProductoReadFull(ProductoRead):
    categorias: list[CategoriaRead] = []